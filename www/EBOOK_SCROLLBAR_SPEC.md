# 📜 官方電子書自然垂直滾動條與舒適大版面規範手冊
# (E-Book Natural Vertical Scrollbar & Viewport Pinning Specification)

> **版本**：`v1.0.0`  
> **制定日期**：2026-10-06 (PT 洛杉磯時間)  
> **適用專案**：世宗韓國語系列（1A、1B、2A、2B）、韓語教材電子書、所有橫向雙頁/直向單頁數位教科書閱讀器  
> **核心目標**：徹底消除強制擠壓在單一視窗高 (`100vh`) 所導致的文字過小、無法辨識與介面壓迫感；提供符合人體工學的自然垂直滾動、高清晰版面、馬卡龍粉彩卷軸與視窗鎖定控制項。

---

## 💡 1. 痛點分析與設計哲學 (Why & Design Philosophy)

### 傳統數位翻頁器的致命缺陷（強制單螢幕適配）：
1. **課本文字過小**：教科書具備較高長寬比（如 `589:807` ≈ `1:1.37`）。在雙頁模式下，為硬塞進 `100vh` 視窗（常見筆電可用高度僅 600~750px），書本寬度會被壓縮至極小，導致韓文字母筆畫黏在一起，讀者需費力瞇眼。
2. **底部控制項遮擋**：當固定在畫面底端時，如果視窗尺寸受限，控制條會直接蓋住課本最末幾行關鍵詞彙或練習題。
3. **僵硬無滾動條**：讀者習慣如閱讀 PDF 或現代網頁般垂直流暢滑動，固定無滾動條的畫面顯得死板且難以細讀長內容。

### 本規範核心設計哲學：
- **舒適優先（Comfort First）**：以人眼最舒適的閱讀字體大小為基準設定書本高度（`clamp` 彈性區間）。
- **解鎖自然垂直滾動（Natural Vertical Scrollbar）**：視窗不夠高時自然出現美觀精緻的垂直滾動條。
- **操作項視窗鎖定（Viewport Pinning）**：翻頁箭頭與底部膠囊控制列採 `position: fixed` 鎖定在全螢幕黃金操作區，頁面滾動時不跑位、不遮擋課文。
- **翻頁平滑回頂（Auto Scroll-to-Top）**：點擊翻頁或快速跳頁時，閱讀器自動平滑滾動回頂端，還原紙本翻頁直覺。

---

## 🎨 2. 視窗架構與 HTML DOM 結構規範

請確保閱讀器 DOM 結構符合以下層級，以實現最完美的滾動與固定控制項：

```html
<main class="reader-viewport" id="readerViewport">
  <!-- 1. 兩側翻頁浮動箭頭（fixed 鎖定於視窗兩側中央） -->
  <button class="flip-arrow-btn prev-btn" id="prevPageBtn" title="上一頁 (←)">‹</button>
  <button class="flip-arrow-btn next-btn" id="nextPageBtn" title="下一頁 (→)">›</button>

  <!-- 2. 書本主舞台（隨內容高度自然向下舒展，預留上下與底部邊距） -->
  <div class="book-stage" id="bookStage">
    <div class="book-wrapper spread-mode" id="bookWrapper">
      <!-- 左頁容器 -->
      <div class="book-page left-page" id="pageLeftContainer">
        <img class="page-img" id="leftPageImg" src="..." alt="左頁">
        <div class="page-hotspots-layer" id="leftHotspots"></div>
      </div>

      <!-- 右頁容器（跨頁模式顯示） -->
      <div class="book-page right-page" id="pageRightContainer">
        <img class="page-img" id="rightPageImg" src="..." alt="右頁">
        <div class="page-hotspots-layer" id="rightHotspots"></div>
      </div>
    </div>
  </div>

  <!-- 3. 底端浮動膠囊控制列（fixed 鎖定於底端膠捲縮圖上方） -->
  <div class="floating-bottom-bar">
    <div class="page-indicator">
      <span>第</span>
      <input type="number" id="pageInput" class="page-jump-input" min="1" max="66" value="1">
      <span>/ 66 頁</span>
    </div>
    <div style="height: 18px; width: 1px; background: var(--border-soft);"></div>
    <div class="speed-selector-group">
      <button class="speed-btn" data-speed="0.3">0.3x</button>
      <button class="speed-btn" data-speed="0.7">0.7x</button>
      <button class="speed-btn active" data-speed="1.0">1.0x</button>
    </div>
  </div>
</main>
```

