# 🎙️ 語音播放提示框黃金規範手冊 (Speech Popover Gold Specification)
# (Speech Bubble Popover & Audio Playback UI/UX Engineering Standard)

> **版本**：`v1.0.0`  
> **制定日期**：2026-10-07 (PT 洛杉磯時間)  
> **適用範圍**：所有韓語電子書、課本、練習冊（Workbook）、單字卡、對話點讀與語音互動系統  
> **基準實作**：`Sejong-Korean-Workbook-1A` 之 `reader-engine.js`、`kitty-voice.js` 與 `overlay.css`

---

## 🌟 1. 核心設計理念 (Design Philosophy)

1. **零遮擋與極致清晰**：彈窗大小適中（`min-width: 200px; max-width: min(340px, 85vw)`），排版緊湊精美，絕不遮擋關鍵教學內容。
2. **直覺操作三合一**：
   - 頂部：韓文原句（草莓粉加粗 `#FF5E7E`）+ 臺灣正體中文翻譯。
   - 中間：**【⏸️ 暫停 / 繼續】** 與 **【🔄 重播】** 雙膠囊控制按鈕。
   - 底部：**【0.3x / 0.7x / 1.0x】** KittyVoice 經典三段速切換標籤。
3. **無縫雙軌音訊適配**：
   - **真人錄音檔 (MP3)**：聽力題號點讀，調用 `playAudioFile(audioUrl, speed)`。
   - **TTS 合成語音**：單字或句型點讀，調用 `speak(text, speed)`。
   - 兩種模式皆具備完整的「暫停、繼續、重播、三段速變速」。

---

## 🎨 2. 視覺樣式與 CSS 規格 (`overlay.css`)

```css
/* 浮動語音彈窗容器 */
.speech-popover {
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md, 12px);
  padding: 12px 16px 12px 14px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1.5px solid var(--border-soft, #f0e6e6);
  z-index: 999;
  min-width: 200px;
  max-width: min(340px, 85vw);
  white-space: normal;
  word-break: keep-all;
  pointer-events: auto;
  animation: popover-fade 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 關閉按鈕 */
.popover-close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--text-muted, #888);
  cursor: pointer;
  transition: all 0.15s;
}
.popover-close-btn:hover {
  background: var(--bg-secondary, #f8f9fa);
  color: var(--strawberry, #FF5E7E);
}

/* 韓文標題與中文翻譯 */
.popover-korean {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--strawberry, #FF5E7E);
  margin-bottom: 4px;
  padding-right: 18px;
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.popover-trans {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark, #2b2b2b);
  line-height: 1.4;
  margin-bottom: 10px;
}

/* 播放控制按鈕區塊：暫停 / 重播 (膠囊風格) */
.popover-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.popover-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #f0f4f9;
  border: 1px solid #dce4ee;
  border-radius: var(--radius-full, 9999px);
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  user-select: none;
}

.popover-action-btn .action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  font-size: 0.68rem;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.35);
  transition: all 0.18s;
}

.popover-action-btn:hover {
  background: #e2eaf4;
  border-color: #3b82f6;
  color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
}

/* 暫停狀態：溫暖杏黃光暈 */
.popover-action-btn.paused {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #b45309;
}
.popover-action-btn.paused .action-icon {
  background: #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.35);
}

/* 三段速切換標籤 */
.popover-speeds {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-soft, #f0e6e6);
}

.popover-speed-pill {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: var(--radius-full, 9999px);
  color: var(--text-dark, #2b2b2b);
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border-soft, #f0e6e6);
  transition: all 0.15s;
}

.popover-speed-pill:hover,
.popover-speed-pill.active {
  background: var(--strawberry, #FF5E7E);
  color: white;
  border-color: var(--strawberry, #FF5E7E);
}
```

---

## 🧩 3. DOM 結構與 HTML 樣板

