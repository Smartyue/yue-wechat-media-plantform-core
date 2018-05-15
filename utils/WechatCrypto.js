/**
 * Created by yuanjianxin on 2018/5/14.
 */
const crypto = require('crypto');
const XmlUtils=require('./XmlUtil');
module.exports = class WechatCrypto {

    static get instance() {
        if (!WechatCrypto._instance)
            WechatCrypto._instance = new WechatCrypto();
        return WechatCrypto._instance;
    }

    constructor() {
        this.appId = null;
        this.token = null;
        this.aesKey = null;
        this.iv = null;
        this.isInited = false;
    }

    init({appId, token, aesKey}) {
        this.appId = appId;
        this.token = token;
        this.aesKey = new Buffer(aesKey + '=', 'base64');
        this.iv = this.aesKey.slice(0, 16);
        this.isInited = true;
    }

    getSignature(timestamp, nonce, encrypt) {
        let raw_signature = [this.token, timestamp, nonce, encrypt].sort().join('');
        let sha1 = crypto.createHash("sha1");
        sha1.update(raw_signature);
        return sha1.digest("hex");
    }

    PKCS7Decoder(buff) {
        let pad = buff[buff.length - 1];
        if (pad < 1 || pad > 32) {
            pad = 0;
        }
        return buff.slice(0, buff.length - pad);
    }

    decrypt(str) {
        let aesCipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, this.iv);
        aesCipher.setAutoPadding(false);
        let decipheredBuff = Buffer.concat([aesCipher.update(str, 'base64'), aesCipher.final()]);
        decipheredBuff = this.PKCS7Decoder(decipheredBuff);
        let len_netOrder_corpid = decipheredBuff.slice(16);
        let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
        let result = len_netOrder_corpid.slice(4, msg_len + 4).toString();
        let appId = len_netOrder_corpid.slice(msg_len + 4).toString();
        if (appId !== this.appId) throw new Error('appId is invalid');
        return result;
    }

    async decryptMsg(signature, timestamp, nonce, data) {

        if (!this.isInited) throw new Error(`==WechatCrypto need init first!==`);

        data=await XmlUtils.parseXml(data);

        let msg_encrypt = data.xml.Encrypt;
        let msg_signature = this.getSignature(timestamp, nonce, msg_encrypt);
        if (msg_signature !== signature)
            throw new Error(`==signature is Invalid==`);
        let msg_decrypt = this.decrypt(msg_encrypt);
        return await XmlUtils.parseXml(msg_decrypt);
    }


}