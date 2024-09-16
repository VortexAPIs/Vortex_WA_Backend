const {createAnnouncementsTable} = require('../models/Announcements');
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);
const { v4: uuidv4 } = require('uuid');

exports.create = async ({ fileData, uuid, subject, description }) => {

    createAnnouncementsTable()
    const announceid = await uuidv4().split("-")[0]
    return new Promise((resolve, reject) => {
        const data = {
            announceID: announceid,
            uuid:uuid,
            subject:subject,
            description:description,
        };
        if(fileData){
            data.fileName = fileData.fileName,
            data.filePath = fileData.filePath
        }

        const sql = 'INSERT INTO announcements SET ?';
        db.query(sql, data, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.view = async (data) => {
    const uuid = data.uuid;
    const role = data.role;
    if(role === 'user'){
        const sql = "SELECT * FROM announcements WHERE uuid LIKE ?";
        const result = await queryAsync(sql,[uuid]);
        if(result.length > 0){
            // console.log(results)
            return{
                message: "Announcements Found",
                result: result
            }
        } else{
            return {message: "Announcements not found"}
        }
    }else{
        const sql = "SELECT * FROM announcements";
        const result = await queryAsync(sql);
        if(result.length > 0){
            // console.log(results)
            return{
                message: "Announcements Found",
                result: result
            }
        } else{
            return {message: "Announcements not found"}
        }
    }
}

exports.details = async (data) => {
    console.log(data.id)
    const sql = `SELECT * FROM announcements WHERE announceID = ?`
    const result = await queryAsync(sql, [data.id]);
    if(result.length>0){
        return result
    }else{
        return "Unable to Fetch Details."
    }
}