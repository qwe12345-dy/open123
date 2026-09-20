# 🚀 Space Defender 3D - 太空守卫者

一个纯手写的 3D 网页射击小游戏，所有 3D 模型（飞船、敌机、子弹、星星、陨石）都由 Python 脚本生成 OBJ 文件，游戏逻辑用原生 JavaScript + Three.js 手写。

---

## 🎮 玩法

| 操作 | 按键 |
|------|------|
| 移动飞船 | `W A S D` 或方向键 |
| 瞄准 | 鼠标移动（触屏设备直接拖动） |
| 射击 | `空格`（触屏点按屏幕） |
| 暂停 | `P` |

**规则：**
- 击落敌机 **+100 分**
- 收集金色星星 **+50 分**
- 被敌机撞到 / 敌机从身后溜走 / 撞到陨石 → **扣 1 条命**
- 共 3 条命，每 500 分升 1 关（敌机更快更多）

---

## 📁 项目结构

```
space-defender-3d/
├── index.html          # 游戏主页面
├── css/
│   └── style.css       # UI 样式
├── js/
│   └── game.js         # 游戏核心逻辑（手写）
├── models/             # 全部 OBJ 模型（自己生成的）
│   ├── player_ship.obj  # 玩家飞船
│   ├── enemy_ship.obj   # 敌机
│   ├── bullet.obj       # 子弹
│   ├── star.obj        # 星星收集物
│   └── asteroid.obj     # 陨石
├── generate_models.py   # OBJ 模型生成脚本
└── README.md           # 本文件
```

---

## 🖥️ 本地运行

因为浏览器有跨域限制，**直接双击 index.html 打不开模型**，需要起一个本地静态服务器：

```bash
# 方法 1：Python
cd space-defender-3d
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080

# 方法 2：Node.js
npx serve .
```

---

## 📦 部署到 GitHub Pages

### 第一步：创建 GitHub 仓库

1. 登录 GitHub，点击右上角 `+` → `New repository`
2. 仓库名随便起，比如 `space-defender-3d`
3. 选择 **Public**（公开，私有仓库 Pages 要付费）
4. 不要勾选 "Initialize with README"（你已经有文件了）
5. 点击 **Create repository**

### 第二步：上传代码

在本地项目目录执行：

```bash
cd space-defender-3d

git init
git add .
git commit -m "init: Space Defender 3D"

# 把下面的 你的用户名 和 仓库名 换成你自己的
git branch -M main
git remote add origin https://github.com/你的用户名/space-defender-3d.git
git push -u origin main
```

### 第三步：开启 GitHub Pages

1. 进入仓库页面，点击顶部 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main`，文件夹选 `/ (root)`
5. 点击 **Save**
6. 等 1~2 分钟，页面顶部会出现你的访问地址：
   ```
   https://你的用户名.github.io/space-defender-3d/
   ```

打开这个地址就能玩了！

---

## ☁️ 部署到 Cloudflare Pages（推荐，国内访问更快）

### 方法一：直接上传文件夹（最简单）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧点击 **Workers & Pages**
3. 点击 **Create** → 选 **Pages** 标签 → 选 **Upload assets**
4. 项目名填 `space-defender-3d`，点击 **Create project**
5. 把整个 `space-defender-3d` 文件夹**拖进去**（注意是拖文件夹内容，不是压缩包）
6. 点击 **Deploy site**
7. 等 30 秒，拿到地址：
   ```
   https://space-defender-3d.pages.dev
   ```

### 方法二：连接 GitHub 仓库（自动部署）

1. Cloudflare Pages → **Create** → **Pages** → **Connect to Git**
2. 授权 GitHub，选择你刚才创建的 `space-defender-3d` 仓库
3. 构建配置：
   - **Framework preset**：选 `None`
   - **Build command**：留空
   - **Build output directory**：填 `/`（根目录）
4. 点击 **Save and Deploy**
5. 以后你 `git push` 后，Cloudflare 会自动重新部署

---

## 🔧 重新生成模型（可选）

如果你想改模型形状，编辑 `generate_models.py` 后运行：

```bash
python3 generate_models.py
```

会自动重新生成 `models/` 下的所有 `.obj` 文件。

---

## 🛠️ 技术栈

- **Three.js r128**（CDN 引入，仅做渲染管线）
- **原生 JavaScript**（游戏逻辑全部手写）
- **OBJ 格式**（自己写顶点和面数据，没用建模软件）
- **Python**（程序化生成模型几何）

---

## 📄 License

随便玩，随便改，别拿来卖就行 😄
