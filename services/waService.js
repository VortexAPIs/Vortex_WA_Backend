const db = require("../config/db");
const {createInstanceTable} = require('../models/Instances');
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);


exports.fetchInstance = async (id) => {
    // console.log('Fetching instances by ID:', id);
    try {
        const sql = `SELECT * FROM instances WHERE uuid = ?`;
        const results = await queryAsync(sql, [id]);
        if(results.length > 0){
            // console.log(results[0])
            results.forEach(row => {
                var tDays = (new Date() - new Date(row.created_at))/1000/60/60/24;
                var bDays = 30;
                if(row.validTill){
                    bDays = (new Date(row.validTill) - new Date())/1000/60/60/24;
                }
                // console.log(bDays)
                if((tDays > 3 && row.trial === 1)){
                    const sql1 = `UPDATE instances SET status = 'Trial Expired', trial = 0, authenticated = 0 WHERE insid = ?`;
                    db.query(sql1, [row.insid], async (err, res) => {
                        if (err) throw err;
                        // console.log(res)
                    })
                }else if(Math.ceil(bDays) >= 1 && Math.ceil(bDays) <=3){
                    const sql2 = `UPDATE instances SET status = '${Math.ceil(bDays)} Days Left', trial = 0 WHERE insid = ?`;
                    db.query(sql2, [row.insid], async (err, res) => {
                        if (err) throw err;
                        // console.log(res)
                    })
                }else if(Math.ceil(bDays) <= 0){
                    const sql3 = `UPDATE instances SET status = 'Expired', trial = 0 WHERE insid = ?`;
                    db.query(sql3, [row.insid], async (err, res) => {
                        if (err) throw err;
                    })
                }else{

                }
            });
            return {
                message: "Instance Found",
                result: results
            }
        } else{
            return {message: "Instance not found"}
        }
    } catch (error) {
        console.error(error);
    }
};

exports.createInstance = async (data) => {
    try {
        createInstanceTable();
        const sql1 = `SELECT * FROM instances WHERE uuid = ?`;
        const result = await queryAsync(sql1, [data.uuid]);
        if(result.length >0 && result.length <5){
            const sql = `INSERT INTO instances (uuid, insid, instanceName) VALUES ("${data.uuid}","${data.insID}","${data.name}")`;
            const results = await queryAsync(sql);
            return {
                message: "Instance Created",
                result: results
            }
        }else if(result.length === 0){
            const sql = `INSERT INTO instances (uuid, insid, instanceName) VALUES ("${data.uuid}","${data.insID}","${data.name}")`;
            const results = await queryAsync(sql);
            return {
                message: "Instance Created",
                result: results
            }
        }else{
            return {
                message: "Instance Limit Reached",
            }
        }
    } catch (error) {
        console.error(error);
    }
};

