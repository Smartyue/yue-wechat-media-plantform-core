/**
 * Created by yuanjianxin on 2018/4/26.
 */
const WechatCrypto=require('../utils/WechatCrypto');
const WechatUtil=require('../utils/WechatUtil');
module.exports = (config) => {
    WechatCrypto.instance.init(config.wechatConf);
    WechatUtil.instance.init(config.wechatConf);
    return async(ctx, next) => {

        ctx.$appConf=config;

        ctx.$wechatCryptoHandler=WechatCrypto.instance;
        ctx.$wechatHandler=WechatUtil.instance;
        await next();
    }
}