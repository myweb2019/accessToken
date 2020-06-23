//引入config模块
const config = require('../config/index');
//引入sha1模块
const sha1 = require('sha1');

module.exports = ()=>{
  return (req, res, next) => {
      /*
      { signature: '4a8a5b330690e4cba097483c7df2767f1d2a3ffe',//微信的加密签名
    echostr: '6497806751838988287',//随机的字符串
    timestamp: '1581213694',//时间戳
    nonce: '1324595512' }//随机数
      */
      // 1.将（timestamp，nonce，token）字典排序sort
      const {signature, echostr, timestamp, nonce} = req.query;
      const {token} = config;
      const strSha1 = sha1([timestamp, nonce, token].sort().join(''));

    /*
    * 微信服务器会发送两种类型消息给开发者服务器
    * 1.GET
    *   -验证服务器的有效性
    * 2.POST
    *   -微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
    * */
      if (req.method === 'GET'){
          //3.对比发送加密签名
          if (strSha1 === signature) {
              res.send(echostr)
          }else {
              res.end('error');
          }
      }else if (req.method === 'POST'){
          //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
          if (strSha1 !== signature){
              //说明不是微信发来的消息
              res.send('err');
          }

          console.log(req.query);
      }
  }
};