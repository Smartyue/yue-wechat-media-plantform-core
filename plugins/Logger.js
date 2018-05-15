/**
 * Created by yuanjianxin on 2018/5/9.
 */
const log4js = require('log4js')
const containId = process.env.CONTAINER_ID || 'dev';
const logPath= process.env.LOG_PATH || './logs';
log4js.configure({
    replaceConsole: true,
    appenders: {
        stdout: {//控制台输出
            type: 'stdout'
        },
        access: {//请求日志
            type: 'dateFile',
            filename: logPath+'/access-' + containId + '.log',
            daysToKeep: 30,
            compress: true
        },
        error: {//错误日志
            type: 'dateFile',
            filename: logPath+'/error-' + containId + '.log',
            daysToKeep: 30,
            compress: true
        },
        app: {//其他日志
            type: 'dateFile',
            filename: logPath+'/app-' + containId + '.log',
            daysToKeep: 30,
            compress: true
        }
    },
    categories: {
        default: {appenders: ['stdout', 'access'], level: 'debug'},//appenders:采用的appender,取appenders项,level:设置级别
        error: {appenders: ['stdout', 'error'], level: 'error'},
        app: {appenders: ['stdout', 'app'], level: 'debug'}
    }
});

module.exports=(name='default')=>{
    return log4js.getLogger(name);
}
