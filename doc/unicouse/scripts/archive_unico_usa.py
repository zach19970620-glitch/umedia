#!/usr/bin/env python3
"""Archive every published Unico USA product asset into a local folder."""

from __future__ import annotations

import csv
import hashlib
import html as htmllib
import json
import os
import re
import shutil
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlencode, urlparse, urlunparse

ROOT = Path("/Users/zach/Desktop/unicouse/unico-usa-assets")
CACHE = Path("/tmp/unico-usa/pages")
SRC_JSON = Path("/tmp/unico-usa/products.json")
HOME_HTML = Path("/tmp/unico-usa/home.html")
COLLECTIONS_JSON = Path("/tmp/unico-usa/collections.json")

BASE = "https://www.unico-usa.com"
UA = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    )
}

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"}
VID_EXT = {".mp4", ".webm", ".mov", ".m4v"}
DOC_EXT = {".pdf", ".zip"}
MEDIA_EXT = IMG_EXT | VID_EXT | DOC_EXT

PRODUCT_FOLDERS = {
    "unico-arcade-nova-blast-combo-bartop-and-base": "01-nova-blast-u2-candy-cab",
    "unico-arcade-u4-nova-blast-candy-cab-combo": "02-nova-blast-u4-candy-cab",
    "unico-arcade-nova-blast-candy-cab-u3-raiden": "03-nova-blast-u3-raiden",
    "unico-arcade-nova-blast-base": "04-nova-blast-base",
    "unico-arcade-nova-blast-stools": "05-nova-blast-stools",
    "unico-arcade-snk-mvsx": "06-snk-mvsx",
    "unico-arcade-mvsx-home-arcade-base-riser": "07-mvsx-base-riser",
    "unico-arcade-mvsx-arcade-stool": "08-mvsx-stool",
    "unico-arcade-ulm17-phoenix-series-of-arcade-crt-replacement-lcd-monitors": "09-ulm17-phoenix-17in",
    "unico-arcade-ulm19-phoenix-series-of-arcade-crt-replacement-lcd-monitors": "10-ulm19-phoenix-19in",
    "unico-arcade-ulm26-phoenix-series-of-arcade-crt-replacement-lcd-monitors": "11-ulm26-phoenix-26in",
    "unico-arcade-ulm25-ultra-arcade-crt-replacement-lcd-monitor": "12-ulm25-ultra-25in",
    "unico-arcade-ulm30-arcade-crt-replacement-lcd-monitor": "13-ulm30-30in",
    "unico-arcade-pocket-4inch-ips-gameing-handheld-black-color": "14-pocket-4inch-handheld",
    "unico-arcade-color-pocket-igs-retro-gaming-handheld": "15-color-igs-handheld",
    "unico-arcade-magsafe-gaming-power-bank-pb2": "16-pb2-magnetic-power-bank",
    "unico-arcade-lt-series-arcade-stick-tops": "17-lt-series-bat-tops",
}

SERIES = {
    "01-nova-blast-u2-candy-cab": "Nova Blast 街机柜",
    "02-nova-blast-u4-candy-cab": "Nova Blast 街机柜",
    "03-nova-blast-u3-raiden": "Nova Blast 街机柜",
    "04-nova-blast-base": "Nova Blast 街机柜",
    "05-nova-blast-stools": "Nova Blast 街机柜",
    "06-snk-mvsx": "SNK MVSX",
    "07-mvsx-base-riser": "SNK MVSX",
    "08-mvsx-stool": "SNK MVSX",
    "09-ulm17-phoenix-17in": "Phoenix / Ultra 显示器",
    "10-ulm19-phoenix-19in": "Phoenix / Ultra 显示器",
    "11-ulm26-phoenix-26in": "Phoenix / Ultra 显示器",
    "12-ulm25-ultra-25in": "Phoenix / Ultra 显示器",
    "13-ulm30-30in": "Phoenix / Ultra 显示器",
    "14-pocket-4inch-handheld": "Pocket 掌机 / 随身设备",
    "15-color-igs-handheld": "Pocket 掌机 / 随身设备",
    "16-pb2-magnetic-power-bank": "Pocket 掌机 / 随身设备",
    "17-lt-series-bat-tops": "配件",
}

