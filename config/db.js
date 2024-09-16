const mysql = require('mysql2');
const local_con = true

const LOCAL_URI = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
  connectionLimit: 10
}
const Prod_URI = {
  host: "37.27.71.198",
  user: "root",
  password: "<PASSWORD>",
  database:"unreal_automation"
}
db = null;
if(local_con == true){
  db = mysql.createConnection(LOCAL_URI)
  // return db
} else{
  db = mysql.createConnection(Prod_URI)
  // return db
}

module.exports = db;