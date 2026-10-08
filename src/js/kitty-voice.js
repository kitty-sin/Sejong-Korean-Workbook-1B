/**
 * KittyVoice - 世宗韓語 1B 四級高可用語音引擎與三段速播放器
 * 1. Android 原生 TTS (Capacitor/WebView Native Bridge)
 * 2. Web Speech API (ko-KR 語音合成)
 * 3. Google Cloud 高清晰真人 TTS 備援
 * 4. Baidu / Youdao 語音備援
 * 
 * 支援三段速：0.3x (逐音節口型拆解)、0.7x (慢速跟讀)、1.0x (自然正常)
 */

class KittyVoiceEngine {
  constructor() {
    this.currentSpeed = 1.0; // 0.3, 0.7, 1.0
    this.isPlaying = false;
    this.audioElement = new Audio();
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.activeVoice = null;
    this.onStateChangeCallbacks = [];

    this.initWebSpeech();
  }

  initWebSpeech() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // 尋找高品質韓語語音
      this.activeVoice = voices.find(v => v.lang === 'ko-KR' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Yuna') || v.name.includes('Korean'))) 
        || voices.find(v => v.lang.startsWith('ko')) 
        || null;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  setSpeed(speed) {
    this.currentSpeed = parseFloat(speed);
    this.notifyStateChange({ speed: this.currentSpeed });
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  notifyStateChange(state) {
    this.onStateChangeCallbacks.forEach(cb => {
      try { cb({ isPlaying: this.isPlaying, speed: this.currentSpeed, ...state }); } catch (e) {}
    });
  }

  cleanKoreanText(text) {
    if (!text) return '';
    // 1. 常見外來語縮寫精確轉寫為標準韓語發音 (避免被當成英文字母切除或誤讀)
    let t = text.replace(/PC방/gi, '피시방')
                .replace(/K-POP/gi, '케이팝')
                .replace(/TV/gi, '티비');

    // 2. 移除括號內的繁中註解、翻譯或拼音說明 (如 (你好)、(中)、(名詞) 等)
    let cleaned = t.replace(/\([^)]*\)/g, ' ')
                   .replace(/\[[^\]]*\]/g, ' ')
                   .replace(/【[^】]*】/g, ' ')
                   // 3. 嚴格徹底剔除所有繁簡漢字與英文字母，杜絕滲入英文或中文發音
                   .replace(/[\u4e00-\u9fff]/g, ' ')
                   .replace(/[a-zA-Z]/g, ' ')
                   // 4. 清理多餘連續空白
                   .replace(/\s+/g, ' ')
                   .trim();

    return cleaned || text;
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.notifyStateChange({ isPlaying: false, isPaused: false });
  }

