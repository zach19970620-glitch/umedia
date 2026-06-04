import { pbkdf2Sync, randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const createPasswordHash = (password) => {
  const iterations = 210000;
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString(
    "base64url",
  );
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
};

const password = process.argv[2];

if (password) {
  console.log(createPasswordHash(password));
} else {
  const rl = createInterface({ input, output });
  const answer = await rl.question("Admin password: ");
  rl.close();
  console.log(createPasswordHash(answer));
}
