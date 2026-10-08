/**
 * App - 世宗韓語 1B 主應用協調器
 * 負責載入資料、初始化電子書翻頁器與學習大廳、模式切換及全域事件控制
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. 平行載入課綱元資料與熱區資料
    const [bookMetaRes, hotspotsRes, lessonsRes] = await Promise.all([
      fetch('src/data/book_meta.json').then(r => r.json()),
      fetch('src/data/hotspots.json').then(r => r.json()).catch(() => ({ pages: {} })),
      fetch('src/data/lessons_data.json').then(r => r.json()).catch(() => ({ units: {} }))
    ]);

    // 2. 初始化閱讀器與學習引擎
    const reader = new window.ReaderEngine(bookMetaRes, hotspotsRes);
    const study = new window.StudyEngine(lessonsRes);

    // 3. 雙軌模式切換 (電子書閱讀器 vs 粉彩輔助學習)
    const modeReaderBtn = document.getElementById('modeReaderBtn');
    const modeStudyBtn = document.getElementById('modeStudyBtn');
    const readerViewport = document.getElementById('readerViewport');
    const studyViewport = document.getElementById('studyViewport');
    const filmstripDrawer = document.getElementById('filmstripDrawer');

    function switchMode(mode) {
      if (mode === 'reader') {
        modeReaderBtn?.classList.add('active');
        modeStudyBtn?.classList.remove('active');
        if (readerViewport) readerViewport.style.display = 'flex';
        if (studyViewport) studyViewport.style.display = 'none';
        if (filmstripDrawer) filmstripDrawer.style.display = 'flex';
      } else {
        modeReaderBtn?.classList.remove('active');
        modeStudyBtn?.classList.add('active');
        if (readerViewport) readerViewport.style.display = 'none';
        if (studyViewport) studyViewport.style.display = 'block';
        if (filmstripDrawer) filmstripDrawer.style.display = 'none';

        // 依目前電子書頁碼同步學習大廳的單元 (支援詞彙頁與文法頁雙向對齊)
        const currentP = reader.currentPage;
        let targetUnit = 'unit_01';
        if (bookMetaRes.units && Array.isArray(bookMetaRes.units)) {
          for (const u of bookMetaRes.units) {
            const inVocab = currentP >= u.startPage && currentP <= u.endPage;
            const inGrammar = u.grammarStartPage && currentP >= u.grammarStartPage && currentP <= u.grammarEndPage;
            if (inVocab || inGrammar) {
              targetUnit = u.id;
              break;
            }
          }
        }
        study.setUnit(targetUnit);
      }
    }

    modeReaderBtn?.addEventListener('click', () => switchMode('reader'));
    modeStudyBtn?.addEventListener('click', () => switchMode('study'));

    // 4. 語速控制切換按鈕群 (0.3x, 0.7x, 1.0x)
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const spd = parseFloat(btn.dataset.speed);
        if (window.kittyVoice) window.kittyVoice.setSpeed(spd);
      });
    });

    // 5. 單/雙頁跨頁切換
    const toggleSpreadBtn = document.getElementById('toggleSpreadBtn');
    toggleSpreadBtn?.addEventListener('click', () => {
      const newSpread = !reader.isSpreadMode;
      reader.setSpreadMode(newSpread);
      toggleSpreadBtn.textContent = newSpread ? '📖 雙頁模式' : '📄 單頁模式';
    });

    // 6. 全螢幕切換
    const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
    toggleFullscreenBtn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        toggleFullscreenBtn.textContent = '⤓ 視窗';
      } else {
        document.exitFullscreen().catch(() => {});
        toggleFullscreenBtn.textContent = '⤢ 全螢幕';
      }
    });

    // 7. 註冊 Service Worker 離線快取
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        console.log('Sejong Korean 1B Service Worker registered:', reg.scope);
      }).catch(err => {
        console.warn('SW registration failed:', err);
      });
    }

    console.log('Sejong Korean 1B Interactive App initialized successfully.');
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
