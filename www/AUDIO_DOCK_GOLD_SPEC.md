# 🎧 零遮擋固定底端迷你語音播放列黃金規範手冊 (Audio Dock Gold Specification)
# (Zero-Overlay Fixed Mini Audio Dock UI/UX Engineering Standard)

> **規範版本**：`v1.0.0`  
> **制定時間**：2026-10-07 (PT 洛杉磯時間)  
> **適用範圍**：所有韓語教材、世宗韓語系列（Textbook / Workbook）、電子書點讀與音訊播放器  
> **標準實作**：`Sejong Korean 1A`（`index.html`、`reader-engine.js`、`overlay.css`、`kitty-voice.js`）

---

## 🌟 1. 設計哲學與解決之痛點 (Design Philosophy & Problem Solved)

### 傳統「原地浮動氣泡彈窗（Speech Popover）」之致命痛點
1. **遮擋關鍵課文**：點擊頁面上的單字或對話時，彈出的氣泡框會直接遮蔽上方的指引、下方的書寫筆順、拼音或下續題型，嚴重干擾學習專注力。
2. **定位受限與溢出**：當熱區位於頁面邊緣（頂端或底端）時，氣泡框容易超出螢幕可視區或箭頭方向混亂。

### 零遮擋固定底端迷你播放列 (Audio Dock) 之核心標準
1. **課本內容 100% 毫無遮擋 (Zero Obscuration)**：
   - 點擊課本任何句子、單字或聽力題號時，**課本彩頁畫面上絕不彈出任何覆蓋文字的大氣泡框**。
   - 原文點讀熱區僅亮起精緻的 **綠色呼吸光暈（Pulse Glow）**，清楚提示正在播放，課文內容一覽無餘。
2. **邊界控制統一 (Docking at Boundary)**：
   - 控制項統整於畫面底端的 **固定迷你播放膠囊列（Audio Dock Pill）**，浮動於底部頁碼切換列上方。
   - 提供最直覺的雙行資訊、播放控制與實時變速切換。

---

## 🎨 2. 視覺規格與色票標準 (Visual & Color Standards)

| 介面元素 | 規格 / 色票 | 設計細節 |
|---|---|---|
| **膠囊背景 (Pill Background)** | `rgba(255, 255, 255, 0.96)` | 毛玻璃 `backdrop-filter: blur(16px)`，高階自然透光 |
| **膠囊陰影 (Elevation Shadow)** | `0 10px 32px rgba(0, 0, 0, 0.14)` | 拍立得浮空立體陰影，圓角 `border-radius: 9999px` |
| **韓語標題 (Korean Text)** | 草莓粉 `#FF5E7E` | `font-weight: 800`，超長文字自適應省略 (`text-overflow: ellipsis`) |
| **繁中釋義 (Traditional Chinese)**| 深杏墨灰 `#888` / `#2b2b2b` | `font-size: 0.78rem; font-weight: 600`，繁體中文臺灣正體 |
| **暫停狀態光暈 (Paused State)** | 溫暖杏黃 `#fef3c7` / 邊框 `#f59e0b` | 圖示同步切換為 `▶️`，字體切換為「繼續」 |
| **三段速播放標籤 (Speed Pills)** | 抹茶薄荷 / 草莓粉 | 支援 `0.3x`（拆解）、`0.7x`（跟讀）、`1.0x`（正常）實時切換 |
| **原頁熱區光暈 (Hotspot Pulse)**| 抹茶薄荷 `rgba(16, 185, 129, 0.25)` | 邊框 `2px solid #10B981`，放射光暈 `box-shadow` |

---

## 🧩 3. 標準 HTML 結構樣板 (DOM Structure)

放置於電子書主畫面底部（固定於 `floating-bottom-bar` 上方）：

```html
<!-- 固定語音播放膠囊列 (Fixed Mini Audio Dock - 課本 100% 零遮擋) -->
<div class="audio-dock-container" id="audioDockContainer">
  <div class="audio-dock-pill">
    <!-- 1. 關閉按鈕 -->
    <button class="dock-close-btn" id="dockCloseBtn" title="關閉播放列">✕</button>

    <!-- 2. 播放資訊 (韓文原句 + 繁體中文) -->
    <div class="dock-info">
      <div class="dock-korean" id="dockKorean">🎧 點擊課文發音</div>
      <div class="dock-trans" id="dockTrans">點擊課文熱區或耳機開始播放</div>
    </div>

    <!-- 3. 核心控制項：暫停 / 重播 (膠囊風格) -->
    <div class="dock-actions">
      <button class="dock-action-btn pause-resume-btn" id="dockPauseResumeBtn" title="暫停或繼續播放">
        <span class="dock-action-icon">⏸️</span>
        <span class="dock-action-label">暫停</span>
      </button>
      <button class="dock-action-btn replay-btn" id="dockReplayBtn" title="從頭重新播放">
        <span class="dock-action-icon">🔄</span>
        <span class="dock-action-label">重播</span>
      </button>
    </div>

    <!-- 4. 三段速切換標籤 -->
    <div class="dock-speeds">
      <button class="dock-speed-pill" data-speed="0.3">0.3x</button>
      <button class="dock-speed-pill" data-speed="0.7">0.7x</button>
      <button class="dock-speed-pill active" data-speed="1.0">1.0x</button>
    </div>
  </div>
</div>
```

