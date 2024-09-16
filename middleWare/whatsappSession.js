const crypto = require("crypto");
const { Client, LocalAuth, RemoteAuth, ClientInfo } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);
const wwebVersion = ' 2.3000.1014834790';
const allSessionsObject = {};
const MONGODB_URI = 'mongodb://localhost:27017/whatsapp'
let store
function generateApiKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

mongoose.connect(MONGODB_URI).then(() => {
    console.log("mongoDB connected")
    store = new MongoStore({ mongoose: mongoose });
    // console.log(store)
});

const createWhatsappSession = (id, socket) => {
    try {
        const client = new Client({
            puppeteer: {
                headless: true,
            },
            authStrategy: new RemoteAuth({
                clientId: id,
                store: store,
                backupSyncIntervalMs: 300000                
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
            },
        });

        client.on('qr', (qr) => {
            socket.emit("qr", {
                qr,
                id,
            })
        });
        
        client.on("authenticated", () => {
            console.log("User Authenticated", id)

        });
        client.on('auth_failure', msg => {
            console.error('Authentication failure', msg);
        });

        client.on('ready', () => {
            
            const wid = client.info.wid.user
            const sql1 = "SELECT * FROM instances WHERE insid =? AND wid !=?";
            db.query(sql1, [id, wid], async (err,result) => {
                if(err) return console.error(err);
                if(result.length > 0 & result.api_key === '') {
                    const sql = "UPDATE instances SET authenticated =?, api_key = ?, wid = ? WHERE insid =?";
                    const values = [
                        authenticated=true,
                        api_key=generateApiKey(),
                        wid,
                        id=id,
                    ]
                    db.query(sql,values, (err) => {
                        if (err) throw err;
                    })
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }else if(result.length > 0 && result[0].authenticated !== 1){
                    const sql = "UPDATE instances SET authenticated =?, wid = ? WHERE insid =?";
                    const values = [
                        authenticated=1,
                        wid,
                        id=id,
                    ]
                    db.query(sql,values, (err) => {
                        if (err) throw err;
                    })
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }else{
                    allSessionsObject[id] = client;
                    socket.emit("ready",{
                        id,
                        message: "Client is ready"
                    })
                }
            })
        });
        client.on('message_create', message => {
            if (message.body === 'ping') {
                client.sendMessage(message.from, 'pong');
            }
        });
        
        client.on('logout', async () => {
            await client.logout(); // Close the client
            delete allSessionsObject[id]; // Remove session from allSessionsObject
            const sql = "UPDATE instances SET authenticated =? WHERE insid =?";
            db.query(sql,[false, id], (err) => {
                if (err) throw err;
            })
            // Emit event to inform client about session removal
            socket.emit("sessionRemoved", {
                id,
                title: "Logged Out!",
                message: "Session removed due to logout client"
            });
        })
        
        client.initialize();
    } catch (error) {
        console.error("Error initializing WhatsApp client:", error);
        // You might emit an error event or handle the error in some other way
    }

    socket.on('sendTestMessage', async (data) => {
        const key = data.key;
        const message = data.message;
        const sql = "SELECT `insid` FROM instances WHERE api_key =?";
        db.query(sql, [key], async (err,result) => {
            if(err) return console.error(err);
            if(result.length > 0){
                const id = result[0].insid;
                const client = allSessionsObject[id];
                const to = message.to + "@c.us";
                console.log("Sending message to " + to);
                const msgResult = await client.sendMessage(to,message.body);
                if(msgResult){
                    socket.emit("testMessageSent", {
                        title: "Message Sent Successfully",
                        message: "Test Message Sent Successfully To " + message.to,
                    })
                } else{
                    socket.emit("testMessageSent", {
                        title: "Unable To Send Message",
                        message: "Unable To Send Message To " + message.to,
                    })
                }
            } else{
                socket.emit("instanceNotFound", {
                    message: "Instance not found",
                })
            }
        })
    })

    socket.on('sendWAOTP', async (data) => {
        console.log(data)
        const mobile = process.env.ADMIN_WA_NUMBER;
        console.log(mobile)
        const sql = "SELECT `insid` FROM users WHERE `mobile` = ?";
        
        const result = await queryAsync(sql,[mobile])
        if(result){
            const id = result[0].insid
            const client = allSessionsObject[id];
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
    })

    socket.on('sendMessage', async (data) => {
        const key = data.key;
        const message = data.message;
        const sql = "SELECT `insid` FROM instances WHERE api_key =?";
        db.query(sql, [key], async (err,result) => {
            if(err) return console.error(err);
            if(result.length > 0){
                const id = result[0].insid;
                const client = allSessionsObject[id];
                const to = message.to + "@c.us";
                console.log("Sending API message to " + to);
                const msgResult = await client.sendMessage(to,message.body);
                if(msgResult){
                    socket.emit("messageSent", {
                        title: "Message Sent Successfully via API",
                        message: "Message Sent Successfully via API To " + message.to,
                    })
                } else{
                    socket.emit("messageSent", {
                        title: "Unable To Send Message via API",
                        message: "Unable To Send Message via API To " + message.to,
                    })
                }
            } else{
                socket.emit("instanceNotFound", {
                    message: "Instance not found",
                })
            }
        })
    })
    //User requests to get the current instance to be logged out from the devices
    socket.on('logout', async (data) => {
        console.log('logout called')
        const client = allSessionsObject[data];
        await client.logout(); // Close the client
        delete allSessionsObject[data]; // Remove session from allSessionsObject
        const sql = "UPDATE instances SET authenticated =0, wid='' WHERE insid =?";
        db.query(sql,[data], (err) => {
            if (err) throw err;
            socket.emit("sessionRemoved", {
                id: data,
                title: "Logged Out!",
                message: "Session removed due to logout"
            });
        })
    })

    socket.on('getMessageLog', async (data) => {
        // console.log(data)
        const {id} = data
        let client = allSessionsObject[id];
        // console.log(client)
        const sql = "SELECT authenticated, instanceName FROM instances WHERE insid = ?";
        const result = await queryAsync(sql,id)
        // console.log(result[0].authenticated)
        if(result.length > 0 && result[0].authenticated == 1){
            try {
                const chats = await client.getChats();
                let messagesSentByMe = [];
                           
                socket.emit('messageLogFetched', {
                    id: data,
                    title: "Logs Fetched",
                    message : `Message Log for Token Name: ${result[0].instanceName} is fetched.`,
                    result: chats
                })
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        }else if(result.length > 0 && result[0].authenticated == 0){
            socket.emit('unAuthenticated', {
                id: data,
                title: "Token is not connected with Whatsapp.",
                message : `${result[0].instanceName} Token is not Connected With Whatsapp.`,
                result: chats
            })
        }else{
            socket.emit('invalidToken', {
                id: data,
                title: "Token is not Valid.",
                message : "Token is not Valid."
            })
        }
        
    })
}

const allSessions = (id) => {
    if(!allSessionsObject){
        return {message:'Instance not created'}
    }else{
        return allSessionsObject[id]
    }
}

module.exports = {
    createWhatsappSession, allSessions
};
