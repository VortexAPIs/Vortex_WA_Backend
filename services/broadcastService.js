const {createBroadcarstTable} = require('../models/Broadcast');
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);
const { v4: uuidv4 } = require('uuid');

exports.createBroadcast = async ({ fileData, subject, description }) => {

    createBroadcarstTable()
    const users = await queryAsync('SELECT COUNT(uuid) AS count FROM users')
    console.log(users[0].count)
    const broadid = await uuidv4().split("-")[0]
    return new Promise((resolve, reject) => {
        const data = {
            broadID: broadid,
            subject:subject,
            description:description,
            sentTo: users[0].count
        };
        if(fileData){
            data.fileName = fileData.fileName,
            data.filePath = fileData.filePath
        }

        // Log the data before inserting into the database
        console.log('Data to insert:', data);
        
        const sql = 'INSERT INTO broadcast SET ?';
        db.query(sql, data, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.veiwBroadcast = async (data) => {
    const sql = "SELECT * FROM broadcast";
    const result = await queryAsync(sql);
    // console.log(result.length)
    if(result.length > 0){
        // console.log(result)
        return{
            message: "Broadcasts Found",
            result: result
        }
    } else{
        return {message: "Broadcasts not found"}
    }
}

exports.details = async (data) => {
    // console.log(data.id)
    const sql = `SELECT * FROM broadcast WHERE broadID = ?`
    const result = await queryAsync(sql, [data.id]);
    if(result.length>0){
        return result
    }else{
        return "Unable to Fetch Details."
    }
}