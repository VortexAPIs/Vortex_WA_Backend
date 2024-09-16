const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authService = require('../services/authService');
const messageService = require('../services/messageService')
const { validationResult } = require('express-validator');
const { getIo } = require('../sockets');
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);

const io = getIo();
// console.log(io)
exports.signup =  async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.json({message: error.array()[0].msg})
    }
    try {
        // console.log(req.body);
        const user = await authService.signup(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
        try {
            const loginData = await authService.login(req.body);
            // console.log(loginData.Token);
            res.json( loginData);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
};

exports.checkUserName = async (req, res) => {
    try {
        const username = await authService.checkUserName(req.body.username);
        res.json(username);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const email = await authService.checkEmail(req.body.email);
        res.json(email);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCaptcha = async (req, res) => {
    try {
        const captcha = await authService.getCaptcha();
        res.json(captcha);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.json({message: error.array()[0].msg})
    }
    try {
        const changePassword = await authService.changePassword(req.body);
        res.json(changePassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.json({ message: error.array()[0].msg });
    }

    try {
        const { username } = req.body;
        const user = await authService.findUserByEmail(username);
        if (!user) {
            return res.json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 899999);
        const token = jwt.sign({ email: username, otp: otp, uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const expiryTime = new Date(Date.now()+15*60*1000)
        const sql = "INSERT into otp_tokens (uuid, otp, token, is_used, expires_at) VALUES (?, ?, ?, FALSE, ?)";

        const result = await queryAsync(sql, [user.uuid, otp, token, expiryTime]);

        if(result){
            // Send email with reset link
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST, // Replace with your SMTP server address
                port: process.env.EMAIL_PORT, // Use 465 for SSL or 587 for TLS
                secure: true, // true for 465, false for other ports like 587
                auth: {
                    user: process.env.EMAIL_USER, // Your domain email address
                    pass: process.env.EMAIL_PASSWORD, // Your email password
                },
                tls: {
                    rejectUnauthorized: false, // Set to true if you want to enforce certificate validation
                },
            });
            
            const mailOptions = {
                from: `"Vortex WhatsApp API" ${process.env.EMAIL_USER}`, // Sender address
                to: username, // Recipient's email address
                subject: 'Password Reset Instructions', // Subject line
                html: `
                    <p>Dear ${user.name},</p>
            
                    <p>We have received a request to reset the password for your account associated with this email address.</p>
            
                    <p>Please follow the instructions below to reset your password:</p>
            
                    <ol>
                        <li>Click the link below to reset your password:</li>
                        <p><a href="${resetLink}">Reset Password</a></p>
            
                        <li>You will be prompted to enter a new password. Make sure your password meets the following criteria:</li>
                        <ul>
                            <li>At least 8 characters</li>
                            <li>At least one uppercase letter</li>
                            <li>At least one lowercase letter</li>
                            <li>At least one number</li>
                            <li>At least one special character (except for $)</li>
                        </ul>
            
                        <li>After entering and confirming your new password, click the "Submit" button to save the changes.</li>
                    </ol>
            
                    <p><strong>Please note:</strong></p>
                    <ul>
                        <li>The reset link is valid for only 24 hours.</li>
                        <li>If you did not request a password reset, you can ignore this email. Your password will remain unchanged.</li>
                    </ul>
            
                    <p>If you encounter any issues, feel free to contact our support team at support@unrealautomation.com.</p>
            
                    <p>Thank you,<br>The Vortex Team</p>
                `, // HTML body for the email content
            };
    
            const mailResult = await transporter.sendMail(mailOptions);
            
            // Send OTP via WhatsApp
            
            const maskEmail = (email) => {
                const [localPart, domain] = email.split('@');
                const maskedLocalPart = localPart.slice(0, 2) + '****' + localPart.slice(-1); // Mask the local part
                const maskedDomain = domain.slice(0,1) + '****' + domain.slice(-3)
                return maskedLocalPart + '@' + maskedDomain;
            };
    
            const to = user.mobile
            const maskedEmail = maskEmail(user.email);
            const message = `Your OTP for password reset is: ${otp}.\nPlease check your email (${maskedEmail}) for the password reset link to complete the process.\n\nAdditionally, be sure to look in your email's Spam folder and mark us as 'Not Spam' to ensure you receive future emails without issues.
            `;
            const otpOption = {
                to: to+'@c.us',
                message: message,
            }
            const otpMsg = await messageService.sendWAOTP(otpOption)
            
            if(mailResult && otpMsg){
                res.json({ 
                    title: 'Password Reset Instructions Sent',
                    message: 'Password reset link and OTP have been sent to your email and WhatsApp.' });
            }
        }else{
            res.json({
                title: 'Something went wrong.',
                message: 'Unable to generate OTP and send Email. Please try again.'
            })
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.json({ message: error.array()[0].msg });
    }
    
    try {
        const { token } = req.params;
        const { password } = req.body;
        const { otp } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.otp === Number(otp)){
            const sql = "SELECT * FROM otp_tokens WHERE uuid = ? AND otp = ? AND token = ? AND is_used = FALSE AND expires_at > NOW()"
            const result = await queryAsync(sql,[decoded.uuid, otp, token]);
            if(result.length>0){
                const sql1 = "UPDATE otp_tokens SET is_used = TRUE WHERE uuid = ? AND otp =? AND token = ?"
                await queryAsync(sql1,[decoded.uuid,otp,token])
                const changePassword = await authService.changePassword({ username: decoded.email, password });
                res.json(changePassword);
            }else{
                res.json({title: 'Invalid OTP/Token', message: 'Either OTP or Token has expired. Please regenerate Password Reset Link.'})
            }
        }else{
            res.json({message: 'Incorrect OTP'})
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.fetchUser = async (req, res) => {
    // console.log('User ID from middleware:');
    // console.log(req)

    try {
        const userId = req.user.id; // User ID from the middleware
        const user = await authService.getUserById(userId);
        res.json(user);
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

exports.fetchUsers = async (req, res) => {
    try {
        const users = await authService.fetchUsers()
        res.json(users)
    } catch (error) {
        res.status(500).send("Server Error");
    }
}
