# 发布包

本目录包含可直接部署的静态网站压缩包（不含内部文档与开发配置）。

| 文件 | 说明 |
|------|------|
| `umedia-television-v*.zip` | 解压后上传至任意静态托管（Gitee Pages、GitHub Pages、Nginx 等） |

重新打包：

```bash
./scripts/package.sh
# 或指定版本号：./scripts/package.sh 1.0.1
```
