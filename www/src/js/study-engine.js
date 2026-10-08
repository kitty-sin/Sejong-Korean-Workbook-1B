/**
 * StudyEngine - 模式 B：韓系粉彩輔助學習大廳
 * - 拍立得 3D 翻轉單字卡 (Polaroid 3D Flip Cards)
 * - 螢光筆語法透視卡 (Grammar Lens)
 * - 隨堂互動測驗 (Listen & Identify Quizzes)
 */

class StudyEngine {
  constructor(lessonsData) {
    this.lessonsData = lessonsData || { units: {} };
    this.currentUnitKey = 'unit_01'; // 預設顯示第 1 課
    this.activeTab = 'cards'; // 'cards' | 'grammar' | 'quiz'

    this.container = document.getElementById('studyViewport');
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setUnit(unitKey) {
    if (this.lessonsData.units[unitKey]) {
      this.currentUnitKey = unitKey;
      this.render();
    }
  }

  setTab(tabName) {
    this.activeTab = tabName;
    this.render();
  }

  render() {
    if (!this.container) return;
    const unit = this.lessonsData.units[this.currentUnitKey] || this.lessonsData.units['unit_01'];
    if (!unit) return;

    this.container.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <!-- 單元標題與切換導航 -->
        <div style="background: white; border-radius: var(--radius-md); padding: 20px 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span class="capsule-badge strawberry">課綱對齊</span>
              <h2 style="font-size: 1.35rem; color: var(--strawberry); font-weight: 800;">${unit.title}</h2>
            </div>
            <p style="font-size: 0.88rem; color: var(--text-muted);">${unit.subtitle}</p>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <select id="studyUnitSelector" class="chapter-select" style="max-width: 200px;">
              ${Object.keys(this.lessonsData.units).map(k => `
                <option value="${k}" ${k === this.currentUnitKey ? 'selected' : ''}>
                  ${this.lessonsData.units[k].title}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 學習分頁標籤 (Tabs) -->
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <button class="pastel-btn ${this.activeTab === 'cards' ? 'primary' : ''}" id="tabCardsBtn">
            🎴 拍立得 3D 單字卡 (${unit.cards ? unit.cards.length : 0})
          </button>
          <button class="pastel-btn ${this.activeTab === 'grammar' ? 'secondary' : ''}" id="tabGrammarBtn">
            🖍️ 螢光筆語法透視 (${unit.grammarLenses ? unit.grammarLenses.length : 0})
          </button>
          <button class="pastel-btn ${this.activeTab === 'quiz' ? 'mint-btn' : ''}" id="tabQuizBtn">
            🎯 隨堂聽說測驗 (${unit.quizzes ? unit.quizzes.length : 0})
          </button>
        </div>

        <!-- 內容呈現區 -->
        <div id="studyTabContent">
          ${this.renderTabContent(unit)}
        </div>
      </div>
    `;

    this.bindEvents(unit);
  }

  renderTabContent(unit) {
    if (this.activeTab === 'cards') {
      return this.renderCards(unit.cards || []);
    } else if (this.activeTab === 'grammar') {
      return this.renderGrammar(unit.grammarLenses || []);
    } else if (this.activeTab === 'quiz') {
      return this.renderQuizzes(unit.quizzes || []);
    }
    return '';
  }

  renderCards(cards) {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
        ${cards.map((card, idx) => `
          <div class="polaroid-card-container" id="pcard_${idx}">
            <div class="polaroid-card-inner">
              <!-- 正面 (Front) -->
              <div class="polaroid-front">
                <div class="card-top-tag">
                  <span class="capsule-badge strawberry">${card.category}</span>
                  <span style="font-size: 0.72rem; color: #BBB;">點擊 3D 翻面 ↺</span>
                </div>
                <div>
                  <div class="card-korean-hero">${card.korean}</div>
                  <div class="card-romaja">${card.romaja || ''}</div>
                </div>
                <div class="card-bottom-bar">
                  <div class="audio-play-pill card-audio-btn" data-text="${card.korean}">
                    🔊 1.0x
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="popover-speed-pill card-speed-btn" data-text="${card.korean}" data-speed="0.3">0.3x</button>
                    <button class="popover-speed-pill card-speed-btn" data-text="${card.korean}" data-speed="0.7">0.7x</button>
                  </div>
                </div>
              </div>

              <!-- 背面 (Back) -->
              <div class="polaroid-back">
                <div class="card-top-tag">
                  <span class="capsule-badge mint">中文釋義</span>
                  <span style="font-size: 0.72rem; color: #BBB;">再次點擊翻回 ↻</span>
                </div>
                <div style="margin: auto 0;">
                  <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin-bottom: 6px;">
                    ${card.meaning}
                  </div>
                  <div style="font-size: 0.95rem; color: var(--text-muted); font-weight: 600;">
                    ${card.korean}
                  </div>
                </div>
                <div class="card-bottom-bar">
                  <span style="font-size: 0.75rem; color: #AAA;">世宗韓語 1A 官方必備</span>
                  <div class="audio-play-pill card-audio-btn" data-text="${card.korean}">
                    🔊 朗讀
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderGrammar(lenses) {
    return `
      <div style="max-width: 800px; margin: 0 auto;">
        ${lenses.map(lens => `
          <div class="grammar-lens-card" style="border-left-color: ${lens.color};">
            <h3 style="color: ${lens.color}; font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">
              ${lens.title}
            </h3>
            <div class="grammar-formula">${lens.formula}</div>
            <p style="font-size: 0.92rem; color: var(--text-dark); line-height: 1.6; margin-bottom: 14px;">
              ${lens.explanation}
            </p>

            <div style="background: #FFFDF9; border: 1px solid var(--border-soft); border-radius: var(--radius-sm); padding: 12px 16px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
                🌟 課本官方例句與透視：
              </div>
              ${lens.examples.map(ex => `
                <div class="grammar-example-item">
                  <div>
                    <span style="font-weight: 700; color: ${lens.color}; font-size: 1rem;">${ex.ko}</span>
                    <span style="color: var(--text-muted); margin-left: 8px; font-size: 0.85rem;">— ${ex.zh}</span>
                  </div>
                  <button class="audio-play-pill card-audio-btn" data-text="${ex.ko}" style="cursor: pointer;">
                    🔊 發音
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderQuizzes(quizzes) {
    return `
      <div style="max-width: 720px; margin: 0 auto;">
        ${quizzes.map((q, qIdx) => `
          <div style="background: white; border-radius: var(--radius-md); padding: 22px; box-shadow: var(--shadow-sm); margin-bottom: 18px; border: 1.5px solid var(--border-soft);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span class="capsule-badge apricot">第 ${qIdx + 1} 題</span>
              ${q.audio ? `
                <button class="pastel-btn primary card-audio-btn" data-text="${q.audio}" style="padding: 4px 12px; font-size: 0.8rem;">
                  🔊 播放題目語音
                </button>
              ` : ''}
            </div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-dark); margin-bottom: 16px;">
              ${q.question}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${q.options.map((opt, oIdx) => `
                <button class="quiz-opt-btn pastel-btn" data-qidx="${qIdx}" data-oidx="${oIdx}" data-correct="${q.answerIndex}" style="justify-content: flex-start; text-align: left; padding: 12px 16px; border-radius: var(--radius-sm);">
                  ${['A', 'B', 'C', 'D'][oIdx]}. ${opt}
                </button>
              `).join('')}
            </div>
            <div class="quiz-feedback" id="feedback_${qIdx}" style="margin-top: 12px; font-size: 0.88rem; font-weight: 700; display: none;"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents(unit) {
    // 單元切換
    document.getElementById('studyUnitSelector')?.addEventListener('change', (e) => {
      this.setUnit(e.target.value);
    });

    // 分頁切換按鈕
    document.getElementById('tabCardsBtn')?.addEventListener('click', () => this.setTab('cards'));
    document.getElementById('tabGrammarBtn')?.addEventListener('click', () => this.setTab('grammar'));
    document.getElementById('tabQuizBtn')?.addEventListener('click', () => this.setTab('quiz'));

    // 拍立得 3D 翻轉卡片點擊
    document.querySelectorAll('.polaroid-card-container').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-audio-btn') || e.target.closest('.card-speed-btn')) return;
        card.classList.toggle('flipped');
      });
    });

    // 發音播放按鈕
    document.querySelectorAll('.card-audio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.text;
        if (window.kittyVoice) window.kittyVoice.speak(text);
      });
    });

    document.querySelectorAll('.card-speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.text;
        const speed = parseFloat(btn.dataset.speed);
        if (window.kittyVoice) window.kittyVoice.speak(text, speed);
      });
    });

    // 測驗答題點擊
    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qIdx = btn.dataset.qidx;
        const oIdx = parseInt(btn.dataset.oidx, 10);
        const correct = parseInt(btn.dataset.correct, 10);
        const fb = document.getElementById(`feedback_${qIdx}`);

        const siblings = btn.parentElement.querySelectorAll('.quiz-opt-btn');
        siblings.forEach(s => s.disabled = true);

        if (oIdx === correct) {
          btn.style.background = '#D1FAE5';
          btn.style.borderColor = '#10B981';
          btn.style.color = '#065F46';
          if (fb) {
            fb.style.display = 'block';
            fb.style.color = '#10B981';
            fb.innerHTML = '🎉 答對了！恭喜精準掌握！';
          }
        } else {
          btn.style.background = '#FEE2E2';
          btn.style.borderColor = '#EF4444';
          btn.style.color = '#991B1B';
          siblings[correct].style.background = '#D1FAE5';
          siblings[correct].style.borderColor = '#10B981';
          if (fb) {
            fb.style.display = 'block';
            fb.style.color = '#EF4444';
            fb.innerHTML = `❌ 答錯囉！正確答案是：${siblings[correct].textContent.trim()}`;
          }
        }
      });
    });
  }
}

window.StudyEngine = StudyEngine;
