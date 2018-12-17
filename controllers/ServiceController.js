/**
 * Created by yuanjianxin on 2018/5/14.
 */
const BaseController=require('./BaseController');
const fs=require('fs');
const HttpUtil=require('yue-http-util');


function parsePostData(ctx) {
    return new Promise((resolve, reject) => {
        try {
            let postdata = "";
            ctx.req.addListener('data', (data) => {
                postdata += data
            })
            ctx.req.addListener("end", function () {
                resolve(postdata)
            })
        } catch (err) {
            reject(err)
        }
    })
}
module.exports=class ServiceController extends BaseController{


    /**
     * 接收微信服务器推送的 component_verify_ticket 协议
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    async getComponentVerifyTicket(ctx,next){
        ctx.logger.info(`==授权componentVerifyTicket==`);
        let timestamp=ctx.query.timestamp;
        let nonce=ctx.query.nonce;
        let msg_signature=ctx.query.msg_signature;

        let encryptData=await parsePostData(ctx);

        let decryptData=await ctx.$wechatCryptoHandler.decryptMsg(msg_signature,timestamp,nonce,encryptData);

        console.log('==明文数据==', decryptData);

        ctx.body='success';

        let configPath=ctx.$appConf.configPath || './config';
        if(!fs.existsSync(configPath))
            fs.mkdirSync(configPath,0o777);

        if(!decryptData.xml){
            ctx.logger.error(`==decryptData Invalid==`,decryptData);
            return await next();
        }


        //ticket 推送
        if (decryptData.xml.InfoType == 'component_verify_ticket') {
            let ticket = decryptData.xml.ComponentVerifyTicket;
            ctx.logger.info(`==ticket:${ticket}==`);
            fs.writeFileSync(configPath+'/ticket.txt',ticket);
            let preCode = await ctx.$wechatHandler.getPreAuthCode(ticket, configPath);
            fs.writeFileSync(configPath+'/auth_url.txt',preCode);
        }


        //授权成功
        if (decryptData.xml.InfoType == 'authorized') {
            let auth_code=decryptData.xml.AuthorizationCode;
            let ticket=fs.readFileSync(configPath+'/ticket.txt','utf8');
            let res = await ctx.$wechatHandler.getAuthorizerToken(configPath, auth_code, ticket);

            let {authorizer_refresh_token, authorizer_appid, authorizer_access_token}=res.authorization_info;

            let AuthorizerInfo = await ctx.$wechatHandler.getAuthorizerInfo(configPath, ticket, authorizer_appid);

            //todo send to other server

            let data = {
                authorization_code: auth_code,
                authorizer_refresh_token,
                authorizer_access_token,
                authorizer_appid,
                authorizer_info: AuthorizerInfo.authorizer_info
            };
            let method="post";
            let url=ctx.$appConf.authorizeInfoCBURL;
            await HttpUtil.instance.sendRequest(method,url,data,{});
        }

        //取消授权
        if (decryptData.xml.InfoType == 'unauthorized') {
            //获取取消授权者的appId
            let appId = decryptData.xml.AuthorizerAppid;
            //获取取消授权时间
            let time = parseInt(decryptData.xml.CreateTime) * 1000;
            let data = {appId, time};
            let method = "post";
            let url = ctx.$appConf.unauthorizeCBURL;
            await HttpUtil.instance.sendRequest(method, url, data, {});
        }

        await next();

    }

    /**
     * 获取授权url链接
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    async getAuthorizeUrl(ctx,next){

        let configPath=ctx.$appConf.configPath || './config';
        let authUrlFile=configPath+'/auth_url.txt';
        if(!fs.existsSync(authUrlFile)){
            ctx.body={
                code:101,
                message:'No preCode generate!'
            }
            return await next();
        }
        let ticket = fs.readFileSync(configPath + '/ticket.txt', 'utf8');
        let preCode = await ctx.$wechatHandler.getPreAuthCode(ticket, configPath);
        // let preCode=fs.readFileSync(authUrlFile,'utf8');
        let authUrl='https://mp.weixin.qq.com/cgi-bin/componentloginpage?' +
            'component_appid=' + ctx.$appConf.wechatConf.appId +
            '&pre_auth_code=' + preCode +
            '&redirect_uri=' + ctx.$appConf.host + ctx.$appConf.routeConf.authorizeCallbackUrl;
        ctx.body = "<a href=\"" + authUrl + "\">点击进行网页扫码授权</a>";
        await next();
    }


    async getAuthorizeAPI(ctx, next) {

        let configPath = ctx.$appConf.configPath || './config';
        let authUrlFile = configPath + '/auth_url.txt';
        if (!fs.existsSync(authUrlFile)) {
            ctx.body = {
                code: 101,
                message: 'No preCode generate!'
            }
            return await next();
        }
        let ticket = fs.readFileSync(configPath + '/ticket.txt', 'utf8');
        let preCode = await ctx.$wechatHandler.getPreAuthCode(ticket, configPath);
        // let preCode=fs.readFileSync(authUrlFile,'utf8');
        let authUrl = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?' +
            'component_appid=' + ctx.$appConf.wechatConf.appId +
            '&pre_auth_code=' + preCode +
            '&redirect_uri=' + ctx.$appConf.host + ctx.$appConf.routeConf.authorizeCallbackUrl;
        ctx.body = {
            code: 200,
            message: 'OK',
            data: authUrl
        };
        await next();
    }

    /**
     * 获取移动端授权链接
     * @param ctx
     * @param next
     * @returns {Promise.<*>}
     */
    async getMobileAuthorizeUrl(ctx, next) {
        let configPath = ctx.$appConf.configPath || './config';
        let authUrlFile = configPath + '/auth_url.txt';
        if (!fs.existsSync(authUrlFile)) {
            ctx.body = {
                code: 101,
                message: 'No preCode generate!'
            }
            return await next();
        }
        let ticket = fs.readFileSync(configPath + '/ticket.txt', 'utf8');
        let preCode = await ctx.$wechatHandler.getPreAuthCode(ticket, configPath);
        // let preCode=fs.readFileSync(authUrlFile,'utf8');
        let authUrl = 'https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&auth_type=3&no_scan=1&' +
            'component_appid=' + ctx.$appConf.wechatConf.appId +
            '&pre_auth_code=' + preCode +
            '&redirect_uri=' + ctx.$appConf.host + ctx.$appConf.routeConf.authorizeCallbackUrl + '#wechat_redirect';
        ctx.body = "<a href=\"" + authUrl + "\">点击进行移动端授权</a>";
        await next();
    }

    async getMobileAuthorizeAPI(ctx, next) {
        let configPath = ctx.$appConf.configPath || './config';
        let authUrlFile = configPath + '/auth_url.txt';
        if (!fs.existsSync(authUrlFile)) {
            ctx.body = {
                code: 101,
                message: 'No preCode generate!'
            }
            return await next();
        }
        let ticket = fs.readFileSync(configPath + '/ticket.txt', 'utf8');
        let preCode = await ctx.$wechatHandler.getPreAuthCode(ticket, configPath);
        // let preCode=fs.readFileSync(authUrlFile,'utf8');
        let authUrl = 'https://mp.weixin.qq.com/safe/bindcomponent?action=bindcomponent&auth_type=3&no_scan=1&' +
            'component_appid=' + ctx.$appConf.wechatConf.appId +
            '&pre_auth_code=' + preCode +
            '&redirect_uri=' + ctx.$appConf.host + ctx.$appConf.routeConf.authorizeCallbackUrl + '#wechat_redirect';
        ctx.body = {
            code: 200,
            message: 'OK',
            data: authUrl
        };
        await next();
    }


    /**
     * 授权回调页面
     * @param ctx
     * @param next
     * @returns {Promise.<void>}
     */
    async authorizeCallback(ctx,next){
        ctx.logger.info(`==授权回调==`);
        ctx.logger.info(`==params  authCode:${ctx.query.auth_code},expiresIn:${ctx.query.expires_in}==`);
        ctx.body = "<a href='http://www.yuanjianxin.com'>Welcome!</a>";
        await next();
    }

}