---

## 💅 4. 標準 CSS 樣式規格 (`overlay.css`)

```css
/* ==========================================================================
   零遮擋固定底端迷你播放膠囊列 (Fixed Mini Audio Dock)
   ========================================================================== */

.audio-dock-container {
  position: fixed;
  bottom: 130px;                       /* 位於 floating-bottom-bar (82px) 之上 */
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  z-index: 95;
  opacity: 0;
  pointer-events: none;
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: min(650px, 94vw);
  width: auto;
}

.audio-dock-container.active {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.audio-dock-pill {
  position: relative;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  border: 1.5px solid var(--border-soft, #f0e6e6);
  border-radius: var(--radius-full, 9999px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 8px 18px 8px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

/* 關閉按鈕 */
.dock-close-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary, #f8f9fa);
  color: var(--text-muted, #888);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.dock-close-btn:hover {
  background: var(--strawberry, #FF5E7E);
  color: white;
}

/* 資訊文字區塊 */
.dock-info {
  display: flex;
  flex-direction: column;
  min-width: 120px;
  max-width: 260px;
  overflow: hidden;
}

.dock-korean {
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--strawberry, #FF5E7E);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.dock-trans {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted, #888);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

/* 播放控制按鈕區塊 */
.dock-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.dock-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: #f0f4f9;
  border: 1px solid #dce4ee;
  border-radius: var(--radius-full, 9999px);
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.dock-action-btn:hover {
  background: #e2eaf4;
  border-color: #3b82f6;
  color: #1d4ed8;
  transform: translateY(-1px);
}

.dock-action-btn.paused {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #b45309;
}

.dock-action-icon {
  font-size: 0.75rem;
}

/* 三段速切換列 */
.dock-speeds {
  display: flex;
  align-items: center;
  gap: 4px;
  border-left: 1px solid var(--border-soft, #f0e6e6);
  padding-left: 10px;
  flex-shrink: 0;
}

.dock-speed-pill {
  font-size: 0.74rem;
  padding: 3px 8px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: var(--radius-full, 9999px);
  color: var(--text-dark, #2b2b2b);
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border-soft, #f0e6e6);
  transition: all 0.15s;
}

.dock-speed-pill:hover,
.dock-speed-pill.active {
  background: var(--strawberry, #FF5E7E);
  color: white;
  border-color: var(--strawberry, #FF5E7E);
}

/* 原頁熱區播放光暈 (Pulse Ring) - 課本零遮擋 */
.hotspot-box.playing {
  background: rgba(16, 185, 129, 0.25) !important;
  border: 2px solid #10B981 !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.6) !important;
  animation: pulse-ring 1.5s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* 行動端自適應 */
@media (max-width: 600px) {
  .audio-dock-container {
    bottom: 115px;
    max-width: 96vw;
  }
  .audio-dock-pill {
    padding: 6px 12px;
    gap: 8px;
  }
  .dock-info {
    max-width: 140px;
  }
  .dock-korean {
    font-size: 0.88rem;
  }
  .dock-trans {
    display: none; /* 手機端節省寬度 */
  }
  .dock-action-label {
    display: none; /* 手機端純顯示圖標 */
  }
}
```

---

## ⚡ 5. JavaScript 控制與狀態機規範 (`reader-engine.js`)

