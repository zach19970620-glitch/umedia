# Umedia 官方網站

Umedia AI 智慧雲店與智慧廣告機解決方案官方網站。

## 技術架構

- **前端**：純靜態 HTML/CSS/JS
- **托管**：Cloudflare Pages
- **表單 API**：Cloudflare Workers + Resend
- **域名**：Cloudflare DNS

## 目錄結構

```
umedia-website/
├── index.html              # 首頁
├── about/                  # 關於頁
├── contact/                # 聯繫頁
├── platform/               # Unico 系統頁
├── products/               # 產品頁 (UA32, UA55)
├── solutions/              # 行業方案頁
├── technology/             # 核心技術頁
├── assets/                 # 圖片資源
├── styles.css              # 全站樣式
├── script.js               # 前端互動與表單提交
├── form-config.js          # 表單 API 配置
├── worker/                 # Cloudflare Worker (聯繫表單 API)
│   ├── src/index.js
│   ├── wrangler.toml
│   └── package.json
├── wrangler.toml           # Pages 部署配置
├── package.json            # npm 配置
└── DEPLOY.md               # 部署文檔
```

## 本地開發

```bash
# 安裝依賴
npm install

# 本地預覽
npm run dev
```

## 部署

詳見 [DEPLOY.md](DEPLOY.md)

### 快速部署

```bash
# 1. 部署聯繫表單 Worker
cd worker
npx wrangler deploy

# 2. 部署靜態網站
cd ..
npm run deploy
```

## 聯繫表單

表單通過 Cloudflare Workers 處理，使用 Resend API 發送郵件。

配置在 `form-config.js` 中：

```js
window.UMEDIA_FORM_ENDPOINT = "https://umedia-contact-form.your-account.workers.dev";
```

## 社交媒體

- Facebook: https://www.facebook.com/profile.php?id=61554776982011
