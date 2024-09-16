const {createTicketsTable, createConversationTable} = require('../models/Tickets');
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);
const { v4: uuidv4 } = require('uuid'); 

exports.create = async (data) => {
    try {
        createTicketsTable();
        const sql = `INSERT into tickets (ticketID, uuid, insid, issueType, subject, issue ) values (?)`
        const values = [
            data.ticketID = await uuidv4().split("-")[0],
            data.uuid,
            data.insid,
            data.type,
            data.subject,
            data.issue,
        ]
        const results = await queryAsync(sql,[values]);
        if(results){
            return ({message: 'Ticket Created'})
        }
    } catch (error) {
        console.log('Ticket not created: '+ error)
        // return ({message: 'Ticket Not Created'})   
    }
}

exports.view = async (data) => {
    // console.log(data)
    try {
        if(data.role === 'user'){
            const sql = `SELECT * from tickets where uuid = ?`
            const results = await queryAsync(sql,[data.uuid]);
            // console.log(results)
            if(results){
                return ({message: 'Ticket Found',result:results})
            }
        }else{
            const sql = `SELECT * from tickets`
            const results = await queryAsync(sql);
            // console.log(results)
            if(results){
                return ({message: 'Ticket Found',result:results})
            }
        }
    } catch (error) {
        console.log('Ticket not fetched: '+ error)
    }
}

exports.ticketDetail = async (data, params) => {
    const { ticketID } = params;
    try {
        const sql = `SELECT * FROM tickets WHERE ticketID = ?`
        const ticket = await queryAsync(sql,[ticketID])
        const sql1 = `SELECT * FROM conversations WHERE ticketID = ? ORDER BY timestamp ASC`
        const conversations = await queryAsync(sql1, [ticketID])
        if(ticket && conversations){
            return ({message: 'Ticket Details Found', ticket, conversations})
        }else {
            return({ticket: ticket, conversation: conversations})
        }
    } catch (error) {
        console.log('Ticket details not fetched: '+ error)
    }
}

exports.reply = async (data, params, user) => {
    createConversationTable()
    const { ticketID } = params;
    const { reply, uuid, role } = data;
    // const uuid = data.uuid;

    try {
        const sql = `INSERT INTO conversations (ticketID, userUUID, message, role) VALUES (?, ?, ?,?)`;
        const result = await queryAsync(sql,[ticketID, uuid, reply, role])
        if(result){
            return({ message: 'Reply added' })
        }
    } catch (error) {
        console.log('Cannot save reply: '+ error)
    }
}

exports.close = async (data, params) => {
    const { ticketID } = params;
    try {
        const sql = `UPDATE tickets SET status = ? WHERE ticketID = ?`
        const result = await queryAsync(sql, ['Closed', ticketID])
        if(result){
            return({message: 'Ticket Closed'})
        }
    } catch (error) {
        console.log('Unable to close the ticket: '+ error)
    }
}