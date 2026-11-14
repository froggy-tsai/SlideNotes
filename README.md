# SlideNotes

SlideNotes 是個人課程教材整理與雙語對照閱讀網站，目標是讓原始英文簡報與經審核的繁體中文整理版本逐頁對照，方便長期複習與擴充課程內容。

## 目前狀態

網站第一版已部署至 [GitHub Pages](https://froggy-tsai.github.io/SlideNotes/)，程式碼與教材來源存放於 [GitHub repository](https://github.com/froggy-tsai/SlideNotes)。Introduction to Computer Science 課程的 Ch01YH 已加入公開教材清單。專案規範見 [AGENTS.md](AGENTS.md)。

## 已確認方向

- 原始教材支援 PDF、PPTX；中文整理版逐頁對應原始教材。
- 中文教材先以可編輯 PPTX 交付與審核；使用者確認上網站後再轉為 PDF。
- 首頁以課程卡片呈現，課程有獨立教材清單頁；閱讀器桌面版左右並排、手機版上下排列，提供捲動同步、頁碼跳轉、縮放與全螢幕。
- 第一版不加入搜尋；未經明確確認發布的教材不會進入公開教材目錄或部署產物。
- 教材經使用者審核並明確確認後，才加入公開內容。
- 第一版採靜態網站，已部署至 GitHub Pages；使用 HTML、CSS、JavaScript 與隨站提供的 PDF.js 6.5.438。
- 公開教材由 `content/published-catalog.json` 明確列出；只有 `status: "published"` 的教材 PDF 才會複製到 `dist/`。

## 新增與發布教材

每份教材使用 `content/<課程代號>/<教材代號>/` 資料夾。資料夾名稱是穩定的代號；首頁課程卡片名稱與教材清單名稱由 `content/published-catalog.json` 的 `name`、`title` 欄位控制，新增時會依資料夾名稱設定對應顯示名稱。現有課程或教材只需沿用原資料夾，不要重複建立。

### 1. 建立教材資料夾並放入原始檔

在 `content/` 下建立課程資料夾，再於其中建立本次教材資料夾。例如：

```text
content/
└── Introduction_to_Computer_Science/
    └── Ch02YH/
```

課程資料夾代號會對應首頁的課程卡片；教材資料夾代號會對應課程頁的教材名稱。請把本次要處理的簡報轉成 PDF 後放進教材資料夾。若手上是 PPTX，也可直接提供，原始格式會保留。

### 2. 指定要處理的檔案

告訴 Codex **完整資料夾路徑與原始檔名**，並說明要開始整理/翻譯。例如：

```text
請處理 content/Introduction_to_Computer_Science/Ch02YH/Ch02YH.pdf，依專案規則產生可編輯的繁體中文 PPTX 草稿。
```

Codex 只處理你當次指定的檔案，不會自行掃描資料夾尋找教材。原始來源會在該資料夾內以 `original.pdf` 或 `original.pptx` 管理，不覆寫來源內容；中文可編輯草稿命名為 `zh-TW.pptx`。產生後會附上頁數對應、疑義術語與補充說明，供你審核。

### 3. 審核及修改中文 PPTX

到該教材資料夾開啟 `zh-TW.pptx`，逐頁檢查翻譯、排版及頁數對應，並按需要直接修改。原始來源檔保持不變。確認 PPTX 修正完成後，將它匯出為 PDF，放回同一資料夾並命名為 `zh-TW.pdf`。

此時教材仍是草稿，尚未公開。未經你明確確認發布的教材，不會進入網站。

### 4. 請 Codex 加入網站並在本機檢查

確認要公開後，明確告訴 Codex 此教材可以發布，並請它將教材加入網站。Codex 會在 `content/published-catalog.json` 登記教材和兩份 PDF；新課程會新增課程卡片，既有課程則新增教材列。每份教材共用同一套閱讀器，不會複製一份閱讀器程式。

Codex 會建置並檢查本機網站。你也可以自行在專案資料夾執行：

```powershell
node scripts/build-site.mjs
python -m http.server 4173 --directory dist
```

再開啟 `http://localhost:4173/`，依序檢查首頁、課程清單及教材雙欄閱讀器，確認原文與中文 PDF 都能載入、頁數一致、頁面顯示正確。

### 5. 提交及部署

本機確認沒問題後，請 Codex 提交（commit）並推送（push）變更。推送至 `main` 會自動觸發 GitHub Actions，重新建置並部署到 [SlideNotes 網站](https://froggy-tsai.github.io/SlideNotes/)。完成後再檢查公開網站的課程卡片、教材列及 PDF 閱讀器。

> GitHub repository 與 GitHub Pages 網站目前都是公開的。提交教材前，請確認原文與中文 PDF 可以公開分享；公開 repository 也會讓其中的可編輯 PPTX 可供下載。

目前教材範例：

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