```javascript
class ReaderEngine {
  // 1. 觸發熱區發音
  triggerHotspot(spot, element) {
    element.classList.add('playing');
    
    // 播放語音（MP3 或 TTS）
    if (spot.audio && window.kittyVoice) {
      window.kittyVoice.playAudioFile(spot.audio).then(() => {
        element.classList.remove('playing');
      });
    } else if (window.kittyVoice) {
      window.kittyVoice.speak(spot.text).then(() => {
        element.classList.remove('playing');
      });
    }

    // 調用零遮擋底端播放列
    this.showAudioDock(spot, element);
  }

  // 2. 顯示並更新底端播放列
  showAudioDock(spot, element) {
    const dockContainer = document.getElementById('audioDockContainer');
    if (!dockContainer) return;

    this.activeSpot = spot;
    this.activeHotspotEl = element;

    const dockKorean = document.getElementById('dockKorean');
    const dockTrans = document.getElementById('dockTrans');
    const pauseBtn = document.getElementById('dockPauseResumeBtn');
    const pauseLabel = pauseBtn?.querySelector('.dock-action-label');
    const pauseIcon = pauseBtn?.querySelector('.dock-action-icon');
    const replayBtn = document.getElementById('dockReplayBtn');
    const closeBtn = document.getElementById('dockCloseBtn');

    const isAudio = spot.type === 'audio' || !!spot.audio;
    if (dockKorean) dockKorean.textContent = `${isAudio ? '🎧 ' : ''}${spot.text}`;
    if (dockTrans) dockTrans.textContent = spot.translation;

    dockContainer.classList.add('active');

    // 重設播放按鈕狀態
    if (pauseLabel) pauseLabel.textContent = '暫停';
    if (pauseIcon) pauseIcon.textContent = '⏸️';
    pauseBtn?.classList.remove('paused');

    let currentSpeed = 1.0;
    const playCurrent = (spd = currentSpeed) => {
      if (!window.kittyVoice) return;
      if (spot.audio) {
        window.kittyVoice.playAudioFile(spot.audio, spd);
      } else {
        window.kittyVoice.speak(spot.text, spd);
      }
    };

    // 關閉播放列
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.closeAudioDock();
      };
    }

    // 暫停 / 繼續
    if (pauseBtn) {
      pauseBtn.onclick = (e) => {
        e.stopPropagation();
        if (!window.kittyVoice) return;

        if (window.kittyVoice.isPlaying) {
          window.kittyVoice.pause();
          if (pauseLabel) pauseLabel.textContent = '繼續';
          if (pauseIcon) pauseIcon.textContent = '▶️';
          pauseBtn.classList.add('paused');
        } else if (window.kittyVoice.isPaused) {
          window.kittyVoice.resume();
          if (pauseLabel) pauseLabel.textContent = '暫停';
          if (pauseIcon) pauseIcon.textContent = '⏸️';
          pauseBtn.classList.remove('paused');
        } else {
          playCurrent();
          if (pauseLabel) pauseLabel.textContent = '暫停';
          if (pauseIcon) pauseIcon.textContent = '⏸️';
          pauseBtn.classList.remove('paused');
        }
      };
    }

    // 從頭重播
    if (replayBtn) {
      replayBtn.onclick = (e) => {
        e.stopPropagation();
        playCurrent();
        if (pauseLabel) pauseLabel.textContent = '暫停';
        if (pauseIcon) pauseIcon.textContent = '⏸️';
        pauseBtn?.classList.remove('paused');
      };
    }

    // 語速切換
    dockContainer.querySelectorAll('.dock-speed-pill').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        dockContainer.querySelectorAll('.dock-speed-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSpeed = parseFloat(btn.dataset.speed);
        playCurrent(currentSpeed);
        if (pauseLabel) pauseLabel.textContent = '暫停';
        if (pauseIcon) pauseIcon.textContent = '⏸️';
        pauseBtn?.classList.remove('paused');
      };
    });

    // 監聽 KittyVoice 狀態機同步
    if (window.kittyVoice) {
      window.kittyVoice.onStateChange((state) => {
        if (!dockContainer.classList.contains('active')) return;
        if (state.isPlaying) {
          if (pauseLabel) pauseLabel.textContent = '暫停';
          if (pauseIcon) pauseIcon.textContent = '⏸️';
          pauseBtn?.classList.remove('paused');
        } else if (state.isPaused) {
          if (pauseLabel) pauseLabel.textContent = '繼續';
          if (pauseIcon) pauseIcon.textContent = '▶️';
          pauseBtn?.classList.add('paused');
        } else {
          element?.classList.remove('playing');
        }
      });
    }
  }

  // 3. 關閉底端播放列
  closeAudioDock() {
    const dockContainer = document.getElementById('audioDockContainer');
    if (dockContainer) {
      dockContainer.classList.remove('active');
    }
    if (this.activeHotspotEl) {
      this.activeHotspotEl.classList.remove('playing');
      this.activeHotspotEl = null;
    }
    if (window.kittyVoice) {
      window.kittyVoice.stop();
    }
  }
}
```

---

## 📋 6. 驗收核對清單 (Verification Checklist)

- [x] **課本完全零遮擋**：點擊熱區時，原頁面無任何彈窗遮蔽筆順、題目與文字。
- [x] **呼吸光暈反饋**：正在發音之熱區外框有柔和脈衝綠光（`#10B981`）。
- [x] **資訊清晰雙行**：頂部韓文原句（草莓粉 `#FF5E7E`），底部臺灣正體中文釋義。
- [x] **核心雙膠囊**：暫停時顯示杏黃光暈與 `▶️ 繼續`，重播一鍵歸零。
- [x] **實時三段速**：`0.3x`、`0.7x`、`1.0x` 點擊即時以新倍速重新播放。
- [x] **手機防裁切**：寬度限制在 `96vw`，超長標題自適應截斷，中文與文字標籤在小螢幕優雅摺疊。
