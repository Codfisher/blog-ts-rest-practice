# 檔名參考

.env.development
.env.production

# 範例內容

MONGO_USERNAME=
MONGO_PASSWORD=
MONGO_URI=mongodb+srv://{username}:{password}@xxxxx.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=ServerlessInstance

<!-- 儲存位置，ex：local,gcs(google cloud storage) -->
STORAGE_LOCATION=
<!-- 上傳目錄 -->
STORAGE_DIRECTORY=

<!-- 目前內建支援 GCP，其他環境需要自行新增 -->
GCP_PROJECT_ID=
GCP_BUCKET_NAME=
GCP_SERVICE_ACCOUNT=
GCP_SERVICE_ACCOUNT_KEY=

<!-- 如果要開啟 devtool 功能，記得加上 -->
DEVTOOLS_APP_URL=*