print_lock = threading.Lock()


class HTMLText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip = True
        if tag in ("p", "br", "li", "h1", "h2", "h3", "h4", "tr", "div", "section"):
            self.parts.append("\n")
        if tag == "li":
            self.parts.append("- ")

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = False
        if tag in ("p", "li", "h1", "h2", "h3", "h4", "tr"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def text(self) -> str:
        t = "".join(self.parts)
        t = htmllib.unescape(t)
        t = re.sub(r"[ \t]+", " ", t)
        t = re.sub(r" *\n *", "\n", t)
        t = re.sub(r"\n{3,}", "\n\n", t)
        return t.strip()


def html_to_text(raw: str) -> str:
    p = HTMLText()
    try:
        p.feed(raw or "")
    except Exception:
        return re.sub(r"<[^>]+>", " ", raw or "")
    return p.text()


def log(msg: str) -> None:
    with print_lock:
        print(msg, flush=True)


def orig_url(u: str) -> str:
    u = (u or "").replace("\\/", "/")
    u = htmllib.unescape(u).strip()
    u = u.rstrip("\\").rstrip(".,);]")
    if u.startswith("//"):
        u = "https:" + u
    p = urlparse(u)
    q = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if k.lower() in {"v"}]
    path = re.sub(r"_\d+x\d*(?=\.[A-Za-z0-9]+$)", "", p.path)
    path = re.sub(r"_\d+x(?=\.[A-Za-z0-9]+$)", "", path)
    host = p.netloc or "www.unico-usa.com"
    return urlunparse(("https", host, path, "", urlencode(q), ""))


def filename_of(u: str) -> str:
    name = unquote(urlparse(u).path.rsplit("/", 1)[-1])
    return name or "unnamed"


def ext_of(u: str) -> str:
    name = filename_of(u).lower()
    if "." not in name:
        return ""
    return "." + name.rsplit(".", 1)[-1]


def is_media(u: str) -> bool:
    if "/cdn/shop/t/" in u or "/assets/" in u:
        return False
    ext = ext_of(u)
    if ext in MEDIA_EXT:
        return True
    if "/videos/" in u:
        return True
    return False


def kind_of(u: str) -> str:
    ext = ext_of(u)
    if ext in VID_EXT or "/videos/" in u:
        return "video"
    if ext in DOC_EXT:
        return "doc"
    return "image"


def extract_urls(text: str) -> set[str]:
    urls: set[str] = set()
    for m in re.findall(
        r"(?:https?:)?//(?:cdn\.shopify\.com|www\.unico-usa\.com/cdn/shop)[^\"'\s,)>\\]+",
        text or "",
    ):
        u = orig_url(m)
        if is_media(u):
            urls.add(u)
    return urls


def split_sections(html: str) -> list[tuple[str, str]]:
    parts = re.split(r'(?=<(?:div|section)[^>]*id="shopify-section-)', html)
    secs = []
    for part in parts:
        m = re.search(r'id="shopify-section-([^"]+)"', part)
        if m:
            secs.append((m.group(1), part))
    return secs


def youtube_ids(text: str) -> list[str]:
    found = re.findall(
        r"(?:youtube\.com/(?:embed/|watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})",
        text or "",
    )
    # de-dupe, skip channel handles mistaken as ids (channel is @unicousa not 11 chars of watch)
    out = []
    for i in found:
        if i not in out:
            out.append(i)
    return out


def safe_name(name: str) -> str:
    name = name.replace("\x00", "")
    name = re.sub(r"[\\/:*?\"<>|]", "_", name)
    name = re.sub(r"\s+", "_", name)
    return name[:180] or "file"


def numbered(prefix: str, index: int, name: str) -> str:
    return f"{prefix}-{index:02d}-{safe_name(name)}"


