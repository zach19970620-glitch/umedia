# 发布包

本目录包含可直接部署的静态网站压缩包（不含内部文档与开发配置）。

| 文件 | 说明 |
|------|------|
| `umedia-television-v*.zip` | 解压后上传至任意静态托管（Gitee Pages、Nginx 等） |

GitHub Pages 仓库（含本 zip 与完整站点源码）：

https://github.com/zach19970620-glitch/zach19970620-glitch.github.io

线上访问：https://zach19970620-glitch.github.io/

重新打包并同步到 Pages 仓库：

```bash
./scripts/package.sh
git add dist/
git commit -m "更新发布包"
git push pages main
```

重新打包：

```bash
./scripts/package.sh
# 或指定版本号：./scripts/package.sh 1.0.1
```
