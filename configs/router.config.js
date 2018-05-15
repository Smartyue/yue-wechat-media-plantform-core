/**
 * Created by yuanjianxin on 2018/5/14.
 */

const routers=[];

const ServiceController=require('../controllers/ServiceController');

routers.push({ path:'/getComponentVerifyTicket',method:'post',controller:ServiceController,func:'getComponentVerifyTicket'});
routers.push({ path:'/getAuthorizeUrl',method:'get',controller:ServiceController,func:'getAuthorizeUrl'});
routers.push({ path:'/authorizeCallback',method:'get',controller:ServiceController,func:'authorizeCallback'});


module.exports=routers;