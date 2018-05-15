/**
 * Created by yuanjianxin on 2018/5/14.
 */
const fs=require('fs');
const api=require('./WechatAPI');
const HttpUtil=require('yue-http-util');
module.exports=class WechatUtil{

    static get instance(){
        if(!WechatUtil._instance)
            WechatUtil._instance=new WechatUtil();
        return WechatUtil._instance;
    }

    constructor(){
        this.appId=null;
        this.appSecret=null;
        this.component_token=null;
        this.expires_in=null;
    }

    init({appId,appSecret}){
        this.appId=appId;
        this.appSecret=appSecret;
    }

    async getPreAuthCode(ticket,configPath) {
        let { component_access_token } = await this.fetchAccessToken(ticket,configPath)
        let url = api.pre_auth_code + component_access_token;
        let data = {
            "component_appid": this.appId,
        }
        let res = await HttpUtil.instance.sendRequest('post', url, data, {});
        return res.pre_auth_code.substring(14);
    }

    //获取授权方信息
    async getAuthorizerInfo(configPath, ticket, authorizer_appid) {
        let {component_access_token} = await this.fetchAccessToken(ticket, configPath);
        let url = api.authorizer_info + component_access_token;
        let data = {
            "component_appid":this.appId,
            authorizer_appid
        };
        return await HttpUtil.instance.sendRequest('post', url, data, {});
    }

    async getAuthorizerToken(configPath, auth_code, ticket) {
        let res = await this.fetchAccessToken(ticket, configPath)
        let url = api.authorizer_Token + res.component_access_token;
        let data = {
            "component_appid": this.appId,
            "authorization_code": auth_code
        }
        return await HttpUtil.instance.sendRequest('post', url, data, {});
    }


    /**
     * 判断ACCESS TOKEN 有效性
     * @returns {boolean}
     */
    isValidAccessToken() {
        if (!this.component_token || !this.expires_in)
            return false;
        return Date.now() < this.expires_in;
    }

    async updateComonentAccessToken(ticket,wechat_file){
        let url = api.component_access_token;
        let method="post";
        let data={
            "component_appid": this.appId,
            "component_appsecret": this.appSecret,
            "component_verify_ticket": ticket
        }
        let res=await HttpUtil.instance.sendRequest(method,url,data,{});
        res.expires_in=Date.now()+(parseInt(res.expires_in)-10)*1000;
        fs.writeFileSync(wechat_file,JSON.stringify(res));
        return res;
    }


    async fetchAccessToken(ticket,configPath) {

        if (this.component_token && this.expires_in && this.isValidAccessToken())
            return {component_token: this.component_token, expires_in: this.expires_in};

        let wechat_file=configPath+'/c_token.txt';
        if(!fs.existsSync(wechat_file))
            return await this.updateComonentAccessToken(ticket,wechat_file);


        let localAccessToken = fs.readFileSync(wechat_file, 'utf8');

        try {
            let {component_token, expires_in} = JSON.parse(localAccessToken);
            this.component_token = component_token;
            this.expires_in = expires_in;
            if (this.isValidAccessToken())
                return {component_token, expires_in}

            return await this.updateComonentAccessToken(ticket,wechat_file);

        } catch (e) {
            console.error('Something Error:', e);
            return await this.updateComonentAccessToken(ticket,wechat_file);

        }
    }



}