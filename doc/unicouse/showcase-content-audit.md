# UNICO 展示专区内容审计

核实日期：2026-09-21  
素材根目录：`doc/unicouse/unico-usa-assets/`  
公开导出目录：`assets/products/unico/`（仅精选 WebP / 一条 U3 视频）

## 总原则

- 不采用美元价格、预购、到货时间、美国售后或运输承诺。
- 不声称五款硬件接入 Unico 智慧雲店、AI 广告或 UA 系列。
- 不声称 Umedia 为 UNICO 官方代理或制造商。
- 家用授权不推断为商业投币营运授权。

## MVSX（`products/06-snk-mvsx/`）

| 采用字段 | 依据 | 处理 |
|---|---|---|
| 产品名称 SNK MVSX 家用街機 | `info.md` / `intro-zh-Hant.md` | 采用 |
| 17 吋液晶、1280×1024 | `info.md` 英文原文与中文介绍 | 采用分辨率与尺寸；**省略 4:3**。1280×1024 为 5:4，与文案中的 4:3 冲突，无法确认是面板比例还是内容显示比例 |
| 预载 50 款 SNK 游戏；MVS / AES | 同上 | 采用 |
| 双人、标准六键 | 同上；实拍 `gallery-08` 可见双摇杆六键 | 采用 |
| 9 语系；USB-A | `info.md` | 采用 |
| 底座 / 增高座 | `gallery-01`、`gallery-05` 实拍含配件 | 仅作图片说明，不作为标配或套装售卖 |

未使用：价格、Deluxe 套装购买选项、落地页英销图（`landing-08` 等含 4:3 文案）。

## Unico Pocket（`products/14-pocket-4inch-handheld/`）

| 采用字段 | 依据 | 处理 |
|---|---|---|
| 4 吋 IPS，960×720，4:3 | `info.md` | 采用；该款为归档 4 吋型号 |
| 预载 40 款 SNK NEOGEO | `info.md` | 采用 |
| 双摇杆 + 十字键 + ABCD + L1/L2/R1/R2 | `info.md`；`gallery-01` 可见 ABCD | 采用 |
| 156×77.6×17 mm | `info.md` | 采用 |
| 3500mAh，官方最长约 8 小时 | `info.md` | 采用，并注明实际续航视亮度与游戏而异 |
| 黑 / 灰 | `info.md`；`gallery-11`、`gallery-14` | 采用背面实拍区分配色，不把颜色当卖点排名 |
| ARM Cortex-A53、Linux、USB-C | `info.md` | 规格表采用 |

未使用：价格、模拟器对比话术。

## Unico Color（`products/15-color-igs-handheld/`）

| 采用字段 | 依据 | 处理 |
|---|---|---|
| 直式机身，红色 | `gallery-04` 等实拍 | 采用 |
| 3.5 吋、4:3、640×480 | `info.md` | 采用 |
| 内置 IGS 经典游戏 | `info.md` 列举 Knights of Valour、Oriental Legend 等 | **不写 15 或 16 款**。落地页图文件名写 15 款，正文写 16 款，版本未确认 |
| 双摇杆、肩键、约 200 g、3000mAh、microSD | `info.md`；`gallery-05`/`gallery-06` 可见肩键 | 采用；不写“全天续航” |

未使用：价格、随机卡宣传图、15/16 款数量图。

## Raiden U3（`products/03-nova-blast-u3-raiden/`）

| 采用字段 | 依据 | 处理 |
|---|---|---|
| Nova Blast 糖果柜雷电主题 | `gallery-03` 实拍 | 采用为主视觉 / 卡片图 |
| 26 吋 4:3，1440×1080，可横直切换 | `info.md` | 采用 |
| 三和摇杆按键 | `info.md`；`landing-28` 控制台特写 | 采用 |
| 授权雷电合辑，清单依地区版本 | `info.md` | 采用笼统表述，不拼接国际版与日本限定清单 |
| JAMMA、CGA/EGA/VGA/HDMI | `info.md` | 规格表采用 |
| 椅凳 | `gallery-01` | 图片说明“实拍含椅凳”，不写标配 |

视频：仅使用该产品目录 `videos/video-26-e80f2d3a4bc147f29ef40777debbe543.mp4`（海报 `landing-24`），`preload="none"`。  
未使用：预购、到货批次、美元价格、投币营运主张、U2/U4 产品页。

## GM18

本地归档无独立产品目录。Color `description.html` 仅有外链  
`https://shop.theclub.com.hk/electronics-and-office/gaming-and-esports/game-consoles/unico-gm18-gamebox-with-2-gamepads-hkum-gm18`  
此前未能读取，URL 文本不作规格证据。

处理：首页 / 专区中性文字画布 +「產品介紹即將更新」；`gm18.html` 临时页 `noindex`。形态分类未加入街机或掌机。

## 导出体积记录

目标：卡片约 100–200 KB，主视觉约 300–500 KB。

| 文件 | 约 KB | 备注 |
|---|---:|---|
| `mvsx/riser.webp` | 243 | 原图底部有明显杂讯/渐变颗粒，压缩到 q56 仍略超卡片目标 |
| `color/front.webp` | 243 | 原图含浅灰地面杂讯，同样略超卡片目标 |
| 其余 WebP | 15–140 | 符合目标 |
| `raiden-u3/overview.mp4` | 4291 | 原片拷贝，页面 `preload="none"`，不在首屏下载 |

未把 919 MB 归档复制到 `assets/`。
