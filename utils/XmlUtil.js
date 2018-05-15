/**
 * Created by yuanjianxin on 2018/5/14.
 */
const xml2js=require('xml2js');

module.exports={

    parseXml(xml){
        return new Promise((resolve,reject)=>{
           xml2js.parseString(xml,{explicitArray:false},(err,res)=>{
               err ? reject(err) : resolve(res);
           });
        });
    }

}