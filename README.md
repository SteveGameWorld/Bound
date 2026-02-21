# BOUND

這是一個純前端（瀏覽器）3D 沙盒原型，目標是做出類似 Roblox 的核心手感：
- 方塊世界（放置/破壞）
- 方塊人角色（外觀/服裝）
- 指標鎖定（Pointer Lock）+ WASD 移動 + 跳躍
- 額外示範：金幣收集、跑酷（Obby）、原創課金外觀（僅示意）

## 1) 需求

- Node.js（可選，用來跑 `dev-server.js`），或 Python 3（可用內建 `http.server`）
- 瀏覽器：Chrome / Edge / Safari / Firefox 皆可
- 需要可連外網（Three.js 會從 CDN 載入）

## 2) 啟動

在 `BOUND/` 內啟動本機伺服器（擇一）：

```bash
cd BOUND
node dev-server.js
```

或：

```bash
cd BOUND
python3 -m http.server 5180
```

打開瀏覽器：
- `http://127.0.0.1:5180/`

> 注意：不要直接用 `file://` 打開 `index.html`，瀏覽器會阻擋 ES Module 載入。

## 2.5) 發佈到 GitHub Pages

本專案是純靜態網站（`index.html` + `main.js` + `style.css` + `assets/`），適合直接用 GitHub Pages 發佈。

1) 到 GitHub repo → **Settings** → **Pages**

2) **Build and deployment**

- **Source** 選 `Deploy from a branch`
- **Branch** 選 `main`
- **Folder** 選 `/ (root)`

3) 等待部署完成後，就可以用 GitHub Pages 網址打開（大概格式會是）：

- `https://<owner>.github.io/<repo>/`

> 已放入 `.nojekyll`，避免 GitHub Pages 的 Jekyll 忽略底線開頭資料夾造成資源缺檔。

## 3) 操作

- 移動：W A S D
- 跳躍：Space
- 看方向：滑鼠（進入遊戲後點一下畫面鎖定游標；Esc 可跳出）
- 破壞方塊：滑鼠左鍵
- 放置方塊：滑鼠右鍵
- 選方塊：1 ~ 5
- 切換視角：V（第三人稱 / 第一人稱 / 俯視）

## 4) 存檔

- 世界存檔：使用 `localStorage`
- 角色外觀 / 課金外觀：使用 `localStorage`

