const {createCompanyTable} = require('../models/Company');
const db = require("../config/db");
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);

exports.createCompany = async (companyData) => {
    try {
        createCompanyTable();
        const sql1 = `SELECT * FROM companies WHERE uuid = "${companyData.uuid}"`;
        const results = await queryAsync(sql1);
        if(!results.length > 0 && results.length < 1){
            const sql = `INSERT INTO companies (uuid, company_name, address, company_email, contact_number, company_website) VALUES (?)`;
            const values = [
                companyData.uuid,
                companyData.cName,
                companyData.cLocation,
                companyData.cEmail,
                companyData.cContact,
                companyData.cWeb,
            ]
            const result = queryAsync(sql, [values])
            return {
                message: "Company Data Stored Successfully",
                result: results
            }
        }else{
            return res.json({message: "Company details already stored"})
        }
    }catch (error) {
        console.log(error)
    }
};

exports.getCompanyById = async (data) => {
    if(!data.uuid){
        return {message: "Unable to get Company Details"}
    }else{
        const sql = `SELECT * FROM companies WHERE uuid = ?`;
        const result = await queryAsync(sql, [data.uuid]);
        if(result.length > 0){
            // console.log(results)
            return{
                message: "Company Found",
                result: result
            }
        } else{
            return {message: "Company not found"}
        }
    }
};