```html
<div class="speech-popover pos-top">
  <!-- 右上角關閉按鈕 -->
  <div class="popover-close-btn" title="關閉">✕</div>
  
  <!-- 標題與釋義 -->
  <div class="popover-korean">🎧 모음 연습 1 4번</div>
  <div class="popover-trans">【聽力原音】入門篇 1. 母音練習 1 4號題 (P.8) 聽力發音選擇</div>
  
  <!-- 核心控制項：暫停 / 重播 -->
  <div class="popover-actions">
    <button class="popover-action-btn pause-resume-btn" id="popoverPauseResumeBtn" title="暫停或繼續播放">
      <span class="action-icon">⏸️</span>
      <span class="action-label">暫停</span>
    </button>
    <button class="popover-action-btn replay-btn" id="popoverReplayBtn" title="從頭重新播放">
      <span class="action-icon">🔄</span>
      <span class="action-label">重播</span>
    </button>
  </div>

  <!-- 三段速列 -->
  <div class="popover-speeds">
    <button class="popover-speed-pill" data-speed="0.3">0.3x 逐字拆解</button>
    <button class="popover-speed-pill" data-speed="0.7">0.7x 慢速跟讀</button>
    <button class="popover-speed-pill active" data-speed="1.0">1.0x 自然正常</button>
  </div>
</div>
```

---

## ⚡ 4. JavaScript 狀態機與連動邏輯 (`reader-engine.js`)

在建立彈窗時，必須配置完整的播放控制事件：

```javascript
// 1. 播放指定速度
let currentSpeed = 1.0;
const playCurrent = (spd = currentSpeed) => {
  if (!window.kittyVoice) return;
  if (spot.audio) {
    window.kittyVoice.playAudioFile(spot.audio, spd);
  } else {
    window.kittyVoice.speak(spot.text, spd);
  }
};

// 2. 暫停 / 繼續
const pauseBtn = popover.querySelector('#popoverPauseResumeBtn');
const pauseLabel = pauseBtn?.querySelector('.action-label');
const pauseIcon = pauseBtn?.querySelector('.action-icon');

pauseBtn?.addEventListener('click', (e) => {
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
});

// 3. 從頭重播
const replayBtn = popover.querySelector('#popoverReplayBtn');
replayBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  playCurrent();
  if (pauseLabel) pauseLabel.textContent = '暫停';
  if (pauseIcon) pauseIcon.textContent = '⏸️';
  pauseBtn?.classList.remove('paused');
});

// 4. 語速切換
popover.querySelectorAll('.popover-speed-pill').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    popover.querySelectorAll('.popover-speed-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSpeed = parseFloat(btn.dataset.speed);
    playCurrent(currentSpeed);
    if (pauseLabel) pauseLabel.textContent = '暫停';
    if (pauseIcon) pauseIcon.textContent = '⏸️';
    pauseBtn?.classList.remove('paused');
  });
});
```

---

## 🛠️ 5. KittyVoice 底層擴充要求 (`kitty-voice.js`)

`KittyVoiceEngine` 必須提供以下標準 API：
1. `stop()`：完全停止並歸零計時器。
2. `pause()`：暫停音訊（`audioElement.pause()` 或 `synth.pause()`），並設置 `isPaused = true`。
3. `resume()`：恢復播放，並設置 `isPaused = false`。
4. `playAudioFile(url, speed)`：播放 MP3 音訊檔，具備語速設定與結束回呼。
5. `speak(text, speed)`：播放 TTS 合成語音。
6. `onStateChange(callback)`：廣播播放狀態變更，回傳 `{ isPlaying, isPaused, speed }`。

---

## 📍 6. 避坑與自動定位規則 (Smart Positioning)

- **避免頂部溢出**：若熱區位於頁面上半部（`spot.y < 35%`），彈窗採用 `.pos-bottom`（顯示於熱區下方），並將小三角形指向頂部。
- **避免底部遮擋**：若熱區位於頁面下半部（`spot.y >= 35%`），彈窗採用 `.pos-top`（顯示於熱區上方）。
- **水平防裁切**：若熱區位於最左側（`spot.x < 25%`），彈窗靠左對齊（`.align-left`）；若位於最右側（`spot.x > 60%`），彈窗靠右對齊（`.align-right`）。