def fetch(url: str, dest: Path | None = None, timeout: int = 90) -> bytes:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
    if dest:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    return data


def download_one(url: str, dest: Path, retries: int = 3) -> dict:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return {"url": url, "path": str(dest), "bytes": dest.stat().st_size, "status": "exists"}
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r:
                tmp = dest.with_suffix(dest.suffix + ".part")
                with open(tmp, "wb") as f:
                    shutil.copyfileobj(r, f)
                tmp.replace(dest)
            return {"url": url, "path": str(dest), "bytes": dest.stat().st_size, "status": "ok"}
        except Exception as e:
            last_err = e
            time.sleep(0.8 * attempt)
    return {"url": url, "path": str(dest), "bytes": 0, "status": f"fail:{last_err}"}


def try_original_video(url: str) -> str:
    """Prefer Shopify original /videos/c/o/v/{id}.mp4 when the page only has a transcode."""
    m = re.search(r"/videos/c/vp/([a-f0-9]{32})/", url)
    if not m:
        return url
    hid = m.group(1)
    original = f"https://cdn.shopify.com/videos/c/o/v/{hid}.mp4"
    try:
        req = urllib.request.Request(original, method="HEAD", headers=UA)
        with urllib.request.urlopen(req, timeout=20) as r:
            if r.status == 200:
                return original
    except Exception:
        pass
    return url


def load_product(handle: str) -> dict:
    pdata = json.loads((CACHE / f"{handle}.json").read_text())["product"]
    pjs = json.loads((CACHE / f"{handle}.js").read_text())
    html = (CACHE / f"{handle}.html").read_text(encoding="utf-8", errors="ignore")
    return {"product": pdata, "js": pjs, "html": html}


def gallery_assets(product: dict, pjs: dict) -> list[dict]:
    out = []
    seen = set()
    images = product.get("images") or []
    for i, im in enumerate(images, 1):
        u = orig_url(im.get("src") or "")
        if not u or u in seen:
            continue
        seen.add(u)
        out.append(
            {
                "role": "gallery",
                "url": u,
                "alt": im.get("alt") or "",
                "width": im.get("width"),
                "height": im.get("height"),
                "position": im.get("position") or i,
                "filename": filename_of(u),
            }
        )
    for m in pjs.get("media") or []:
        mt = m.get("media_type")
        src = m.get("src") or (m.get("preview_image") or {}).get("src")
        if mt and mt != "image" and src:
            u = orig_url(src)
            if u not in seen:
                seen.add(u)
                out.append(
                    {
                        "role": "media",
                        "media_type": mt,
                        "url": u,
                        "filename": filename_of(u),
                    }
                )
    return out


def landing_assets(html: str, gallery_names: set[str]) -> list[dict]:
    out = []
    seen = set()
    for sid, body in split_sections(html):
        if not sid.startswith("template--"):
            continue
        for u in sorted(extract_urls(body)):
            name = filename_of(u)
            if name in gallery_names:
                continue
            if u in seen:
                continue
            seen.add(u)
            out.append(
                {
                    "role": "landing",
                    "section": sid.split("__", 1)[-1],
                    "url": u,
                    "filename": name,
                    "kind": kind_of(u),
                }
            )
    return out


def nav_assets(html: str) -> list[dict]:
    """Menu / header product thumbnails — saved once under _site."""
    out = []
    seen = set()
    for sid, body in split_sections(html):
        if "header" not in sid:
            continue
        for u in sorted(extract_urls(body)):
            name = filename_of(u)
            if not name.lower().startswith("menu-"):
                continue
            if u in seen:
                continue
            seen.add(u)
            out.append({"role": "nav", "url": u, "filename": name, "kind": kind_of(u)})
    return out


