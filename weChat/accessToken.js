//request-promise-native模块
const rp = require('request-promise-native');
//引入fs模块
const {writeFile, readFile} = require('fs');
//引入config模块
const {appID, appsecret} = require('../config');
/*
* 读取本地文件
*  -本地有文件(readAccessToken)
*    -判断是否过期(isValidAccessToken)
*      -过期了
*      -从新获取(getAccessToken) 发送请求获取access_token保存下来（覆盖原本地文件保证唯一性）
*      -没过期
*      -直接使用
*  -本地没有文件
*  -发送请求获取(getAccessToken)access_token保存下来（本地文件）(saveAccessToken)直接使用
* */

//https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

//定义一个类，获取AccessToken
class AccessToken {
    constructor() {
    }

    /**
     * 用来获取access_token
     */
    getAccessToken() {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
        //发送请求
        /*
        * 下载2个库request,request-promise-native 返回值是promise对象
        * */
        return new Promise((resolve, reject) => {
            rp({
                method: 'GET',
                url,
                json: true
            }).then(res => {
                //设置access_token的过期时间
                res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                //将promise对象状态改为成功状态
                resolve(res);
            }).catch(err => {
                reject('getAccessToken方法出了问题' + err);
            })
        });

    }

    /**
     * 用来保存access_token
     * @param accessToken
     */
    saveAccessToken(accessToken) {
        accessToken = JSON.stringify(accessToken);
        //将access_token保存一个文件 writeFile是异步的
        return new Promise((resolve, reject) => {
            writeFile('./accessToken.txt', accessToken, err => {
                if (!err) {
                    console.log('文件保存成功~');
                    resolve();
                } else {
                    reject('saveAccessToken方法出了问题' + err);
                }
            })
        });
    }

    /**
     * 用来读取access_token
     */
    readAccessToken() {
        //将access_token保存一个文件 writeFile是异步的
        return new Promise((resolve, reject) => {
            readFile('./accessToken.txt', access_token, (err, data) => {
                if (!err) {
                    console.log('文件读取成功~');
                    //将json字符串转化为js对象
                    data = JSON.parse(data);
                    resolve(data);
                } else {
                    reject('saveAccessToken方法出了问题' + err);
                }
            })
        });
    }

    /**
     * 检测accessToken是否过期
     * @param data
     */
    isValidAccessToken(data) {
        //检测accessToken是否过期
        if (!data && !data.access_token && !data.expires_in) {
            //代表accessToken无效的
            return false;
        }

        //检测access_token是否在有效期内
        // if(data.expires_in<Date.now()){
        //     //过期了
        //     return false;
        // }else {
        //    //没有过期
        //     return true;
        // }
        return data.expires_in >= Date.now();
    }

    /**
     * 获取没有过期的access_token
     * @returns {Promise<{access_token: *, expires_in: *}>} access_token
     */
    fetchAccessToken() {
        //优化
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)){
            //说明之前保存过access_token，并且没有过期
            return Promise.resolve({
                access_token:this.access_token,
                expires_in:this.expires_in
            })
        }
        return this.readAccessToken()
            .then(async res => {
                //本地有文件
                if (this.isValidAccessToken(res)) {
                    //有效
                    return Promise.resolve(res);
                } else {
                    //无效
                    const res = await this.getAccessToken();
                    //保存文件,目的为了直接使用
                    await this.saveAccessToken(res);
                    resolve(res)

                }
            })
            .catch(async err => {
                //没有文件获取access_token
                const res = await this.getAccessToken();
                //保存文件,目的为了直接使用
                await this.saveAccessToken(res);
                return Promise.resolve(res);
            })
            .then(res => {
                //将access_token挂载到this上
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                //返回res包装了一层Promise对象（此对象为成功的状态）
                return Promise.resolve(res);
            })
    }
}

//测试
const w = new AccessToken();


