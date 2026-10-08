# 🤝 世宗韓國語 練習冊 1B (Workbook 1B) 交接與進度備忘 (handoff.md)

> **更新時間**：2026-10-07 12:16 (PT 太平洋時間 / 洛杉磯時間)  
> **專案名稱**：世宗韓國語 練習冊 1B 官方原裝翻頁電子書與聽力點讀系統  
> **線上發布網址**：[https://sejong-workbook-1b-1ec2a.web.app](https://sejong-workbook-1b-1ec2a.web.app)  
> **專案本地路徑**：`C:\Users\PC\Documents\Google-Antigravity\Korean-Study\Sejong Korean\Workbook 世宗韓國語練習冊\1B`

---

## 📌 目前完成進度 (Completed)

1. **原書高畫質圖資 (100% 完整)**：
   - 探測並確認世宗官方電子書端點為 `Dir=774`。
   - 下載全書 102 頁原版彩圖至 `src/assets/pages/001.jpg` ~ `102.jpg`。
2. **官方聽力原音檔 (100% 完整)**：
   - 自官方音源壓縮包提取 12 課共 60 個原裝 MP3 音檔至 `src/assets/audio/SJ_W_1B_*.mp3`。
3. **結構化章節與點讀熱區**：
   - 建置 `src/data/book_meta.json`：定義全 102 頁目錄、1~12 課練習單元及附錄聽力腳本、解答。
   - 建置 `src/data/hotspots.json`：精確定位 12 課聽力頁面（11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77 頁）共 60 個題號熱區。
   - 嚴格遵守練習冊規範，畫面保持乾淨書寫格，不混入課本單字/句型熱區。
4. **閱讀器引擎與黃金版面**：
   - 頂部 48px 簡約導航列。
   - 手機端 100vw 滿版自然縱向展開（鎖定 589/807 原書長寬比），右側文字絕不裁切。
   - 34px 左右翻頁箭頭貼邊固定。
   - 底部 52px 微縮膠捲抽屜。
   - 換頁平滑回頂回左 (`scrollTo({ top: 0, left: 0, behavior: 'smooth' })`)。
5. **KittyVoice 四級高可用語音引擎**：
   - 聽力題號點讀直接播放官方真人 MP3 音檔 (`playAudioFile`)。
   - 支援 `0.3x`、`0.7x`、`1.0x` 三段速播放。
6. **語音播放提示框黃金規範 (SPEECH_POPOVER_GOLD_SPEC.md 100% 達成)**：
   - 頂部：韓文原句（草莓粉加粗 `#FF5E7E`）+ 臺灣正體中文翻譯。
   - 中間：【⏸️ 暫停 / 繼續】與【🔄 重播】雙膠囊控制按鈕，具備雙向狀態連動。
   - 底部：【0.3x / 0.7x / 1.0x】KittyVoice 經典三段速切換標籤。
   - 智能定位：自適應避免頂部遮蔽（上半部 `pos-bottom`、下半部 `pos-top`）與水平防裁切（`align-left` / `align-right`）。
7. **Firebase Hosting 多站點隔離部署**：
   - 建立獨立專屬站點 `sejong-workbook-1b-1ec2a`。
   - 配置 `firebase.json` 與 `.firebaserc`，成功部署上線。
8. **對話與建置歷程存檔**：
   - 匯出至 `docs/CONVERSATION_HISTORY.md`。

---

## 🚀 下一步建議 (Next Steps)
1. 視需要將專案提交至 GitHub 遠端儲存庫。
2. 可於 Android 實機透過 Capacitor 進行封裝測試。
