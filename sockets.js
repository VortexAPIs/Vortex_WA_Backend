// sockets.js
const db = require("./config/db");
const { createWhatsappSession } = require('./middleWare/whatsappSession');
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);

let io;

const initializeSocket = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    "http://localhost:3000",
                    "http://localhost:3002", 
                    "http://react.unrealautomation.com", 
                    "http://react.unrealautomation.com:3000", 
                    "https://react.unrealautomation.com", 
                    "https://react.unrealautomation.com:3000",
                    "https://hot-spoons-stare.loca.lt"
                ];
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ["GET", "POST"],
        }
    });

    io.on('connection', (socket) => {
        console.log("a user connected", socket.id);
        
        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
        });
        
        socket.on('connected', (data) => {
            console.log("Connected to the server", data);
            socket.emit("Hello", "Hello from server");
        });

        socket.on('createSession', (data) => {
            const { id } = data;
            createWhatsappSession(id, socket);
        });

        socket.on('getAllChats', async (data) => {
            const id = data.insid;
            const client = allSessionsObject[id];
            const allChats = await client.getChats();
            socket.emit('allChats', { allChats });
        });

        socket.on('fetchInstance', async (data) => {
            const uuid = data.uuid;
            const sql = "SELECT * FROM instances WHERE uuid = ?";
            db.query(sql, [uuid], async (err, result) => {
                if (err) return console.error(err);
                if (result.length > 0) {
                    socket.emit("instanceFetched", {
                        message: "Instance Found",
                        result: result,
                    });
                } else {
                    console.log("No Instance Found");
                }
            });
        });

        socket.on('removeInstance', async (data) => {
            const sql = "DELETE FROM instances WHERE insid = ?";
            db.query(sql, [data], (err, result) => {
              if (err) throw err;
              console.log("Instance removed from database");
              socket.emit("instanceRemoved", {
                title: "Instance Removed",
                message: "Instance removed successfully"
              });
            });
        });

        socket.on('fetchPayments', async (data) => {
            // console.log(data)
            const sql = "SELECT * FROM payments WHERE uuid = ?";
            db.query(sql, [data.uuid], (err, result) => {
                if (err) throw err;
                if(result.length > 0){
                    socket.emit('PaymentsFetched', {
                        title: 'Payment Details Fetched',
                        message: "Your previous payment details fetched",
                        result: result
                    })
                }
            })
        })

        socket.on('fetchTickets',async () => {
            const sql = `SELECT * FROM tickets WHERE status = 'Open'`
            db.query(sql,(err,result) => {
                if(err) throw err;
                if(result.length > 0){
                    socket.emit('ticketsFetched', {
                        title: 'Tickets Fetched Successfully',
                        result: result
                    })
                }
            })
        })

        socket.on('fetchTicketsUser',async (data) => {
            const sql = `SELECT * FROM tickets WHERE status = 'Open' AND uuid LIKE ?`
            db.query(sql,[`%${data.uuid}%`],(err,result) => {
                if(err) throw err;
                if(result.length > 0){
                    socket.emit('ticketsFetchedUser', {
                        title: 'Tickets Fetched Successfully',
                        result: result
                    })
                }
            })
        })

        socket.on('fetchTicketDetails', async(data) => {
            const sql = `SELECT * FROM tickets WHERE ticketID = ?`
            const ticket = await queryAsync(sql,[data.ticketID])
            const sql1 = `SELECT * FROM conversations WHERE ticketID = ? ORDER BY timestamp ASC`
            const conversations = await queryAsync(sql1, [data.ticketID])
            if(ticket && conversations){
                socket.emit ('ticketDetailsFetched',{
                    message: 'Ticket Details Found', 
                    ticket: ticket, 
                    conversations: conversations
                })
            }else {
                socket.emit('ticketDetailsFetched',{
                    ticket: ticket, 
                    conversation: conversations
                })
            }
        })

        socket.on('submitReply', async(data) => {
            const sql = `INSERT into conversations (ticketID, userUUID, message, role) VALUES (?, ?, ?,?)`;
            db.query(sql,[data.ticketID,data.uuid,data.message,data.role], (err,result) => {
                if(err) throw err;
                if(result){
                    socket.emit('replySubmitted')
                }
            })
        })

        socket.on('fetchBroadcasts', async() => {
            const sql = `SELECT * from broadcast`;
            db.query(sql,(err,result) => {
                if(err) throw err;
                // console.log(result)
                if(result.length > 0){
                    socket.emit('broadCastFetched',{
                        title: 'Broadcasts Fetched Successfully',
                        result: result
                    })
                }
            })
        })

        socket.on('fetchAnnouncementsUser', async(data) => {
            const sql = `SELECT * from announcements WHERE uuid LIKE ?`;
            db.query(sql,[`%${data.uuid}%`],(err,result) => {
                if(err) throw err;
                if(result.length > 0){
                    socket.emit('announcementsFetched',{
                        title: 'Announcements Fetched Successfully',
                        result: result
                    })
                }
            })
        })

        socket.on('fetchAnnouncements', async() => {
            const sql = `SELECT * from announcements`;
            db.query(sql,(err,result) => {
                if(err) throw err;
                if(result.length > 0){
                    socket.emit('announcementsFetched',{
                        title: 'Announcements Fetched Successfully',
                        result: result
                    })
                }
            })
        })
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo,
};
