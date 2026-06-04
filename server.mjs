import { createReadStream, promises as fs } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { extname, isAbsolute, join, normalize, relative, resolve } from "node:path";
import {
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const contentFile = join(rootDir, "content/site.json");
const uploadDir = join(rootDir, "assets/uploads");
const port = Number(process.env.PORT || 3000);
const sessionTtlMs = 1000 * 60 * 60 * 8;
const maxUploadBytes = 5 * 1024 * 1024;
const sessions = new Map();
const loginAttempts = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Robots-Tag": "noindex",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(payload));
};

const parseCookies = (req) => {
  const header = req.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)]),
  );
};

const readBody = async (req, maxBytes = 1024 * 1024) =>
  new Promise((resolveBody, rejectBody) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
        rejectBody(new Error("請求內容過大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolveBody({});
        return;
      }
      try {
        resolveBody(JSON.parse(body));
      } catch {
        rejectBody(new Error("JSON 格式錯誤"));
      }
    });
    req.on("error", rejectBody);
  });

const getPasswordHash = () => {
  const hash = process.env.UMEDIA_ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error("後台密碼尚未配置");
  }
  return hash;
};

const createPasswordHash = (password) => {
  const iterations = 210000;
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString(
    "base64url",
  );
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [algorithm, iterationsValue, salt, hash] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsValue || !salt || !hash) {
    return false;
  }

  const iterations = Number(iterationsValue);
  const expected = Buffer.from(hash, "base64url");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, "sha256");

  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
};

const cleanSessions = () => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
};

const isAuthenticated = (req) => {
  cleanSessions();
  const token = parseCookies(req).umedia_admin;
  return Boolean(token && sessions.get(token)?.expiresAt > Date.now());
};

const cookieSecuritySuffix = (req) => {
  const isHttps =
    req.headers["x-forwarded-proto"] === "https" ||
    req.socket.encrypted ||
    process.env.NODE_ENV === "production";

  return isHttps ? "; Secure" : "";
};

const setSession = (req, res) => {
  const token = randomBytes(32).toString("base64url");
  sessions.set(token, { expiresAt: Date.now() + sessionTtlMs });

  res.setHeader(
    "Set-Cookie",
    `umedia_admin=${encodeURIComponent(
      token,
    )}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${sessionTtlMs / 1000}${cookieSecuritySuffix(req)}`,
  );
};

const clearSession = (req, res) => {
  const token = parseCookies(req).umedia_admin;
  if (token) sessions.delete(token);
  res.setHeader(
    "Set-Cookie",
    `umedia_admin=; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=0${cookieSecuritySuffix(req)}`,
  );
};

const handleAuth = async (req, res) => {
  if (req.method === "GET") {
    sendJson(res, 200, { ok: true, authenticated: isAuthenticated(req) });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  const input = await readBody(req);
  const password = String(input.password || "");
  const storedHash = getPasswordHash();
  const clientKey = getClientKey(req);

  if (isLoginLimited(clientKey)) {
    sendJson(res, 429, { ok: false, message: "嘗試次數過多，請稍後再試" });
    return;
  }

  if (!password || !verifyPassword(password, storedHash)) {
    recordLoginFailure(clientKey);
    sendJson(res, 401, { ok: false, message: "密碼錯誤" });
    return;
  }

  clearLoginFailures(clientKey);
  setSession(req, res);
  sendJson(res, 200, { ok: true, authenticated: true });
};

const handleLogout = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  clearSession(req, res);
  sendJson(res, 200, { ok: true, authenticated: false });
};

