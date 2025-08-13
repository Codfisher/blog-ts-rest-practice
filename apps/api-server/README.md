# API Server

基於 NestJS 與 MongoDB 建立的 API Server。

## 基礎功能

內部包含以下功能：

- 會員登入
- collection-data、single-data 模板資源管理
- JWT 授權

## 系統架構

目前資料庫 ODM 使用 Mongoose。

## 如何運行測試

請安裝 Wallaby.js 外掛（超神超好用 ˋ( ° ▽、° ) ）

安裝完成後，執行以下步驟：

1. 按下 F1，執行「Wallaby.js Select Configuration」
2. 選擇 apps\api-server\wallaby.conf.js
3. 前往 <http://localhost:51245/> 開啟介面，查看測試結果

### 目錄

對應目錄下皆有 README.md 說明。

### 模組

模組概述如下：

直接放在 src 下的模組為與業務邏輯沒有直接相關的模組，目前有：

- src/account：會員資源

  會員資料的 CRUD。

- src/auth：授權資源

  JWT 授權之登入登出功能。

- src/user：使用者資源

  使用者自身資料或資源取用。例：。

- src/storage：檔案資源

  檔案上傳與下載，其他資源如果要取用圖片則從此處關聯。

- src/utils：工具資源

  各類需要依賴 injection、config 資源的輔助函數。

  （common 下的 utils 就是純粹的邏輯，不需要 injection、config 資源）

放在 src/resource 下的模組則與業務邏輯相關，目前有兩個模板用的模組：

- src/resource/collection-data：集合資源

  用於會複數存在的資料。例如：使用者、文章。

- src/resource/single-data：單一資源

  用於僅單一存在的資料。例如：系統設定、網站資訊。

## 資料關係概述

此段落只有資料關聯的簡單輪廓，具體內容與實作請在對應模組查看。