def homepage_campaign(html: str) -> dict:
    urls = extract_urls(html)
    ulw, videos, other = [], [], []
    for u in sorted(urls):
        f = filename_of(u).lower()
        item = {"url": u, "filename": filename_of(u), "kind": kind_of(u)}
        if "ulw10" in f or "traveller" in f:
            ulw.append(item)
        elif item["kind"] == "video" or "preview_images" in u:
            videos.append(item)
    ks = re.findall(r"https://www\.kickstarter\.com/projects/[^\"']+", html)
    ks = list(dict.fromkeys(ks))
    return {"ulw10": ulw, "videos": videos, "kickstarter": ks}


def collections_for(handle: str, coll_map: dict[str, list[str]]) -> list[str]:
    return coll_map.get(handle, [])


def build_collection_map() -> dict[str, list[str]]:
    mapping: dict[str, list[str]] = {}
    data = json.loads(COLLECTIONS_JSON.read_text())
    for c in data.get("collections") or []:
        ch = c.get("handle")
        dest = CACHE / f"collection-{ch}.json"
        if not dest.exists():
            try:
                fetch(f"{BASE}/collections/{ch}/products.json?limit=250", dest)
                time.sleep(0.15)
            except Exception as e:
                log(f"collection fail {ch}: {e}")
                continue
        try:
            payload = json.loads(dest.read_text())
        except Exception:
            continue
        title = c.get("title") or ch
        for p in payload.get("products") or []:
            mapping.setdefault(p.get("handle"), []).append(title)
    return mapping


