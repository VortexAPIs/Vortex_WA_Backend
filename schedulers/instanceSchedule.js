const cron = require('node-cron')
const shell = require('shelljs')
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);

const updateInstance = () => {
    cron.schedule("10 1 * * *", async () => {
        try {
            const sql = `SELECT * FROM instances`;
            const results = await queryAsync(sql);
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
                        const sql1 = `UPDATE instances SET status = 'Trial Expired', trial = 0 WHERE insid = ?`;
                        db.query(sql1, [row.insid], async (err) => {
                            if (err) throw err;
                        })
                    }else if(Math.ceil(bDays) >= 1 && Math.ceil(bDays) <=3){
                        const sql2 = `UPDATE instances SET status = '${Math.ceil(bDays)} Days Left', trial = 0 WHERE insid = ?`;
                        db.query(sql2, [row.insid], async (err) => {
                            if (err) throw err;
                        })
                    }else if(Math.ceil(bDays) <= 0){
                        const sql3 = `UPDATE instances SET status = 'Expired', trial = 0 WHERE insid = ?`;
                        db.query(sql3, [row.insid], async (err) => {
                            if (err) throw err;
                        })
                    }else{
                        // console.log(`Instance: ${row.insid} Is ALready Updated.`)
                    }
                });
            } else{
                console.log("Instances not found")
            }
        } catch (error) {
            console.error(error);
        }
    })
}

module.exports = {
    updateInstance
}