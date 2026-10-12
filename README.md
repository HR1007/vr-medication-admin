# 虛擬用藥諮詢 — 測驗後台管理系統（互動 Demo）

大仁科技大學 VR 虛擬用藥諮詢測驗的後台管理系統，依 Figma 設計稿實作成可操作的網站。
登入、資料與刪除／匯出都在瀏覽器端模擬，資料存在 localStorage，不會送到任何伺服器。

線上版：https://hr1007.github.io/vr-medication-admin/

## 開發

```bash
npm install
npm run dev      # 本機預覽
npm run build    # 型別檢查 + 打包到 dist/
```

部署：`npm run deploy` 會 build 並把 `dist/` 推到 `gh-pages` 分支，GitHub Pages 從該分支提供網站。