const handleContent = async (req, res) => {
  if (!isAuthenticated(req)) {
    sendJson(res, 401, { ok: false, message: "請先登入" });
    return;
  }

  if (req.method === "GET") {
    const raw = await fs.readFile(contentFile, "utf8");
    sendJson(res, 200, { ok: true, content: JSON.parse(raw) });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  const input = await readBody(req);
  if (!input.content || typeof input.content !== "object") {
    sendJson(res, 400, { ok: false, message: "保存內容格式錯誤" });
    return;
  }

  if (!isValidContentShape(input.content)) {
    sendJson(res, 400, { ok: false, message: "內容缺少必要欄位，請重新載入後再保存" });
    return;
  }

  const json = `${JSON.stringify(input.content, null, 2)}\n`;
  const tmpFile = `${contentFile}.tmp`;
  await fs.writeFile(tmpFile, json, "utf8");
  await fs.rename(tmpFile, contentFile);
  sendJson(res, 200, { ok: true });
};

const getClientKey = (req) => {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();
  return forwardedFor || req.socket.remoteAddress || "unknown";
};

const isLoginLimited = (clientKey) => {
  const attempt = loginAttempts.get(clientKey);
  if (!attempt) return false;

  if (attempt.lockedUntil <= Date.now()) {
    loginAttempts.delete(clientKey);
    return false;
  }

  return true;
};

const recordLoginFailure = (clientKey) => {
  const now = Date.now();
  const attempt = loginAttempts.get(clientKey) || {
    count: 0,
    firstAt: now,
    lockedUntil: 0,
  };

  if (now - attempt.firstAt > 15 * 60 * 1000) {
    attempt.count = 0;
    attempt.firstAt = now;
  }

  attempt.count += 1;
  if (attempt.count >= 8) {
    attempt.lockedUntil = now + 10 * 60 * 1000;
  }

  loginAttempts.set(clientKey, attempt);
};

const clearLoginFailures = (clientKey) => {
  loginAttempts.delete(clientKey);
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const hasString = (source, key) => typeof source[key] === "string";

const isValidContentShape = (content) => {
  if (!isPlainObject(content)) return false;
  if (!isPlainObject(content.site) || !isPlainObject(content.home)) return false;
  if (!isPlainObject(content.products) || !isPlainObject(content.contact)) return false;
  if (!isPlainObject(content.pages)) return false;
  if (!isPlainObject(content.products.ua32) || !isPlainObject(content.products.ua55)) return false;

  return (
    hasString(content.site, "brand") &&
    hasString(content.site, "headerCta") &&
    hasString(content.home, "heroTitle") &&
    hasString(content.home, "heroCopy") &&
    hasString(content.products.ua32, "title") &&
    hasString(content.products.ua55, "title") &&
    hasString(content.contact, "title")
  );
};

const allowedUploads = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const matchesImageSignature = (mimeType, bytes) => {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return bytes.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  }

  if (mimeType === "image/webp") {
    return (
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
};

const handleUpload = async (req, res) => {
  if (!isAuthenticated(req)) {
    sendJson(res, 401, { ok: false, message: "請先登入" });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, message: "Method not allowed" });
    return;
  }

  const input = await readBody(req, maxUploadBytes * 2);
  const mimeType = String(input.type || "");
  const base64 = String(input.data || "");

  if (!allowedUploads.has(mimeType)) {
    sendJson(res, 400, { ok: false, message: "只支援 JPG、PNG 或 WebP 圖片" });
    return;
  }

  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length || bytes.length > maxUploadBytes) {
    sendJson(res, 400, { ok: false, message: "圖片大小不能超過 5MB" });
    return;
  }

  if (!matchesImageSignature(mimeType, bytes)) {
    sendJson(res, 400, { ok: false, message: "圖片文件格式不正確" });
    return;
  }

  const ext = allowedUploads.get(mimeType);
  const safeName = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(join(uploadDir, safeName), bytes);

  sendJson(res, 200, {
    ok: true,
    path: `/assets/uploads/${safeName}`,
  });
};

const resolveStaticFile = async (pathname) => {
  let cleanPath = decodeURIComponent(pathname.split("?")[0]);
  if (cleanPath.endsWith("/")) cleanPath += "index.html";

  const absolutePath = normalize(join(rootDir, cleanPath));
  const pathFromRoot = relative(rootDir, absolutePath);
  if (pathFromRoot.startsWith("..") || isAbsolute(pathFromRoot)) return null;

  const stat = await fs.stat(absolutePath).catch(() => null);
  if (stat?.isFile()) return absolutePath;

  if (stat?.isDirectory()) {
    const indexFile = join(absolutePath, "index.html");
    const indexStat = await fs.stat(indexFile).catch(() => null);
    if (indexStat?.isFile()) return indexFile;
  }

  return null;
};

const serveStatic = async (req, res, pathname) => {
  const file = await resolveStaticFile(pathname);
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = extname(file).toLowerCase();
  const isFreshContent =
    file.endsWith("content/site.json") ||
    file.endsWith(join("admin", "index.html")) ||
    file.endsWith(join("admin", "admin.js")) ||
    file.endsWith(join("admin", "admin.css"));

  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": isFreshContent ? "no-cache" : "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(file).pipe(res);
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/admin/api/auth") {
      await handleAuth(req, res);
      return;
    }

    if (url.pathname === "/admin/api/logout") {
      await handleLogout(req, res);
      return;
    }

    if (url.pathname === "/admin/api/content") {
      await handleContent(req, res);
      return;
    }

    if (url.pathname === "/admin/api/upload") {
      await handleUpload(req, res);
      return;
    }

    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: error instanceof Error ? error.message : "服務器錯誤",
    });
  }
});

server.listen(port, () => {
  console.log(`Umedia website running at http://localhost:${port}`);
});

export { createPasswordHash };