---

## 💅 3. 核心 CSS 規範（標準樣式碼範本）

請直接引用或套用以下 CSS 規則至電子書的 `reader.css`：

```css
/* ==========================================================================
   1. 閱讀主視窗：解鎖自然垂直滾動與客製化馬卡龍粉彩滾動條
   ========================================================================== */
.reader-viewport {
  flex: 1;
  position: relative;
  background: #F4EFEB;                 /* 溫潤護眼暖杏米底色 */
  overflow-y: auto;                   /* 強制允許垂直滾動 */
  overflow-x: hidden;                 /* 嚴禁水平溢出滾動 */
  user-select: none;
  scroll-behavior: smooth;            /* 換頁與點擊時平滑滑動 */
  box-sizing: border-box;

  /* Firefox 捲軸樣式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 94, 126, 0.4) #F4EFEB;
}

/* WebKit (Chrome, Edge, Safari) 客製化捲軸 */
.reader-viewport::-webkit-scrollbar {
  width: 8px;
}

.reader-viewport::-webkit-scrollbar-track {
  background: #F4EFEB;
}

.reader-viewport::-webkit-scrollbar-thumb {
  background: rgba(255, 94, 126, 0.35); /* 草莓粉柔和半透明 */
  border-radius: 4px;
  border: 2px solid #F4EFEB;
}

.reader-viewport::-webkit-scrollbar-thumb:hover {
  background: #FF5E7E;                 /* 懸停時鮮明草莓粉 */
}

/* ==========================================================================
   2. 主舞台與書本容器：舒適大尺寸彈性展延 (Clamp Elastic Sizing)
   ========================================================================== */
.book-stage {
  display: flex;
  align-items: flex-start;            /* 從頂部開始排列，確保向下滾動時頂部不被切齊 */
  justify-content: center;
  min-height: 100%;
  padding: 24px 20px 96px;            /* 底部留出 96px，確保滾動到最底時課文完全避開控制列 */
  box-sizing: border-box;
  position: relative;
  transition: transform 0.2s ease-out;
}

.book-wrapper {
  display: flex;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.14), 0 5px 15px rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  background: white;
  position: relative;
  width: auto;
  max-width: 96vw;
  margin: 0 auto;
}

/* 雙頁跨頁模式（Spread Mode）：維持大字體舒適度，高度隨螢幕適應 */
.book-wrapper.spread-mode {
  height: clamp(680px, 86vh, 1050px);
}

/* 單頁模式（Single Page Mode）：加大展示尺寸 */
.book-wrapper:not(.spread-mode) {
  height: clamp(700px, 88vh, 1100px);
}

.book-page {
  position: relative;
  height: 100%;
  aspect-ratio: 589 / 807;            /* 世宗教科書官方標準長寬比 */
  background-color: #FAFAFA;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.book-page img.page-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

/* 書脊立體光影陰影 */
.book-wrapper.spread-mode .book-page.left-page {
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: inset -15px 0 20px -10px rgba(0, 0, 0, 0.08);
}

.book-wrapper.spread-mode .book-page.right-page {
  box-shadow: inset 15px 0 20px -10px rgba(0, 0, 0, 0.08);
}

/* ==========================================================================
   3. 操作控制項：全螢幕視窗鎖定 (Fixed Viewport Pinning)
   ========================================================================== */
/* 翻頁浮動箭頭：固定於瀏覽器兩側垂直置中 */
.flip-arrow-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1.5px solid #EFE9E0;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #2D3748;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flip-arrow-btn:hover {
  background: white;
  color: #FF5E7E;
  transform: translateY(-50%) scale(1.12);
  box-shadow: 0 8px 22px rgba(255, 94, 126, 0.2);
}

.flip-arrow-btn.prev-btn { left: 24px; }
.flip-arrow-btn.next-btn { right: 24px; }

/* 浮動底端控制列：固定於底端膠捲縮圖列上方 */
.floating-bottom-bar {
  position: fixed;
  bottom: 82px;                       /* 膠捲抽屜為 70px，故固定在 82px 處 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  padding: 6px 18px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1.5px solid #EFE9E0;
  z-index: 60;
}

/* ==========================================================================
   4. 行動端與平板響應式適配 (Responsive Adaptation)
   ========================================================================== */
@media (max-width: 900px) {
  .book-stage {
    padding: 16px 10px 100px;
  }

  .book-wrapper.spread-mode {
    height: clamp(520px, 80vh, 850px);
  }

  .book-wrapper:not(.spread-mode) {
    height: clamp(580px, 85vh, 920px);
  }

  .floating-bottom-bar {
    bottom: 64px;
    padding: 5px 14px;
  }
}

@media (max-width: 600px) {
  .book-stage {
    padding: 12px 6px 100px;
  }

  .book-wrapper {
    max-width: 98vw;
  }

  .book-wrapper:not(.spread-mode) {
    height: clamp(520px, 82vh, 800px);
  }

  .floating-bottom-bar {
    bottom: 60px;
    padding: 4px 12px;
  }
}
```

