/**
 * ReaderEngine - 世宗韓語 1B 官方原裝電子書翻頁核心
 * - 支援全 102 頁原版圖片 (001.jpg ~ 102.jpg)
 * - 單頁 (Single) 與雙頁跨頁 (Spread) 自適應
 * - 鍵盤翻頁 (ArrowLeft / ArrowRight)、手勢滑動 (Touch Swipe)
 * - 縮放平移 (Zoom in/out)
 * - 底部縮圖膠捲 (Filmstrip) 快速選頁
 * - 原頁點讀熱區 (Hotspots Overlay)
 */

class ReaderEngine {
  constructor(bookMeta, hotspotsData) {
    this.bookMeta = bookMeta;
    this.hotspotsData = hotspotsData || { pages: {} };
    this.totalPages = bookMeta.totalPages || 102;
    this.currentPage = 1; // 1-indexed (對應 001.jpg)
    this.isSpreadMode = window.innerWidth > 900;
    this.zoomLevel = 1.0;
    this.activePopover = null;

    this.readerViewport = document.getElementById('readerViewport');
    this.bookStage = document.getElementById('bookStage');
    this.bookWrapper = document.getElementById('bookWrapper');
    this.pageLeftContainer = document.getElementById('pageLeftContainer');
    this.pageRightContainer = document.getElementById('pageRightContainer');
    this.leftPageImg = document.getElementById('leftPageImg');
    this.rightPageImg = document.getElementById('rightPageImg');
    this.leftHotspots = document.getElementById('leftHotspots');
    this.rightHotspots = document.getElementById('rightHotspots');
    this.filmstripDrawer = document.getElementById('filmstripDrawer');
    this.pageIndicator = document.getElementById('pageIndicator');
    this.pageInput = document.getElementById('pageInput');
    this.chapterSelect = document.getElementById('chapterSelect');

    this.initEventListeners();
    this.renderFilmstrip();
    this.populateChapterSelect();
    this.goToPage(1);
  }

  formatPageNum(num) {
    return String(num).padStart(3, '0');
  }

  getPageImgUrl(num) {
    return `src/assets/pages/${this.formatPageNum(num)}.jpg`;
  }

