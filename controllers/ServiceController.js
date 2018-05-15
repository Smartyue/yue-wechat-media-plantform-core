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

        ctx.logger.info(`==timestamp:${timestamp}==`);
        ctx.logger.info(`==nonce:${nonce}==`);
        ctx.logger.info(`==msg_signature:${msg_signature}==`);

        let encryptData=await parsePostData(ctx);
        ctx.logger.info(`==encryptData==`,encryptData);

        let decryptData=await ctx.$wechatCryptoHandler.decryptMsg(msg_signature,timestamp,nonce,encryptData);

        ctx.body='success';

        let configPath=ctx.$appConf.configPath || './config';
        if(!fs.existsSync(configPath))
            fs.mkdirSync(configPath,0o777);

        if(!decryptData.xml){
            ctx.logger.error(`==decryptData Invalid==`,decryptData);
            return await next();
        }


        if(decryptData.xml.hasOwnProperty('ComponentVerifyTicket')){
            let ticket = decryptData.xml.ComponentVerifyTicket;
            ctx.logger.info(`==ticket:${ticket}==`);
            fs.writeFileSync(configPath+'/ticket.txt',ticket);
            let preCode=ctx.$wechatHandler.getPreAuthCode(ticket,configPath);
            fs.writeFileSync(configPath+'/auth_url.txt',preCode);
        }

        if(decryptData.xml.hasOwnProperty('AuthorizationCode')){
            let auth_code=decryptData.xml.AuthorizationCode;
            let ticket=fs.readFileSync(configPath+'/ticket.txt','utf8');
            let res=await ctx.$wechatHandler.getAuthorizerToken(auth_code,ticket);

            console.log('====res authorization_info',res);

            let { authorizer_refresh_token, authorizer_appid }=res.authorization_info;

            //get AuthorizerInfo
            let AuthorizerInfo=await ctx.$wechatHandler.getAuthorizerInfo(ticket,authorizer_appid);

            //todo send to other server

            let data={authorizer_refresh_token,authorizer_appid,authorizer_info:AuthorizerInfo.authorizer_info};
            let method="post";
            let url=ctx.$appConf.authorizeInfoCBURL;
            await HttpUtil.instance.sendRequest(method,url,data,{});
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
        let preCode=fs.readFileSync(authUrlFile,'utf8');
        let authUrl='https://mp.weixin.qq.com/cgi-bin/componentloginpage?' +
            'component_appid=' + ctx.$appConf.wechatConf.appId +
            '&pre_auth_code=' + preCode +
            '&redirect_uri=' + 'http://' + ctx.$appConf.host + ctx.$appConf.routeConf.authorizeCallbackUrl;
        ctx.body={
            code:200,
            data:authUrl
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
        ctx.body='success';
        await next();
    }

}