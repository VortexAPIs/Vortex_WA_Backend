const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const db = require('../config/db');
const fontP = '../../assets/fonts/WorkSans-Regular.ttf';
var svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid'); 
const {createUserTable} = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Promisify the db.query method
const queryAsync = promisify(db.query).bind(db);

exports.signup = async (userData) => {
    // console.log(userData)
    try {
        const salt = await bcrypt.genSalt(10);
        
        createUserTable()
        const sql = "INSERT INTO users (`uuid`, `insID`, `name`, `username`, `email`, `mobile`, `password`) VALUES (?)";
        const values = [
            userData.userid = await uuidv4(),
            userData.insID = await uuidv4(),
            userData.name,
            userData.username,
            userData.email,
            userData.mobile,
            userData.secPass = await bcrypt.hash(userData.password,salt),
        ]

        const result = await queryAsync(sql, [values]);
        if(!result) {
            return {message: "Unable to get you on board",err}
        }
        // console.log(result)
        const jwtData = jwt.sign({
            id: userData.userid,
        },JWT_SECRET);        
        return {message: "Signup Successful",Token:jwtData};
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

exports.login = async (userData) => {
    try {
        const sql1 = "SELECT * FROM users WHERE (BINARY `username` = ? or `email` = ?)";
        const result = await queryAsync(sql1, [userData.username, userData.username]);

        if (result.length > 0) {
            const passwordMatch = await bcrypt.compare(userData.password, result[0].password);
            if (!passwordMatch) {
                return { message: "Try login with correct credentials." };
            }

            const jwtToken = jwt.sign({
                id: result[0].uuid,
                insID: result[0].insID,
            }, JWT_SECRET, { expiresIn: 5000 });
            // console.log(jwtToken);
            return { Token: jwtToken, message: "Login Successful" };
        } else {
            return { message: "Try login with correct credentials." };
        }
    } catch (error) {
        console.error(error.message);
        throw new Error("Internal Server Error");
    }
};

exports.checkUserName = async (username) => {
    try {
        const sql1 = "SELECT * FROM users WHERE BINARY `username` = ?";
        const result = await queryAsync(sql1, [username]);
        if(result.length > 0){
            // console.log(result)
            return {message: "Username already taken."}

        } else{
            return {message: "Username is available."}
        }
    } catch (error) {
        console.error(error.message);
        throw new Error("Internal Server Error");
    }
};

exports.checkEmail = async (email) => {
    try {
        const sql1 = "SELECT * FROM users WHERE (`email` = ?)";
        const result = await queryAsync(sql1, [email]);
        if(result.length > 0){
            // console.log(result)
            return {message: "Email already registered."}
        }else{
            return {message: "Email is available."}
        }
    }catch (error) {
        console.error(error.message);
        throw new Error("Internal Server Error");
    }
};

exports.getCaptcha = () => {
    var captcha = svgCaptcha.create({
        size: 6, // Captcha length
        ignoreChars: '0oO1lI', // Characters to exclude (to avoid confusion)
        noise: 3, // Number of noise lines
        color: 'white', // Use color
        background: 'white', // Background color
        width: 200,
        height: 50,
        fontPath: fontP
    });
    // req.session.captcha = captcha.text;
    // console.log(captcha.text)
    return {"type": "image/svg+xml", "captcha": captcha}
};

exports.changePassword = async (userData) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const sql1 = "SELECT * FROM users WHERE (`email` = ?)";
        const result = await queryAsync(sql1, [userData.username]);
        if (result.length > 0) {
            const sql = "UPDATE users SET password =? WHERE email =?";
            const secPass = await bcrypt.hash(userData.password,salt)
                
            const result1 = await queryAsync(sql, [secPass, userData.username]);
            if(!result1) {
                return {message: "Unable to reset password, please try again",err}
            }
            return {message: "Password reset successful, please login."}
        }else{
            return {message: "Unable to reset password, please try again"}
        }
    }catch (error) {
        console.error(error.message);
        throw new Error("Internal Server Error");
    }
};

exports.findUserByEmail = async (email) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    const result = await queryAsync(sql, [email]);
    const sql1 = "DELETE FROM otp_tokens WHERE uuid = ?"
    const result1 = await queryAsync(sql1, [result[0].uuid])
    // console.log(result)
    return result.length > 0 ? result[0] : null;
};

exports.getUserById = async (userId) => {
    try {
        // console.log('Fetching user by ID:', userId);
        const sql = `SELECT uuid, insID, name, username, email, mobile, avatar, mem_type, created_at FROM users WHERE uuid = ?`;
        const result = await queryAsync(sql, [userId]);
        
        if (result.length > 0) {
            return result[0];
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Database query error");
    }
};

exports.fetchUsers = async () => {
    try {
        // console.log('Fetching user by ID:', userId);
        const sql = `SELECT uuid, name, mem_type FROM users WHERE mem_type = 'user'`;
        const result = await queryAsync(sql);
        if (result.length > 0) {
            return result;
        } else {
            return null;
        }
    } catch (error) {
        throw new Error("Database query error");
    }
}