  populateChapterSelect() {
    if (!this.chapterSelect) return;
    this.chapterSelect.innerHTML = '';
    const list = this.bookMeta.chapters || this.bookMeta.units || [];
    list.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.page || item.startPage;
      opt.textContent = item.title;
      this.chapterSelect.appendChild(opt);
    });

    this.chapterSelect.addEventListener('change', (e) => {
      this.goToPage(parseInt(e.target.value, 10));
    });
  }

  renderFilmstrip() {
    if (!this.filmstripDrawer) return;
    this.filmstripDrawer.innerHTML = '';
    for (let p = 1; p <= this.totalPages; p++) {
      const thumb = document.createElement('div');
      thumb.className = `filmstrip-thumb ${p === this.currentPage ? 'active' : ''}`;
      thumb.dataset.page = p;
      thumb.innerHTML = `
        <img src="${this.getPageImgUrl(p)}" loading="lazy" alt="P.${p}">
        <span class="thumb-num">${p}</span>
      `;
      thumb.addEventListener('click', () => this.goToPage(p));
      this.filmstripDrawer.appendChild(thumb);
    }
  }

  updateFilmstripActive() {
    if (!this.filmstripDrawer) return;
    const thumbs = this.filmstripDrawer.querySelectorAll('.filmstrip-thumb');
    thumbs.forEach(t => {
      const p = parseInt(t.dataset.page, 10);
      if (this.isSpreadMode && this.currentPage > 1) {
        const rightP = this.currentPage + 1;
        if (p === this.currentPage || (rightP <= this.totalPages && p === rightP)) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      } else {
        if (p === this.currentPage) {
          t.classList.add('active');
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          t.classList.remove('active');
        }
      }
    });
  }

  setSpreadMode(isSpread) {
    this.isSpreadMode = isSpread;
    if (this.bookWrapper) {
      if (this.isSpreadMode) {
        this.bookWrapper.classList.add('spread-mode');
        this.pageRightContainer.style.display = 'block';
      } else {
        this.bookWrapper.classList.remove('spread-mode');
        this.pageRightContainer.style.display = 'none';
      }
    }
    this.renderCurrentPages();
  }

  goToPage(pageNum) {
    if (pageNum < 1) pageNum = 1;
    if (pageNum > this.totalPages) pageNum = this.totalPages;

    // 封面通常單獨顯示；跨頁模式時偶數頁在左、奇數頁在右
    if (this.isSpreadMode) {
      if (pageNum === 1) {
        // 封面單頁
        this.currentPage = 1;
      } else if (pageNum % 2 !== 0) {
        // 若點擊奇數頁且不是封面，對齊至上一偶數頁
        this.currentPage = pageNum - 1;
      } else {
        this.currentPage = pageNum;
      }
    } else {
      this.currentPage = pageNum;
    }

    this.renderCurrentPages();
    this.updateControls();
    this.updateFilmstripActive();
    this.syncChapterSelect();
    this.preloadAdjacentPages();

    // ✨ 核心規範：換頁時平滑滾動回頂端與左側 (Auto Scroll-to-Top & Left)
    if (this.readerViewport) {
      this.readerViewport.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    const step = (this.isSpreadMode && this.currentPage > 1) ? 2 : 1;
    this.goToPage(this.currentPage + step);
  }

  prevPage() {
    const step = (this.isSpreadMode && this.currentPage > 2) ? 2 : 1;
    this.goToPage(this.currentPage - step);
  }

  renderCurrentPages() {
    this.closePopover();

    // 渲染左頁 (或是單頁模式之唯一頁)
    const leftPageNum = this.currentPage;
    this.leftPageImg.src = this.getPageImgUrl(leftPageNum);
    this.renderHotspots(leftPageNum, this.leftHotspots);

    // 渲染右頁 (跨頁模式)
    if (this.isSpreadMode && leftPageNum > 1 && (leftPageNum + 1) <= this.totalPages) {
      const rightPageNum = leftPageNum + 1;
      this.pageRightContainer.style.display = 'block';
      this.rightPageImg.src = this.getPageImgUrl(rightPageNum);
      this.renderHotspots(rightPageNum, this.rightHotspots);
    } else if (this.isSpreadMode && leftPageNum === 1) {
      // 封面單獨置中
      this.pageRightContainer.style.display = 'none';
    } else {
      this.pageRightContainer.style.display = 'none';
    }
  }

  renderHotspots(pageNo, container) {
    if (!container) return;
    container.innerHTML = '';
    const pageHotspots = this.hotspotsData.pages[String(pageNo)] || [];
    
    pageHotspots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'hotspot-box';
      el.style.left = `${spot.x}%`;
      el.style.top = `${spot.y}%`;
      el.style.width = `${spot.width}%`;
      el.style.height = `${spot.height}%`;
      el.title = `${spot.text} (${spot.translation})`;
      
      if (spot.type === 'listening') {
        el.classList.add('hotspot-listening');
        el.innerHTML = `<span class="hotspot-speaker-icon listening-icon">🎧</span>`;
      } else {
        el.innerHTML = `<span class="hotspot-speaker-icon">🔊</span>`;
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerHotspot(spot, el);
      });

      container.appendChild(el);
    });
  }

  triggerHotspot(spot, element) {
    element.classList.add('playing');
    
    // 若有綁定官方原裝音訊，優先播放官方原音檔
    if (spot.audio && window.kittyVoice) {
      window.kittyVoice.playAudioFile(spot.audio).then(() => {
        element.classList.remove('playing');
      });
    } else if (window.kittyVoice) {
      window.kittyVoice.speak(spot.text).then(() => {
        element.classList.remove('playing');
      });
    }

    // 調用 方案 A：固定底端迷你播放列（徹底零遮擋課本）
    this.showAudioDock(spot, element);
  }

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

    const isAudio = spot.type === 'listening' || spot.type === 'audio' || !!spot.audio;
    if (dockKorean) dockKorean.textContent = `${isAudio ? '🎧 ' : ''}${spot.text}`;
    if (dockTrans) dockTrans.textContent = spot.translation;

    dockContainer.classList.add('active');

    // 重設播放/暫停按鈕狀態
    if (pauseLabel) pauseLabel.textContent = '暫停';
    if (pauseIcon) pauseIcon.textContent = '⏸️';
    pauseBtn?.classList.remove('paused');

    // 取得當前播放器設定語速 (預設 1.0)
    let currentSpeed = window.kittyVoice ? (window.kittyVoice.currentSpeed || 1.0) : 1.0;

    // 同步初始化當前速度按鈕高亮
    dockContainer.querySelectorAll('.dock-speed-pill').forEach(btn => {
      const spd = parseFloat(btn.dataset.speed);
      if (Math.abs(spd - currentSpeed) < 0.05) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const playCurrent = (spd = currentSpeed) => {
      if (!window.kittyVoice) return;
      if (spot.audio) {
        window.kittyVoice.playAudioFile(spot.audio, spd);
      } else {
        window.kittyVoice.speak(spot.text, spd);
      }
    };

    // 關閉按鈕
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

    // 重播
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

    // 狀態同步
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

  closePopover() {
    this.closeAudioDock();
  }

  updateControls() {
    if (this.pageInput) {
      this.pageInput.value = this.currentPage;
    }
  }

  syncChapterSelect() {
    if (!this.chapterSelect) return;
    const currentP = this.currentPage;
    const list = this.bookMeta.chapters || this.bookMeta.units || [];
    let matched = list[0];
    for (let i = 0; i < list.length; i++) {
      const curr = list[i];
      const next = list[i + 1];
      const start = curr.page || curr.startPage;
      const end = next ? ((next.page || next.startPage) - 1) : this.totalPages;
      if (currentP >= start && currentP <= end) {
        matched = curr;
        break;
      }
    }
    if (matched) {
      this.chapterSelect.value = matched.page || matched.startPage;
    }
  }

  preloadAdjacentPages() {
    const pagesToPreload = [
      this.currentPage + 1,
      this.currentPage + 2,
      this.currentPage - 1
    ].filter(p => p >= 1 && p <= this.totalPages);

    pagesToPreload.forEach(p => {
      const img = new Image();
      img.src = this.getPageImgUrl(p);
    });
  }

  initEventListeners() {
    // 左右箭頭按鈕
    document.getElementById('prevPageBtn')?.addEventListener('click', () => this.prevPage());
    document.getElementById('nextPageBtn')?.addEventListener('click', () => this.nextPage());

    // 鍵盤左右方向鍵翻頁
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        this.nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.prevPage();
      }
    });

    // 頁碼輸入框
    this.pageInput?.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) this.goToPage(val);
    });

    // 視窗 resize 自動判斷是否雙頁
    window.addEventListener('resize', () => {
      const shouldSpread = window.innerWidth > 900;
      if (shouldSpread !== this.isSpreadMode) {
        this.setSpreadMode(shouldSpread);
      }
    });

    // 點擊畫面空白處關閉 popover (點擊 dock 內部不關閉)
    document.addEventListener('click', (e) => {
      if (e.target.closest('#audioDockContainer')) return;
      this.closePopover();
    });

    // 觸控滑動支援 (Touch Swipe)
    let touchStartX = 0;
    this.bookStage?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    this.bookStage?.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) this.nextPage(); // 向左滑 ➔ 下一頁
        else this.prevPage();          // 向右滑 ➔ 上一頁
      }
    }, { passive: true });
  }
}

window.ReaderEngine = ReaderEngine;
