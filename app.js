//引入express模块
const express = require('express');
//auth模块
const auth = require('./weChat/auth');
//创建app应用对象
const app = express();

app.use(auth());
//监听端口号
app.listen(3000, () => console.log('服务器启动成功'));