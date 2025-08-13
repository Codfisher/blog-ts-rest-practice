# resource

集中各類共用資源。

## blueprint

建議使用 blueprint，安裝完外掛後，在指定目錄下按下右鍵，點選「New File from Template」並依照指示操作

collection-data、single-data 已經包含 CRUD 基本功能，運行 npm run blueprint
命令會自動產生以這兩個資料夾為基礎的 blueprint，可以依自己的需求進行調整。

## 命名建議

### 複數

習慣上 collection-data 資料命名使用複數，single-data 則是單數。

例如：
有一個資料為 fish-item，若為 collection-data 類型，則資料命名為 fish-items；為 single-data 則命名為 fish-item。

### 2 個單字

命名建議最少由 2 個單字組成，未來重新命名、追加項目時，相對有彈性。

例如：
若有一個資源被命名為 fish，隨著業務邏輯調整，有一天要加入類似 fish 的資源時，原本的 fish 會變得有點模糊。

但若一開始命名為 fish-item，未來則可以輕鬆的加入 fish-info 或 fish-detail 等等資源。
