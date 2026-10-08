# 🤖 世宗韓國語 練習冊 1B 專案開發藍圖與任務清單 (AGENTS.md)

## 📌 專案定位
- **專案名稱**：世宗韓國語 練習冊 1B 官方原裝電子書與聽力點讀系統 (`Sejong-Korean-Workbook-1B`)
- **官方來源**：世宗學堂基金會（세종학당재단）《세종한국어 익힘책 1B》官方練習冊與配套音訊（全 60 個官方音檔，`SJ_W_1B_*.mp3`），全書共 102 頁原版高清彩頁 (Dir=774)
- **工作區路徑**：`C:\Users\PC\Documents\Google-Antigravity\Korean-Study\Sejong Korean\Workbook 世宗韓國語練習冊\1B`
- **線上站點**：[https://sejong-workbook-1b-1ec2a.web.app](https://sejong-workbook-1b-1ec2a.web.app)
- **主要目的**：打造集「102 頁原版翻頁電子書 ➔ 聽力音檔逐題點讀 ➔ 12 課課後練習 ➔ KittyVoice 三段速發音」於一體的高品質韓語初級學習系統。

---

## 🌟 全域標準與設計規範 (Global Baseline)
1. **時區基準**：所有日誌、時間戳記與交接檔案一律以 **美國時間（洛杉磯 / 太平洋時間 PT，PST/PDT）** 為準。
2. **文字規範**：全介面文字、繁簡轉換與教學註解一律採 **繁體中文（臺灣正體）**，嚴格遵守 OpenCC `s2twp` 標準。
3. **視覺主題**：
   - 淺色背景（Light Theme）為第一優先（嚴禁未經同意切換深色模式）。
   - 韓系粉彩/馬卡龍色調（草莓粉 `#FF5E7E`、甜杏橘 `#FF8A3D`、抹茶薄荷 `#10B981`、藍莓香芋 `#7C3AED`、暖杏奶白 `#FFFDF9`）。
   - 拍立得相紙質感卡片、3D 翻轉動效、膠囊導航列、螢光筆語法透視高亮。
4. **語音發音機制（KittyVoice）**：
   - 四級高可用發音引擎：`Android 原生 TTS ➔ Web Speech API ➔ Google 雲端真人高清晰語音 ➔ Baidu 備援`。
   - 支援 `0.3x`（逐音節口型拆解）、`0.7x`（慢速跟讀）、`1.0x`（自然正常）三段速朗讀。
   - 聽力題號點讀直接播放官方真人 MP3 音檔 (`playAudioFile`)。
5. **部署與多端同步規範**：
   - 雙軌架構：Web PWA + Android 原生（Capacitor 6.x）。
   - 前端變更時同步鏡像複製至 `www/` (`npm run sync:www`)。
   - Service Worker 快取版本遞增機制 (`sejong-workbook-1b-v1.0.0`)。
   - Firebase 部署嚴格顯式宣告專屬子站點 `sejong-workbook-1b-1ec2a`，杜絕裸推覆蓋主站。

---

## 📖 閱讀器引擎與黃金版面規範 (Reader Engine & Gold Layout Checklist)
- [x] **閱讀器排版嚴格遵守 `WORKBOOK_GOLD_SPEC.md` 與 `EBOOK_SCROLLBAR_SPEC.md` 規範**：
  - [x] **頂部導航條**：48px 簡約導航條，韓文標題 0.95rem。
  - [x] **電子書大小與滿版自適應**：手機端採 `100vw` 滿版寬度自然縱向展開（鎖定 `589 / 807` 原書長寬比），右側文字絕不裁切。
  - [x] **自然雙向滾動**：`.reader-viewport` 啟用 `overflow-y: auto; overflow-x: auto;` 雙向滑動，支援馬卡龍粉彩滾動條。
  - [x] **視窗黃金區固定 (HUD Pinning)**：
    - 左右翻頁箭頭 (`.flip-arrow-btn`) 縮小至 `34px` 貼邊固定 (`fixed; left/right: 4px`)。
    - 頁碼與三段速控制列 (`.floating-bottom-bar`) 採 `fixed` 鎖定在底部膠捲上方 (`bottom: 60px`)。
  - [x] **底部頁碼膠捲**：`52px` 微縮圖抽屜 (`.filmstrip-drawer`)，支援橫向滑動與點擊跳頁。
  - [x] **換頁平滑回頂與左側**：換頁 `goToPage` 時自動平滑歸位 `scrollTo({ top: 0, left: 0, behavior: 'smooth' })`。

---

## 📁 專案架構規劃 (Directory Structure)
```
Sejong Korean/Workbook 世宗韓國語練習冊/1B/
├── .gitignore
├── README.md                  # 專案總覽
├── AGENTS.md                  # 專案架構藍圖與 Checklist (L1)
├── handoff.md                 # 跨階段交接記錄 (L1)
├── EBOOK_SCROLLBAR_SPEC.md    # 閱讀器自然垂直滾動條與排版規範手冊
├── package.json               # 依賴管理與 sync:www 腳本
├── firebase.json              # Firebase Hosting 設定 (site: sejong-workbook-1b-1ec2a)
├── .firebaserc                # Firebase 專案綁定
├── index.html                 # PWA 主頁面入口 (102 頁自適應視窗)
├── manifest.json              # Web App Manifest
├── sw.js                      # Service Worker 快取腳本 (v1.0.0)
├── docs/                      # 歷史紀錄與對話匯出
│   ├── CONVERSATION_HISTORY.md
│   └── transcript_raw.jsonl
├── src/
│   ├── assets/
│   │   ├── audio/             # 60 個官方原裝練習冊音檔 (SJ_W_1B_*.mp3)
│   │   └── pages/             # 001.jpg ~ 102.jpg 官方原裝高畫質彩頁 (Dir=774)
│   ├── css/
│   │   ├── pastel.css         # 韓系馬卡龍粉彩主題變數
│   │   ├── reader.css         # 翻頁舞台、自然垂直滾動、視窗鎖定控制項
│   │   └── overlay.css        # 原頁點讀熱區與發音彈窗樣式
│   ├── js/
│   │   ├── app.js             # 主應用協調器與模式切換
│   │   ├── kitty-voice.js     # 四級 KittyVoice 發音引擎與三段速控制
│   │   ├── reader-engine.js   # 102 頁翻頁核心、平滑回頂、章節跳轉
│   │   └── study-engine.js    # 輔助學習引擎
│   └── data/
│       ├── book_meta.json     # 全書 102 頁目錄、12 課章節與頁碼映射
│       └── hotspots.json      # 12 課 60 個官方聽力題原頁點讀熱區
└── www/                       # 鏡像目錄 (Capacitor / PWA 導出)
```

---

## 🗺️ 執行 Checklist

### 1. 專案基礎建設與三層級初始化
- [x] L1 本地：建立標準 `AGENTS.md`、`handoff.md`、`README.md`、`package.json`、`firebase.json`、`.firebaserc`、`.gitignore`、`EBOOK_SCROLLBAR_SPEC.md`。
- [x] L2 GitHub：代碼版本控管準備與收工同步。
- [x] L3 Obsidian：在第二大腦建立專案筆記。

### 2. 官方圖資與音訊庫建置
- [x] **官方原裝音訊庫**：全量提取 60 個官方練習冊聽力 MP3 至 `src/assets/audio/` (`SJ_W_1B_*.mp3`)。
- [x] **官方圖資端點探測**：成功解析官方電子書 `Dir=774`（全書實體圖共 102 頁，`001.jpg` ~ `102.jpg`）。
- [x] **全書 102 頁高畫質原書彩圖下載**：自 `Dir=774` 下載全 102 頁至 `src/assets/pages/`，完整度 100%。

### 3. 資料集與閱讀器引擎建置
- [x] **結構化元資料**：建置 `src/data/book_meta.json` 包含 1~12 課及附錄目錄結構。
- [x] **原頁聽力點讀熱區**：精確定位 12 個單元聽力頁面共 60 個題號熱區至 `src/data/hotspots.json`，呈現藍莓香芋紫光暈與 `🎧` 耳機。
- [x] **閱讀器核心與樣式**：完成符合黃金版面之翻頁引擎 `reader-engine.js`、三段速 `kitty-voice.js` 與樣式庫。
- [x] **Firebase 獨立專屬站點部署**：建立專屬站點 `sejong-workbook-1b-1ec2a`，成功發布上線。
