# Umedia Contact Form Worker

Cloudflare Worker 處理 Umedia 網站的聯繫表單提交，通過 Resend API 發送郵件通知。

## 功能特性

- ✅ CORS 跨域支持
- ✅ 表單數據驗證
- ✅ 速率限制（每 IP 每分鐘 5 次）
- ✅ 蜜罐欄位防機器人
- ✅ 垃圾郵件內容過濾
- ✅ 精美 HTML 郵件模板
- ✅ 純文本郵件備份

## 部署步驟

### 1. 安裝 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登錄 Cloudflare

```bash
npx wrangler login
```

### 3. 設置密鑰

```bash
# 設置 Resend API Key
npx wrangler secret put RESEND_API_KEY

# 設置接收郵件地址
npx wrangler secret put RECIPIENT_EMAIL
```

### 4. 部署

```bash
npm run deploy
```

### 5. 更新前端配置

部署成功後，更新 `form-config.js` 中的 Workers URL：

```javascript
window.UMEDIA_FORM_ENDPOINT = "https://umedia-contact-form.your-account.workers.dev";
```

## 環境變數

| 變數名 | 說明 | 設置方式 |
|--------|------|----------|
| `RESEND_API_KEY` | Resend API 密鑰 | `wrangler secret put` |
| `RECIPIENT_EMAIL` | 接收郵件的地址 | `wrangler secret put` |
| `FROM_EMAIL` | 發件人地址（可選） | `wrangler.toml` 或環境變數 |

## 本地開發

```bash
npm install
npm run dev
```

本地開發時，前端表單會提交到 `http://localhost:8787`。
