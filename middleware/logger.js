/**
 * Created by yuanjianxin on 2018/4/26.
 */

const Logger=require('../plugins/Logger');

module.exports=async (ctx,next)=>{

        ctx.logger=Logger('app');

        ctx.real_ip=ctx.req.headers && ctx.req.headers['x-forwarded-for'] || ctx.ip;

        await next();

        //todo log sth
        Logger('access').info(`==Ip:${ctx.real_ip},Method:${ctx.method},Url:${ctx.url}, Status:${ctx.status},Body:${JSON.stringify(ctx.body)}==`);
};