---

## ⚡ 4. JavaScript 配合規範（平滑回頂與頁面聯動）

在 `ReaderEngine` 類別中，請務必加入以下邏輯以保證使用者體驗：

### 1. 取得視窗引用 (Constructor)
```javascript
class ReaderEngine {
  constructor(bookMeta, hotspotsData) {
    // 獲取具備滾動條的主視窗容器
    this.readerViewport = document.getElementById('readerViewport');
    // ... 其他初始化
  }
}
```

### 2. 換頁自動回頂 (goToPage Method)
```javascript
goToPage(pageNum) {
  // 邊界檢查與雙頁對齊計算...
  this.renderCurrentPages();
  this.updateControls();
  this.updateFilmstripActive();
  this.syncChapterSelect();
  this.preloadAdjacentPages();

  // ✨ 核心邏輯：換頁時平滑滾動回頁面頂端
  if (this.readerViewport) {
    this.readerViewport.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
```

---

## 🎯 5. 點讀熱區（Hotspots）零誤差保障原理

許多工程師擔心「如果開放了垂直滾動條與動態放大尺寸，發音熱區（紅框）會不會歪掉？」

**答案是：100% 絕對不會歪！**
- 因為所有熱區容器（`.page-hotspots-layer`）均設定：
  ```css
  .page-hotspots-layer {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
  }
  ```
- 所有的單字框座標皆採用 **百分比（Percentage Coordinates, 如 `left: 7.5%`, `top: 14.2%`）**。
- 不管 `.book-page` 放大到 800px 還是 1200px 高度，熱區與底圖的相對比例永遠恆定 `1:1`，隨圖片一同等比例高清放大，且跟隨滾動條同步平移！

---

## 📋 6. 新專案（如 1B）應用檢查清單 (Checklist)

當您在製作《世宗韓國語 1B》或其他教科書系統時，請逐項檢查：
- [ ] `.reader-viewport` 是否設定 `overflow-y: auto; overflow-x: hidden;`？
- [ ] 是否已套用粉彩卷軸樣式（`scrollbar-color` 與 `::-webkit-scrollbar`）？
- [ ] `.book-stage` 是否使用 `align-items: flex-start; min-height: 100%; padding-bottom: 96px;`？
- [ ] `.book-wrapper` 高度是否使用 `clamp()` 彈性函數而非硬編碼 `height: 100%`？
- [ ] `.flip-arrow-btn` 與 `.floating-bottom-bar` 是否設定為 `position: fixed`？
- [ ] 翻頁函數 `goToPage` 是否包含 `this.readerViewport.scrollTo({ top: 0, behavior: 'smooth' })`？

遵循此規格，所有教材專案均能擁有如同原版紙本書質感的「清晰大版面」與現代數位閱讀的流暢滾動體驗！