  /**
   * 暫停當前播放 (支援音檔與 TTS)
   */
  pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.isPlaying = false;
      this.isPaused = true;
      this.notifyStateChange({ isPlaying: false, isPaused: true });
      return true;
    }
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPlaying = false;
      this.isPaused = true;
      this.notifyStateChange({ isPlaying: false, isPaused: true });
      return true;
    }
    return false;
  }

  /**
   * 繼續播放 (從暫停點恢復)
   */
  resume() {
    if (this.audioElement && this.isPaused) {
      this.audioElement.play().catch(e => console.warn('Resume error:', e));
      this.isPlaying = true;
      this.isPaused = false;
      this.notifyStateChange({ isPlaying: true, isPaused: false });
      return true;
    }
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPlaying = true;
      this.isPaused = false;
      this.notifyStateChange({ isPlaying: true, isPaused: false });
      return true;
    }
    return false;
  }

  /**
   * 播放音訊檔案 (支援官方原裝 MP3 與三段速控制)
   * @param {string} audioUrl - 音訊檔案路徑
   * @param {number} [customSpeed] - 指定語速
   * @returns {Promise<boolean>}
   */
  async playAudioFile(audioUrl, customSpeed = null) {
    const speed = customSpeed !== null ? parseFloat(customSpeed) : this.currentSpeed;
    if (!audioUrl) return false;

    this.stop();
    this.currentTrackUrl = audioUrl;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyStateChange({ isPlaying: true, isPaused: false, audioUrl, speed });

    return new Promise((resolve) => {
      try {
        this.audioElement.src = audioUrl;
        this.audioElement.playbackRate = speed;

        let resolved = false;
        this.audioElement.onended = () => {
          this.isPlaying = false;
          this.notifyStateChange({ isPlaying: false });
          if (!resolved) { resolved = true; resolve(true); }
        };
        this.audioElement.onerror = (err) => {
          console.warn('Audio playback error:', err);
          this.isPlaying = false;
          this.notifyStateChange({ isPlaying: false });
          if (!resolved) { resolved = true; resolve(false); }
        };

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('Audio play promise rejected:', e);
            this.isPlaying = false;
            this.notifyStateChange({ isPlaying: false });
            if (!resolved) { resolved = true; resolve(false); }
          });
        }
      } catch (err) {
        this.isPlaying = false;
        this.notifyStateChange({ isPlaying: false });
        resolve(false);
      }
    });
  }

  /**
   * 播放韓文語音
   * @param {string} text - 韓文字串
   * @param {number} [customSpeed] - 指定語速 (0.3, 0.7, 1.0)
   * @returns {Promise<boolean>}
   */
  async speak(text, customSpeed = null) {
    const speed = customSpeed !== null ? parseFloat(customSpeed) : this.currentSpeed;
    const cleanText = this.cleanKoreanText(text);
    if (!cleanText) return false;

    this.stop();
    this.isPlaying = true;
    this.notifyStateChange({ isPlaying: true, text: cleanText, speed });

    // Tier 1: Android 原生 TTS 橋接
    if (window.AndroidNativeTTS && typeof window.AndroidNativeTTS.speak === 'function') {
      try {
        window.AndroidNativeTTS.speak(cleanText, speed);
        this.isPlaying = false;
        this.notifyStateChange({ isPlaying: false });
        return true;
      } catch (e) {
        console.warn('AndroidNativeTTS failed, falling back to Web Speech', e);
      }
    }

    // Tier 2: Web Speech API
    if (this.synth) {
      const success = await this.speakWebSpeech(cleanText, speed);
      if (success) {
        this.isPlaying = false;
        this.notifyStateChange({ isPlaying: false });
        return true;
      }
    }

    // Tier 3: Google 雲端真人高清晰 TTS
    const googleSuccess = await this.speakGoogleTTS(cleanText, speed);
    if (googleSuccess) {
      this.isPlaying = false;
      this.notifyStateChange({ isPlaying: false });
      return true;
    }

    // Tier 4: Youdao / 辭典備援音訊
    const fallbackSuccess = await this.speakFallbackTTS(cleanText, speed);
    this.isPlaying = false;
    this.notifyStateChange({ isPlaying: false });
    return fallbackSuccess;
  }

  speakWebSpeech(text, speed) {
    return new Promise((resolve) => {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ko-KR';
        utter.rate = speed;
        utter.pitch = 1.0;
        if (this.activeVoice) utter.voice = this.activeVoice;

        let resolved = false;
        utter.onend = () => {
          if (!resolved) { resolved = true; resolve(true); }
        };
        utter.onerror = (err) => {
          console.warn('Web Speech error:', err);
          if (!resolved) { resolved = true; resolve(false); }
        };

        // 超時保護 (若 10 秒未結束自動視為失敗走備援)
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.synth.cancel();
            resolve(false);
          }
        }, 10000);

        this.synth.speak(utter);
      } catch (err) {
        resolve(false);
      }
    });
  }

  speakGoogleTTS(text, speed) {
    return new Promise((resolve) => {
      try {
        const encoded = encodeURIComponent(text);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encoded}`;
        this.audioElement.src = url;
        this.audioElement.playbackRate = speed;

        let resolved = false;
        this.audioElement.onended = () => {
          if (!resolved) { resolved = true; resolve(true); }
        };
        this.audioElement.onerror = () => {
          if (!resolved) { resolved = true; resolve(false); }
        };

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (!resolved) { resolved = true; resolve(false); }
          });
        }

        setTimeout(() => {
          if (!resolved) { resolved = true; resolve(false); }
        }, 8000);
      } catch (err) {
        resolve(false);
      }
    });
  }

  speakFallbackTTS(text, speed) {
    return new Promise((resolve) => {
      try {
        const encoded = encodeURIComponent(text);
        const url = `https://dict.youdao.com/dictvoice?audio=${encoded}&type=0&le=ko`;
        this.audioElement.src = url;
        this.audioElement.playbackRate = speed;

        this.audioElement.onended = () => resolve(true);
        this.audioElement.onerror = () => resolve(false);

        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => resolve(false));
        }

        setTimeout(() => resolve(false), 8000);
      } catch (err) {
        resolve(false);
      }
    });
  }
}

// 導出全域單例
window.kittyVoice = new KittyVoiceEngine();
