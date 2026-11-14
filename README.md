# SlideNotes

SlideNotes 是個人課程教材整理與雙語對照閱讀網站，目標是讓原始英文簡報與經審核的繁體中文整理版本逐頁對照，方便長期複習與擴充課程內容。

## 目前狀態

網站第一版已可在本機建置與預覽。Introduction to Computer Science 課程的 Ch01YH 已加入公開教材清單。GitHub repository 與部署設定尚未建立。專案規範見 [AGENTS.md](AGENTS.md)。

## 已確認方向

- 原始教材支援 PDF、PPTX；中文整理版逐頁對應原始教材。
- 中文教材先以可編輯 PPTX 交付與審核；使用者確認上網站後再轉為 PDF。
- 首頁以課程卡片呈現，課程有獨立教材清單頁；閱讀器桌面版左右並排、手機版上下排列，提供捲動同步、頁碼跳轉、縮放與全螢幕。
- 第一版不加入搜尋；未經明確確認發布的教材不會進入公開教材目錄或部署產物。
- 教材經使用者審核並明確確認後，才加入公開內容。
- 第一版採靜態網站，預定以 GitHub Pages 部署；目前使用 HTML、CSS、JavaScript 與隨站提供的 PDF.js 6.5.438。
- 公開教材由 `content/published-catalog.json` 明確列出；只有 `status: "published"` 的教材 PDF 才會複製到 `dist/`。

## 尚待討論

中文簡報的基本生成規則、教材資料夾命名與網站資訊架構已記錄於 [AGENTS.md](AGENTS.md)。仍待確認的教材決策請見該文件；網站細部配色與字體目前採乾淨簡約的系統字體設計。

## 教材檔案

每份教材使用 `content/<課程代號>/<教材代號>/` 資料夾。原始檔使用 `original` 主檔名並保留來源副檔名；中文可編輯稿為 `zh-TW.pptx`。確認發布後才產生網站閱讀用 PDF。每次處理只依使用者當次上傳或明確指定的來源檔進行。

目前範例教材：

- `content/Introduction_to_Computer_Science/Ch01YH/original.pdf`
- `content/Introduction_to_Computer_Science/Ch01YH/zh-TW.pptx`（可編輯版本）
- `content/Introduction_to_Computer_Science/Ch01YH/zh-TW.pdf`（網站閱讀版本）

## 開發

需安裝 Node.js 20 或更新版本。建置靜態網站：

```powershell
node scripts/build-site.mjs
```

本機預覽（先完成建置）：

```powershell
python -m http.server 4173 --directory dist
```

再開啟 `http://localhost:4173/`。`dist/` 是可重建的部署輸出，不要手動編輯；教材需先登記在 `content/published-catalog.json` 並明確標記為已發布，建置程序才會納入對應 PDF。PDF.js 與所需字型/CMap/WASM 資源已隨站提供，不依賴執行時 CDN。

## 教材發布原則

草稿及待審核教材不得進入公開教材索引。只有使用者明確確認可以發布後，才更新網站公開內容。新增與修改教材的工作流程及品質檢查請依照 [AGENTS.md](AGENTS.md)。
