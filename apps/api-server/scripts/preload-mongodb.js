const { MongoMemoryReplSet } = require('mongodb-memory-server');

/** 執行此腳本會開始下載 mongodb-memory-server bin，主要用於 CI 預先下載，防止 timeout */
(async () => {
  const mongod = await MongoMemoryReplSet.create()
  console.log('MongoMemoryReplSet started')
  await mongod.stop()
})()
