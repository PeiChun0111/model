# 手機垃圾分類前端應用

這個專案提供一個純前端的垃圾分類手機網頁應用，使用瀏覽器相機拍照或上傳圖片後，直接套用 `models` 資料夾中的 Teachable Machine 模型進行辨識。

## 如何使用

1. 這是純前端靜態網站，使用 HTML/CSS/JavaScript 與 Teachable Machine 前端模型載入。

2. 可部署到 GitHub Pages 或任何靜態網站主機。

3. 若在本機測試，請使用靜態伺服器或 Visual Studio Code 的 Live Server 等工具開啟，避免直接以 `file://` 打開。

4. 允許相機存取，或使用「上傳照片」功能進行辨識。

> 註：程式會自動從當前頁面路徑載入 `models/model.json` 與 `models/metadata.json`，確保模型資料夾與網頁同層。
## 專案內容

- `index.html`：主頁面。
- `styles.css`：響應式手機 UI 樣式。
- `app.js`：相機控制、拍照上傳與模型辨識邏輯。
- `models/`：已訓練好的 Teachable Machine 模型檔案。
