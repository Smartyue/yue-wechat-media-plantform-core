/**
 * Created by yuanjianxin on 2018/5/14.
 */

const Koa = require('koa');
const KoaBody = require('koa-body');
const KoaRouter = require('koa-router')();
const Utils = require('yue-helper').Utils;
const app = new Koa();
const logger = require('../middleware/logger');
const service = require('../middleware/service');
const routerConfig = require('../configs/router.config');
module.exports = class App {


    constructor() {
        this.bodyConf = {
            jsonLimit: "5mb",
            formLimit: "5mb",
            textLimit: "5mb",
            multipart: true
        }; //koa-body configs
        this.middlewareConf = null;
        this.routesConf = routerConfig;
        this.port = process.env.APP_PORT || 3000;

        this.appConf = null;

    }

    set AppConf(appConf) {
        this.appConf = appConf;
    }

    set Routes({componentVerifyTicketUrl, getAuthorizeUrl, getMobileAuthorizeUrl, authorizeCallbackUrl, getAuthorizeAPI, getMobileAuthorizeAPI}) {
        this.routesConf.forEach(v => {
            if (v.func == 'getComponentVerifyTicket')
                v.path = componentVerifyTicketUrl || v.path;
            if (v.func == 'getAuthorizeUrl')
                v.path = getAuthorizeUrl || v.path;
            if (v.func == 'authorizeCallback')
                v.path = authorizeCallbackUrl || v.path;
            if (v.func == 'getMobileAuthorizeUrl')
                v.path = getMobileAuthorizeUrl || v.path;
            if (v.func == 'getMobileAuthorizeAPI')
                v.path = getMobileAuthorizeAPI || v.path;
            if (v.func == 'getAuthorizeAPI')
                v.path = getAuthorizeAPI || v.path;
        });
    }

    set Middleware(middlewareConf) {
        this.middlewareConf = middlewareConf;
    }

    set Body(bodyConf) {
        this.bodyConf = bodyConf;
    }


    set Port(port) {
        this.port = port;
    }

    run() {
        let middlewares = Utils.generateMiddlewareFuncs(this.middlewareConf);
        Utils.generateRoutes(KoaRouter, this.routesConf);
        let bodyConf = this.bodyConf;
        // use koa-body
        app.use(KoaBody(bodyConf));

        // use logger
        app.use(logger);

        // use service
        app.use(service(this.appConf));

        //use middlewares
        middlewares.forEach(v => {
            app.use(v);
        });

        // use routes
        app.use(KoaRouter.routes());

        // listen on port
        app.listen(this.port);

    }
}


