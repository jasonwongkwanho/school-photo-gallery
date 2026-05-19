# 尚片集更新版：如何複製及使用

Jason，呢個資料夾入面有 4 個需要替換的檔案：

```text
index.html
config.js
assets/app.js
assets/styles.css
```

## 你可以點 copy？

### 方法 A：直接用 GitHub 網頁貼上

1. 打開 GitHub repo：`jasonwongkwanho/shine-photo-gallery`
2. 逐個打開對應檔案：
   - `index.html`
   - `config.js`
   - `assets/app.js`
   - `assets/styles.css`
3. 按右上角編輯。
4. Ctrl+A 全選原內容。
5. 貼上本資料夾同名檔案的新內容。
6. Commit changes。
7. 等 GitHub Pages 自動更新。

### 方法 B：交給 Codex

把以下指令交給 Codex：

```text
請根據我提供的 4 個檔案完整替換 repo 內同名檔案：
index.html
config.js
assets/app.js
assets/styles.css

修改目標：
1. 頂部右方加入「焦點活動」及「活動回顧」導航按鈕。
2. 「焦點活動」是首頁主打，不顯示搜尋及排序。
3. 「活動回顧」保留相簿 grid 設計，並顯示搜尋及排序。
4. Google Sheet 欄 D「分類」是唯一分流欄位：
   - 分類 = 焦點活動 → 顯示於首頁主打
   - 分類 = 活動回顧 → 顯示於活動回顧頁
5. 欄 I「精選活動」不再使用。
6. 焦點活動可以多於一個，第一個以大型 headline card 顯示，其餘以 focus card 顯示。
7. 保持 Apps Script apiBaseUrl 不變。
8. 完成後 commit 並 push 到 main。
```

## Google Sheet 欄位建議

原本：

```text
A 相簿代號
B 相簿名稱
C 資料夾ID
D 分類
E 活動日期
F 相簿簡介
G 封面圖片ID
H 公開顯示
I 精選活動
J 內部備註
```

建議改為：

```text
A 相簿代號
B 相簿名稱
C 資料夾ID
D 分類
E 活動日期
F 相簿簡介
G 封面圖片ID
H 公開顯示
I 內部備註
```

欄 D 只填：

```text
焦點活動
活動回顧
```

## 注意

Apps Script `Code.gs` 目前不用即時修改，因為 `精選活動` 欄並不是必需欄位。前台已改為只看欄 D「分類」。


## V2 補充更新

本版再修正兩點：

1. 已移除前台顯示的內部資料欄位說明：
   - 不再顯示「只顯示『尚計劃活動相簿資料庫』欄 D 分類為『焦點活動』的相簿。」
2. 已強化載入狀態：
   - 「相簿資料載入中」會以明顯卡片提示顯示。
   - 加入 spinner 及柔和光暈，避免訪客誤以為沒有相片而離開。


## V3 補充更新

本版再修正 Jason 最新要求：

1. 「焦點活動」及「活動回顧」按鈕已由頂端 Header 移到 Hero 下方、原本「顯示 X 個焦點活動相簿」的位置。
2. 已刪除首頁/列表頁的「顯示 X 個焦點活動相簿」狀態列。
3. 為避免載入需時時訪客誤以為沒有相片，載入狀態改為顯示在相簿內容區：
   - 顯示「相簿資料載入中」
   - 顯示「正在連接 Google Drive 相片資料，請稍候...」
   - 以 loading card + spinner 顯示
4. Header 只保留學校 Logo 及名稱，畫面更乾淨。
