const db = require('../config/db');
const { allSessions } = require('../middleWare/whatsappSession');
const { MessageMedia } = require('whatsapp-web.js');
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);


exports.send = async (data) => {
    let message = data.body.message;
    let recipient = data.body.to;
    let client = allSessions(data.id);
    let type = data.body.type;
    var fileURL = ''
    if(data.body.filePathURL !== ''){
        fileURL = encodeURI(data.body.filePathURL);
    }
    
    try {
    
        const key = data.key;
        const sql = "SELECT `insid` FROM instances WHERE api_key =?";
        db.query(sql, [key], async (err, result) => {
            if (err) return console.error(err);
            if (result.length > 0 && result[0].insid === data.id) {
                const id = result[0].insid;
                const to = recipient + "@c.us";
                console.log("Sending API message to " + to);
                const options = { "unsafeMime": true };
                const optionMsg = {linkPreview: false}
                if(fileURL !== ''){
                    try {
                        const media = await MessageMedia.fromUrl(fileURL, options);
                        const msgResult = await client.sendMessage(to, message, { media: media });
    
                        if (msgResult) {
                            console.log("API message sent");
                        } else {
                            console.log('API message not sent');
                        }
                    } catch (mediaError) {
                        console.error("Failed to create media from URL: ", mediaError.message);
                    }
                }else{
                    if (type === 'vcard') {
                        const vcard = message.vcard; // Assuming the message is the vCard string
                        
                        const msgResult = await client.sendMessage(to, vcard);

                        if (msgResult) {
                            console.log("API vCard message sent");
                        } else {
                            console.log('API vCard message not sent');
                        }
                    } else {
                        const msgResult = await client.sendMessage(to, message, optionMsg);

                        if (msgResult) {
                            console.log("API message sent");
                        } else {
                            console.log('API message not sent');
                        }
                    }
                }
            } else {
                console.log("No Instance Found");
            }
        });
        return{
            message: "API message sent successfully"
        }
    } catch (error) {
        console.error("Unable to send message", error);
        return { message: "Unable to send message", error };
    }
};

exports.checkNumberStatus = async (data) => {
    let client = allSessions(data.id);
    let key = data.key
    var registered = 'fasle'
    
    try {
        const sql = "SELECT `insid` FROM instances WHERE api_key =?";
        const result = await queryAsync(sql,[key])
        if (result.length > 0 && result[0].insid === data.id) {
            let uid = data.number+'@c.us'
            // console.log(uid)
            registered = await client.isRegisteredUser(uid)
            // console.log(numberDetails)            
        }
        
        // console.log(registered)
        if(registered == true){
            return{
                message: `The number ${data.number} is using WhatsApp`,
                result: registered
            }
        }
        else{
            return{
                message: `The number ${data.number} is not using WhatsApp`,
                result: registered
            }
        }
        
    } catch (error) {
        console.error("Unable to check number status", error);
        return { message: "Unable to check number status", error };
    }
}

exports.sendWAOTP = async (data) => {

    const mobile = process.env.ADMIN_WA_NUMBER;
    
    const sql = "SELECT `insid` FROM users WHERE `mobile` = ?";
    
    const result = await queryAsync(sql,[mobile])
    
    if(result){
        const id = result[0].insid
        const client = allSessions(id);
        const to = data.to;
        const message = data.message;
        const msgResult = await client.sendMessage(to,message);
        if(msgResult){
            return {message: 'OTP Sent'}
        }else{
            return {message: 'Unable to send OTP'}
        }
    }else{
        return {message:'Unable to send OTP'}
    }
}
