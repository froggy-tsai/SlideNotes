# SlideNotes

SlideNotes 是課程簡報整理與雙語對照閱讀網站。它以課程和教材分類，並排顯示原文 PDF 與經人工審核的繁體中文 PDF，方便逐頁閱讀。

## 網站功能

- 首頁以課程卡片顯示課名與教材數量；選課後進入該課程的教材清單。
- 教材清單以檔案列呈現；選擇教材後進入閱讀器。
- 桌面閱讀器左右並排、手機版上下排列。原文與中文 PDF 可連續閱讀、各自捲動。
- 預設以原文位置對齊後雙向同步；也可切換為分開捲動，或先以中文位置對齊後同步。同步依頁碼與頁內相對位置運作。
- 閱讀器提供頁碼跳轉、縮放與全螢幕。第一版不提供搜尋。
- 網站是靜態網站，使用 HTML、CSS、JavaScript 與隨站提供的 PDF.js，部署目標為 GitHub Pages。

## 簡報整理原則

- 原始第 N 頁對應中文第 N 頁，沿用原始頁面比例；中文以繁體中文忠實翻譯，重要術語與專有名詞保留原文。
- 原文原有的中英混排照原樣保留。保留文字、表格及可編輯公式；所有圖片、圖表與流程／架構圖都省略。
- 中文較長時，先調整文字方塊、行距與字級。原文疑義以「原文疑義／補充說明」標示；額外解說以灰字「補充：」開頭。
- 中文 PPTX 是本機可編輯母檔；只有使用者審核並明確確認發布後，才將 PDF 納入網站公開內容。

## 教材檔案與公開方式

GitHub repository 中的教材檔只使用 PDF；原始 PPTX 與可編輯的中文 PPTX 留在本機的 `private-materials/<課程代號>/<教材代號>/`，該資料夾已加入 `.gitignore`，不會納入公開 repository。請另外備份這些 PPTX。

公開教材以 `content/<課程代號>/<教材代號>/` 管理：

```text
content/
└── Introduction_to_Computer_Science/
    └── Ch13YH/
        ├── original.pdf
        └── zh-TW.pdf
```

課程代號與教材代號是資料夾名稱；網站顯示名稱由 `content/published-catalog.json` 的 `name` 與 `title` 控制，預設與資料夾名稱一致。公開目錄是網站白名單，僅列入已審核且使用者明確確認發布的教材。建置程序不會掃描或自動發布其他資料夾中的檔案。未列入目錄的 PDF 不會顯示在網站，但由於 GitHub repository 是公開的，`content/` 中的 PDF 仍可透過 repository 直接下載；放入該資料夾即表示接受這種公開可見性。

目前公開教材的本機來源檔：

- `content/Introduction_to_Computer_Science/Ch01YH/original.pdf`
- `content/Introduction_to_Computer_Science/Ch01YH/zh-TW.pdf`
- `content/Introduction_to_Computer_Science/Ch13YH/original.pdf`
- `content/Introduction_to_Computer_Science/Ch13YH/zh-TW.pdf`

## 新增教材流程

### 1. 提供來源

可直接上傳 PDF 或 PPTX，或先把來源放進專案資料夾再告訴 Codex 完整路徑。直接上傳並要求建立資料夾時，教材資料夾名稱預設使用檔名（不含副檔名），也可指定其他名稱。若未提供科目，Codex 會先詢問；科目名稱與既有課程相近時會先確認是否沿用。Codex 只處理當次明確指定的檔案，不會自行搜尋教材資料夾。

若自行放置原始 PDF，將它放在 `content/<課程代號>/<教材代號>/original.pdf`。此 PDF 可從公開 repository 下載，即使它尚未列入網站目錄。若原始檔是 PPTX，將它保存在本機忽略資料夾 `private-materials/<課程代號>/<教材代號>/original.pptx`。兩種原始格式及中文可編輯 PPTX 都不會被覆寫；私有資料夾不會同步到 GitHub，請另外備份。

### 2. 產生及審核繁中 PPTX

Codex 依照 [AGENTS.md](AGENTS.md) 產生可編輯的繁中 PPTX 草稿，保留原文頁數、頁序與頁面比例；所有圖片省略。草稿存放在本機 `private-materials/`，不會上傳至公開 repository。逐頁檢查內容、版面、術語及疑義；需要修改時先完成修改並重新審核。

### 3. 確認發布並加入網站

確認教材內容後，明確告訴 Codex「可以發布並更新網站」。Codex 會將已確認的原文與中文 PDF 放入 `content/<課程代號>/<教材代號>/`，在 `content/published-catalog.json` 登記教材，並建置本機網站。若原始來源是 PPTX，網站閱讀使用其 PDF 版本；本機保留原始 PPTX 與可編輯中文 PPTX。

### 4. 本機檢查

在專案資料夾開啟 PowerShell，執行：

```powershell
node scripts/build-site.mjs
python -m http.server 4173 --directory dist
```

瀏覽 [http://localhost:4173/](http://localhost:4173/)，檢查首頁課程卡片、課程教材清單及對照閱讀器，確認兩份 PDF 能載入、頁數一致、頁面呈現正確。結束預覽時在 PowerShell 按 `Ctrl+C`。`dist/` 是建置產物，不要手動編輯。

### 5. Commit 與部署

本機檢查完成後，Codex 會回報結果並等候明確指示。只有使用者明確要求時才 commit 或 push；推送至 `main` 會觸發 GitHub Pages 部署。更新網站內容或確認教材發布都不代表授權 push。

## 開發與部署

需安裝 Node.js 20 或更新版本。建置命令：

```powershell
node scripts/build-site.mjs
```

建置程序會驗證公開目錄所列的 PDF，複製網站檔案與 PDF 至 `dist/`。`dist/` 若存在，程序只會移除先前由 SlideNotes 建置且帶有專案標記的輸出；未標記的目錄不會被覆寫。PDF.js 與 CMap、標準字型及 WASM 資源存放在 `site/assets/vendor/pdfjs/`，執行時不依賴外部 CDN。

GitHub Pages 網址：[https://froggy-tsai.github.io/SlideNotes/](https://froggy-tsai.github.io/SlideNotes/)

## 專案規範

教材處理規則、發布管制、網站行為及品質檢查見 [AGENTS.md](AGENTS.md)。