def write_info_md(path: Path, rec: dict) -> None:
    p = rec["product"]
    variants = p.get("variants") or []
    prices = [float(v.get("price") or 0) for v in variants]
    compares = [float(v["compare_at_price"]) for v in variants if v.get("compare_at_price")]
    lines = []
    lines.append(f"# {p.get('title')}")
    lines.append("")
    lines.append(f"- 系列: {rec['series']}")
    lines.append(f"- Handle: `{p.get('handle')}`")
    lines.append(f"- 产品页: {rec['url']}")
    lines.append(f"- Vendor: {p.get('vendor') or ''}")
    lines.append(f"- 类型: {p.get('product_type') or '—'}")
    if rec.get("collections"):
        lines.append(f"- 所属集合: {', '.join(rec['collections'])}")
    if prices:
        lo, hi = min(prices), max(prices)
        price = f"${lo:.2f}" if lo == hi else f"${lo:.2f} – ${hi:.2f}"
        lines.append(f"- 售价: {price}")
    if compares:
        lines.append(f"- 原价: ${max(compares):.2f}")
    lines.append("")
    lines.append("## 变体 / SKU")
    lines.append("")
    lines.append("| 变体 | SKU | 售价 | 原价 | 库存 |")
    lines.append("|---|---|---|---|---|")
    for v in variants:
        avail = "有货" if v.get("available") else "无货"
        sku = v.get("sku") or "—"
        cmp_ = f"${float(v['compare_at_price']):.2f}" if v.get("compare_at_price") else "—"
        lines.append(
            f"| {v.get('title')} | `{sku}` | ${float(v.get('price') or 0):.2f} | {cmp_} | {avail} |"
        )
    lines.append("")
    lines.append("## 文案")
    lines.append("")
    lines.append(rec.get("description_text") or "（无）")
    lines.append("")
    if rec.get("youtube"):
        lines.append("## 外链视频")
        lines.append("")
        for yid in rec["youtube"]:
            lines.append(f"- https://www.youtube.com/watch?v={yid}")
        lines.append("")
    lines.append("## 素材清单")
    lines.append("")
    lines.append(f"- 图库 gallery: {len(rec['gallery'])} 个")
    lines.append(f"- 落地页 landing: {len(rec['landing'])} 个")
    lines.append(f"- 视频 videos: {len([a for a in rec['landing'] if a.get('kind')=='video'])} 个")
    lines.append("")
    lines.append("### 图库")
    lines.append("")
    for i, a in enumerate(rec["gallery"], 1):
        wh = f"{a.get('width')}×{a.get('height')}" if a.get("width") else ""
        alt = a.get("alt") or ""
        lines.append(f"{i}. `{a['filename']}` {wh} {alt}".rstrip())
        lines.append(f"   {a['url']}")
    lines.append("")
    lines.append("### 落地页 / 视频")
    lines.append("")
    if not rec["landing"]:
        lines.append("（无额外落地页素材）")
    for i, a in enumerate(rec["landing"], 1):
        lines.append(f"{i}. [{a.get('kind')}] `{a['filename']}`  section={a.get('section','')}")
        lines.append(f"   {a['url']}")
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    products_index = json.loads(SRC_JSON.read_text())["products"]
    log(f"products: {len(products_index)}")
    log("building collection map…")
    coll_map = build_collection_map()

    jobs = []  # (url, dest, meta)
    records = []

    # site nav thumbs from first product html
    first_html = (CACHE / f"{products_index[0]['handle']}.html").read_text(
        encoding="utf-8", errors="ignore"
    )
    site_dir = ROOT / "_site" / "nav-thumbs"
    for i, a in enumerate(nav_assets(first_html), 1):
        dest = site_dir / numbered("nav", i, a["filename"])
        jobs.append((a["url"], dest, a))

    home_html = HOME_HTML.read_text(encoding="utf-8", errors="ignore") if HOME_HTML.exists() else ""
    campaign = homepage_campaign(home_html) if home_html else {"ulw10": [], "videos": [], "kickstarter": []}
    ulw_dir = ROOT / "00-campaign-traveller-ulw10"
    ulw_dir.mkdir(parents=True, exist_ok=True)
    for i, a in enumerate(campaign["ulw10"], 1):
        dest = ulw_dir / "images" / numbered("ulw", i, a["filename"])
        jobs.append((a["url"], dest, a))
    home_vid_dir = ROOT / "_site" / "homepage-videos"
    seen_home_vid = set()
    for i, a in enumerate(campaign["videos"], 1):
        url = a["url"]
        if a["kind"] == "video":
            url = try_original_video(url)
            a = dict(a, url=url)
        key = filename_of(url)
        if key in seen_home_vid:
            continue
        seen_home_vid.add(key)
        sub = "videos" if a["kind"] == "video" else "video-posters"
        dest = home_vid_dir / sub / numbered("home", i, filename_of(url))
        jobs.append((url, dest, a))

    (ulw_dir / "info.md").write_text(
        "\n".join(
            [
                "# Traveller ULW10（Kickstarter 活动，首页主推）",
                "",
                "官网在售目录里没有独立 Shopify 商品，但首页作为主推产品展示。",
                "",
                f"- Kickstarter: {campaign['kickstarter'][0] if campaign['kickstarter'] else '—'}",
                f"- 首页素材: {len(campaign['ulw10'])} 张图",
                f"- 首页视频/封面: {len(campaign['videos'])} 个（见 `_site/homepage-videos`）",
                "",
                "## 图片",
                "",
                *[f"- `{a['filename']}`\n  {a['url']}" for a in campaign["ulw10"]],
                "",
            ]
        ),
        encoding="utf-8",
    )

    for pmeta in products_index:
        handle = pmeta["handle"]
        loaded = load_product(handle)
        product = loaded["product"]
        folder = PRODUCT_FOLDERS.get(handle, handle)
        dest_root = ROOT / "products" / folder
        dest_root.mkdir(parents=True, exist_ok=True)

        gallery = gallery_assets(product, loaded["js"])
        gal_names = {a["filename"] for a in gallery}
        landing = landing_assets(loaded["html"], gal_names)
        # upgrade video urls
        for a in landing:
            if a.get("kind") == "video":
                a["url"] = try_original_video(a["url"])
                a["filename"] = filename_of(a["url"])

        rec = {
            "handle": handle,
            "folder": folder,
            "series": SERIES.get(folder, ""),
            "url": f"{BASE}/products/{handle}",
            "title": product.get("title"),
            "vendor": product.get("vendor"),
            "product_type": product.get("product_type"),
            "tags": product.get("tags") or [],
            "collections": collections_for(handle, coll_map),
            "variants": [
                {
                    "title": v.get("title"),
                    "sku": v.get("sku"),
                    "price": v.get("price"),
                    "compare_at_price": v.get("compare_at_price"),
                    "available": v.get("available"),
                }
                for v in product.get("variants") or []
            ],
            "gallery": gallery,
            "landing": landing,
            "youtube": youtube_ids(loaded["html"]),
            "description_html": product.get("body_html") or "",
            "description_text": html_to_text(product.get("body_html") or ""),
            "product": product,
        }
        records.append(rec)

        (dest_root / "product.json").write_text(
            json.dumps(product, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        (dest_root / "description.html").write_text(rec["description_html"], encoding="utf-8")
        write_info_md(dest_root / "info.md", rec)

        for i, a in enumerate(gallery, 1):
            dest = dest_root / "gallery" / numbered("gallery", i, a["filename"])
            jobs.append((a["url"], dest, a))
        for i, a in enumerate(landing, 1):
            kind = a.get("kind") or "image"
            sub = "videos" if kind == "video" else "docs" if kind == "doc" else "landing"
            dest = dest_root / sub / numbered("landing" if kind != "video" else "video", i, a["filename"])
            jobs.append((a["url"], dest, a))

        log(
            f"{folder}: gallery={len(gallery)} landing={len(landing)} "
            f"yt={rec['youtube']} vars={len(rec['variants'])}"
        )

    # global catalog
    catalog = {
        "source": BASE,
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S %z"),
        "product_count": len(records),
        "campaign": {
            "traveller_ulw10": {
                "kickstarter": campaign["kickstarter"],
                "images": campaign["ulw10"],
            }
        },
        "products": [
            {
                k: rec[k]
                for k in (
                    "handle",
                    "folder",
                    "series",
                    "url",
                    "title",
                    "vendor",
                    "product_type",
                    "tags",
                    "collections",
                    "variants",
                    "gallery",
                    "landing",
                    "youtube",
                )
            }
            | {"description_text": rec["description_text"]}
            for rec in records
        ],
    }
    (ROOT / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    with open(ROOT / "catalog.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(
            [
                "folder",
                "series",
                "title",
                "handle",
                "url",
                "price_min",
                "price_max",
                "skus",
                "gallery_count",
                "landing_count",
                "video_count",
                "youtube",
            ]
        )
        for rec in records:
            prices = [float(v["price"]) for v in rec["variants"] if v.get("price") is not None]
            skus = " | ".join(f"{v['title']}={v.get('sku') or ''}" for v in rec["variants"])
            vids = sum(1 for a in rec["landing"] if a.get("kind") == "video")
            w.writerow(
                [
                    rec["folder"],
                    rec["series"],
                    rec["title"],
                    rec["handle"],
                    rec["url"],
                    min(prices) if prices else "",
                    max(prices) if prices else "",
                    skus,
                    len(rec["gallery"]),
                    len(rec["landing"]),
                    vids,
                    " ".join(rec["youtube"]),
                ]
            )

    write_readme(ROOT, records, campaign)

    # download unique URLs then copy into each dest
    url_to_cache: dict[str, Path] = {}
    unique_urls = []
    seen_u = set()
    for url, dest, meta in jobs:
        if url not in seen_u:
            seen_u.add(url)
            unique_urls.append(url)
    cache_dir = ROOT / "_download-cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    def cache_path_for(url: str) -> Path:
        h = hashlib.sha256(url.encode()).hexdigest()[:16]
        return cache_dir / f"{h}_{safe_name(filename_of(url))}"

    log(f"downloading {len(unique_urls)} unique files → {len(jobs)} placements")
    results = {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = {ex.submit(download_one, url, cache_path_for(url)): url for url in unique_urls}
        done = 0
        for fut in as_completed(futs):
            url = futs[fut]
            res = fut.result()
            results[url] = res
            url_to_cache[url] = Path(res["path"]) if res["status"] in {"ok", "exists"} else None
            done += 1
            if done % 15 == 0 or res["status"] not in {"ok", "exists"}:
                log(f"  {done}/{len(unique_urls)} {res['status']} {filename_of(url)}")

    copied = 0
    missing = []
    for url, dest, meta in jobs:
        src = url_to_cache.get(url)
        if not src or not src.exists() or src.stat().st_size == 0:
            missing.append(url)
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists() and dest.stat().st_size == src.stat().st_size:
            continue
        shutil.copy2(src, dest)
        copied += 1

    failed = [u for u, r in results.items() if r["status"] not in {"ok", "exists"}]
    total_bytes = sum(r.get("bytes") or 0 for r in results.values() if r["status"] in {"ok", "exists"})
    log(f"copied {copied} files, unique ok={len(unique_urls)-len(failed)} fail={len(failed)} bytes={total_bytes}")
    (ROOT / "_download-report.json").write_text(
        json.dumps(
            {
                "unique": len(unique_urls),
                "placements": len(jobs),
                "failed": failed,
                "bytes": total_bytes,
                "results": results,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    # keep cache for re-runs; user-facing tree is products/ + campaign
    log("done")


def write_readme(root: Path, records: list[dict], campaign: dict) -> None:
    lines = []
    lines.append("# Unico USA 产品素材归档")
    lines.append("")
    lines.append(f"来源: {BASE}")
    lines.append(f"抓取时间: {time.strftime('%Y-%m-%d %H:%M')}")
    lines.append("")
    lines.append("官网 Shopify 在售商品 **17** 个；另收录首页主推但未上架的 **Traveller ULW10** Kickstarter 素材。")
    lines.append("")
    lines.append("## 目录结构")
    lines.append("")
    lines.append("```")
    lines.append("unico-usa-assets/")
    lines.append("  README.md            本说明")
    lines.append("  catalog.csv          产品总表")
    lines.append("  catalog.json         完整元数据")
    lines.append("  00-campaign-traveller-ulw10/")
    lines.append("  products/<产品>/")
    lines.append("    info.md            中文规格/文案/素材清单")
    lines.append("    product.json       Shopify 原始数据")
    lines.append("    description.html   商品描述原文")
    lines.append("    gallery/           商品图库原图")
    lines.append("    landing/           产品页落地视觉（banner / 卖点图）")
    lines.append("    videos/            产品页视频")
    lines.append("  _site/               导航缩略图、首页视频")
    lines.append("```")
    lines.append("")
    lines.append("图片均为去 width 参数后的原图；Shopify 视频优先尝试 `c/o/v` 原片。")
    lines.append("")
    lines.append("## 产品一览")
    lines.append("")
    lines.append("| 文件夹 | 系列 | 产品 | 售价 | 图库 | 落地页 | 视频 |")
    lines.append("|---|---|---|---|---:|---:|---:|")
    lines.append(
        f"| `00-campaign-traveller-ulw10` | 活动 | Traveller ULW10 | Kickstarter | {len(campaign.get('ulw10') or [])} | — | 见 `_site/homepage-videos` |"
    )
    for rec in sorted(records, key=lambda r: r["folder"]):
        prices = [float(v["price"]) for v in rec["variants"] if v.get("price") is not None]
        if not prices:
            price = "—"
        elif min(prices) == max(prices):
            price = f"${min(prices):.2f}"
        else:
            price = f"${min(prices):.2f}–${max(prices):.2f}"
        vids = sum(1 for a in rec["landing"] if a.get("kind") == "video")
        if rec["youtube"]:
            vids = f"{vids}+YT"
        lines.append(
            f"| `{rec['folder']}` | {rec['series']} | [{rec['title']}]({rec['url']}) | {price} | {len(rec['gallery'])} | {len(rec['landing'])} | {vids} |"
        )
    lines.append("")
    lines.append("每个产品的规格、变体、SKU 和英文原文见对应文件夹里的 `info.md`。")
    lines.append("")
    (root / "README.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
