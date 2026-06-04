# 自有服务器 Node 内容后台部署说明

这个网站现在使用“静态页面 + 自托管 Node 后台”的方式管理内容。

前台页面读取：

- `content/site.json`

后台入口：

- `/admin/`

后台 API：

- `/admin/api/auth`
- `/admin/api/content`

## 服务器要求

- Nginx 或 Apache
- Node.js 18+
- 可用 PM2 / systemd / Docker 运行 Node 服务
- 网站目录内的 `content/site.json` 对 Node 运行用户可写
- 网站目录内的 `assets/uploads/` 对 Node 运行用户可写，用于后台上传图片

## 配置后台密码

在服务器上生成密码 hash：

```bash
npm run hash-password -- "你的强密码"
```

把输出结果配置为环境变量：

```bash
UMEDIA_ADMIN_PASSWORD_HASH="生成出来的hash"
```

启动服务：

```bash
PORT=3000 UMEDIA_ADMIN_PASSWORD_HASH="生成出来的hash" npm start
```

## 文件权限

确保 Node 运行用户可以写入内容文件和图片上传目录：

```bash
chown nodeuser:nodeuser content/site.json
chmod 664 content/site.json
mkdir -p assets/uploads
chown -R nodeuser:nodeuser assets/uploads
chmod 775 assets/uploads
```

如果你的服务器 Node 用户不是 `nodeuser`，请换成实际用户。

## Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 安全建议

- `/admin/` 必须走 HTTPS
- 不要把 `UMEDIA_ADMIN_PASSWORD_HASH` 写进前端文件
- 管理密码使用强密码
- 可以在 Nginx/Apache 再加一层 Basic Auth 或 IP 白名单

## 老板使用方式

打开：

```text
https://你的域名/admin/
```

输入管理密码后，可以修改首页、UA32、UA55、联系页等内容。保存后刷新前台页面即可看到最新内容。

图片会上传到：

```text
assets/uploads/
```

内容文件中只保存图片路径，例如：

```json
"/assets/uploads/your-image.webp"
```
