# umedia-television

Umedia 純靜態網站。

## 目錄結構

- `index.html`：首頁
- `platform/`：Unico 系統頁
- `products/`：UA32、UA55 產品頁
- `solutions/`：行業方案頁
- `technology/`：核心技術頁
- `about/`：關於頁
- `contact/`：聯絡頁
- `assets/`：圖片資源
- `styles.css`：全站樣式
- `script.js`：前端互動與表單提交
- `form-config.js`：聯絡表單提交地址配置

## 本地預覽

可以直接打開 `index.html`，也可以用任意靜態服務器預覽：

```bash
python3 -m http.server 3000
```

打開：

```text
http://localhost:3000/
```

## 部署

把以下文件和目錄上傳到服務器網站根目錄即可：

```text
about/
assets/
contact/
platform/
products/
solutions/
technology/
form-config.js
index.html
script.js
styles.css
```

## Nginx 示例

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.hkumedia.com;

    root /var/www/umedia-website;
    index index.html;

    location /assets/ {
        try_files $uri =404;
    }

    location ~* \.(?:js|mjs|css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf)$ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 聯絡表單

如果需要啟用表單提交，在 `form-config.js` 中配置提交地址：

```js
window.UMEDIA_FORM_ENDPOINT = "https://example.com/your-form-endpoint";
```

如果不配置，表單會提示尚未設定提交地址。
