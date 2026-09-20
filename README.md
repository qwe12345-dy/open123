# 🚀 Space Defender 3D - 太空守卫者（手机横屏版）

一个纯手写的 3D 网页射击小游戏，所有 3D 模型由 Python 脚本生成 OBJ 文件，游戏逻辑用原生 JavaScript + Three.js 手写。

**本次更新：**
- ✨ 模型升级：玩家飞船 19 顶点 35 面（机头/后掠翼/垂尾/双引擎），敌机 11 顶点 25 面
- 📱 手机横屏适配：渲染分辨率上限 1920×1080（安卓9横屏基准）
- 🎮 移动端虚拟摇杆（左下）+ 射击按钮（右下）
- 🔄 竖屏自动提示旋转手机
- 📐 刘海屏安全区适配

---

## 🎮 玩法

| 操作 | PC | 手机横屏 |
|------|-----|---------|
| 移动 | `WASD` / 方向键 | 左下虚拟摇杆拖动 |
| 射击 | `空格` | 右下红色按钮 |
| 暂停 | `P` | 点击暂停界面 |
| 瞄准 | 鼠标移动 | 自动跟随移动方向 |

**规则：**
- 击落敌机 **+100 分**
- 收集金色星星 **+50 分**
- 被撞 / 敌机溜走 / 撞陨石 → **扣 1 命**（共 3 命）
- 每 500 分升 1 关，敌机更快更多

---

## 📁 项目结构

```
space-defender-3d/
├── index.html           # 主页面
├── css/style.css        # 横屏适配样式
├── js/game.js           # 游戏逻辑（含触摸摇杆）
├── models/              # 手搓 OBJ 模型
│   ├── player_ship.obj  # 玩家飞船（19顶点/35面）
│   ├── enemy_ship.obj   # 敌机（11顶点/25面）
│   ├── bullet.obj       # 子弹（10顶点/16面）
│   ├── star.obj        # 星星（20顶点/36面）
│   └── asteroid.obj     # 陨石（12顶点/20面）
├── generate_models.py    # 模型生成脚本
└── README.md
```

---

## 🖥️ 本地运行

```bash
cd space-defender-3d
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
# 手机测试：用 Chrome DevTools 切换手机横屏模式
```

---

## 📦 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "Space Defender 3D"
git branch -M main
git remote add origin https://github.com/你的用户名/space-defender-3d.git
git push -u origin main
```

然后：仓库 **Settings** → **Pages** → Source 选 `main` 分支 → Save → 等 1 分钟拿到：
```
https://你的用户名.github.io/space-defender-3d/
```

---

## ☁️ 部署到 Cloudflare Pages（推荐，国内快）

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**
2. 选 **Upload assets** → 把整个文件夹拖进去
3. 点 **Deploy site** → 30 秒拿到 `https://xxx.pages.dev`

或连接 GitHub 仓库自动部署：Build 命令留空，Build output directory 填 `/`。

---

## 🔧 渲染分辨率说明

为适配安卓9手机横屏，游戏渲染分辨率上限为 **1920×1080**：
- 屏幕比这个小（绝大多数手机）：按实际分辨率渲染
- 屏幕比这个大（平板/桌面）：自动降采样到 1920×1080，CSS 拉伸填满

这样既保证手机端流畅，又不会在大屏上过度渲染浪费性能。

---

## 🛠️ 技术栈

- Three.js r128（CDN，仅渲染管线）
- 原生 JavaScript（游戏逻辑全部手写）
- OBJ 格式（Python 程序化生成，没用建模软件）
- CSS 媒体查询（横屏检测 + 安全区适配）
