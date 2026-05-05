# 手機垃圾分類前端應用

這個專案提供一個純前端的垃圾分類手機網頁應用，使用瀏覽器相機拍照或上傳圖片後，直接套用 `models` 資料夾中的 Teachable Machine 模型進行辨識。

## 如何使用

1. 在專案根目錄啟動本機伺服器，避免瀏覽器直接開啟檔案時產生模型載入限制。

```bash
cd /workspaces/model
python3 -m http.server 8000
```

如果你想更簡單，可以直接執行：

```bash
./start.sh
```

2. 開啟瀏覽器並造訪：

```text
http://localhost:8000
```

3. 允許相機存取，或使用「上傳照片」功能進行辨識。

> 注意：不要直接以 `file://` 開啟 `index.html`，那樣會導致模型檔案載入失敗。

## 專案內容

- `index.html`：主頁面。
- `styles.css`：響應式手機 UI 樣式。
- `app.js`：相機控制、拍照上傳與模型辨識邏輯。
- `models/`：已訓練好的 Teachable Machine 模型檔案。
