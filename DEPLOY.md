# Umedia 網站部署指南

## 架構

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare                            │
│  ┌─────────────────┐    ┌─────────────────────────┐   │
│  │  Pages (靜態網站) │    │  Workers (聯繫表單 API)  │   │
│  │  umedia-website  │───▶│  umedia-contact-form    │   │
│  └─────────────────┘    └─────────────────────────┘   │
│         │                                               │
│         │         ┌─────────────┐                     │
│         └────────▶│  Resend     │                     │
│                   │  (郵件發送)  │                     │
│                   └─────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## 部署步驟

### 1. 部署聯繫表單 Worker

```bash
cd worker
npm install

# 登錄 Cloudflare（如果尚未登錄）
npx wrangler login

# 設置密鑰
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RECIPIENT_EMAIL

# 部署
npx wrangler deploy
```

部署成功後記下 Worker URL，例如：
```
https://umedia-contact-form.your-account.workers.dev
```

### 2. 更新表單配置

修改 `form-config.js`，填入實際的 Worker URL：

```javascript
window.UMEDIA_FORM_ENDPOINT = "https://umedia-contact-form.your-account.workers.dev";
```

### 3. 部署靜態網站到 Pages

#### 方法一：通過 Wrangler CLI 部署

```bash
# 在項目根目錄
npm install

# 開發預覽
npm run dev

# 部署到生產環境
npm run deploy
```

#### 方法二：通過 Git 集成自動部署（推薦）

1. 將代碼推送到 GitHub
2. 在 Cloudflare Dashboard 中創建 Pages 項目
3. 連接 GitHub 倉庫
4. 設置構建命令：`npm run deploy`
5. 每次推送代碼會自動部署

### 4. 配置自定義域名

1. 在 Cloudflare Dashboard 中添加自定義域名
2. 確保域名 DNS 指向 Cloudflare
3. 配置 SSL/TLS 證書（自動）

## 環境變數

### Worker 環境變數

| 變數名 | 說明 | 設置方式 |
|--------|------|----------|
| `RESEND_API_KEY` | Resend API 密鑰 | `wrangler secret put` |
| `RECIPIENT_EMAIL` | 接收郵件的地址 | `wrangler secret put` |
| `FROM_EMAIL` | 發件人地址 | `wrangler.toml` |

### Pages 環境變數

無需額外設置，純靜態網站。

## 緩存策略

| 文件類型 | 緩存策略 |
|----------|----------|
| HTML | 不緩存 (`max-age=0`) |
| CSS/JS | 長期緩存 (`max-age=31536000`) |
| 圖片/資源 | 長期緩存 (`max-age=31536000`) |

## 監控

- **Pages Analytics**：Cloudflare Dashboard → Pages → 項目 → Analytics
- **Workers Analytics**：Cloudflare Dashboard → Workers → 項目 → Analytics
- **郵件發送記錄**：Resend Dashboard → Logs

## 故障排查

### 表喫提交失敗

1. 檢查瀏覽器控制台是否有 CORS 錯誤
2. 確認 `form-config.js` 中的 URL 正確
3. 檢查 Worker 日誌：`npx wrangler tail`

### 郵件未收到

1. 檢查 Resend Dashboard 中的發送記錄
2. 確認 `RECIPIENT_EMAIL` 設置正確
3. 檢查垃圾郵件文件夾

### 網站更新未生效

1. 確認已推送代碼到正確分支
2. 檢查 Pages 構建日誌
3. 清除瀏覽器緩存（Ctrl+Shift+R）
