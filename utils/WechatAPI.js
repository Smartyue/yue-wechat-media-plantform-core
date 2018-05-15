/**
 * Created by yuanjianxin on 2018/5/14.
 */
const prefix = 'https://api.weixin.qq.com/cgi-bin/';

// 微信接口

module.exports={
    component_access_token:prefix+'component/api_component_token', //获取三方平台component_access_token，POST请求
    pre_auth_code:prefix+'component/api_create_preauthcode?component_access_token=', //获取三方平台pre_auth_code，POST请求
    authorizer_Token:prefix+'component/api_query_auth?component_access_token=', //获取authorizer_access_token和authorizer_refresh_token，POST请求
    authorizer_info:prefix+'component/api_get_authorizer_info?component_access_token=', //获取授权方的基本信息
    accessToken:prefix+'token?grant_type=client_credential',
    uploadTempMaterial:prefix+'media/upload?',  //access_token=ACCESS_TOKEN&type=TYPE  上传临时素材
    getTempMaterial:prefix+'media/get?',        //access_token=ACCESS_TOKEN&media_id=MEDIA_ID 获取临时素材，GET请求
    uploadPermNews:prefix+'material/add_news?',   //access_token=ACCESS_TOKEN  上传永久图文
    uploadPermPics:prefix+'media/uploadimg?',   //access_token=ACCESS_TOKEN  上传永久图片
    uploadPermOther:prefix+'material/add_material?',   //access_token=ACCESS_TOKEN  上传永久其他素材
    getPermMaterial:prefix+'material/get_material?',   //access_token=ACCESS_TOKEN 获取永久素材，POST请求
    delPermMaterial:prefix+'material/del_material?',   //access_token=ACCESS_TOKEN 删除永久素材，POST请求
    custom:prefix+'message/custom/send?',

    menu:{
        create:prefix+'menu/create?',  //access_token=ACCESS_TOKEN  创建菜单
        get:prefix+'menu/get?',        //access_token=ACCESS_TOKE  获取菜单,GET请求
        delete:prefix+'menu/delete?',  //access_token=ACCESS_TOKEN	删除菜单,GET请求
        getInfo:prefix+'get_current_selfmenu_info?'  //access_token=ACCESS_TOKEN  获取自定义菜单配置接口
    },
    groups:{
        create:prefix+'groups/create?',  //access_token=ACCESS_TOKEN  创建分组，POST请求
        get:prefix+'groups/get?',        //access_token=ACCESS_TOKE  查询所有分组,GET请求
        getId:prefix+'groups/getid?',    //access_token=ACCESS_TOKEN  查询用户所在分组,POST请求
        update:prefix+'groups/update?',  //access_token=ACCESS_TOKEN  修改分组名,POST请求
        membersUpdate:prefix+'groups/members/update?',  //access_token=ACCESS_TOKEN  移动用户分组,POST请求
        membersBatchupdate:prefix+'groups/members/batchupdate?', //access_token=ACCESS_TOKEN  批量移动用户分组,POST请求
        delete:prefix+'groups/delete?'   //access_token=ACCESS_TOKEN	删除分组,POST请求
    },
    user:{
        updateUserRemark:prefix+'user/info/updateremark?',  //access_token=ACCESS_TOKEN  修改用户备注名，POST请求
        getUserInfo:prefix+'user/info?', //access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN  获取用户基本信息，GET请求
        batchGetUserInfo:prefix+'user/info/batchget?',  //access_token=ACCESS_TOKEN，POST请求
        getUserOpenIds:prefix+'user/get?',  //access_token=ACCESS_TOKEN&next_openid=NEXT_OPENID，GET请求
    },
    mass:{
        sendall:prefix+'message/mass/sendall?',  //access_token=ACCESS_TOKEN 群发消息
    }
};