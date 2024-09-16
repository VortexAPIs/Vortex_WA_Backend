const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require('../../../../middleWare/fetchuser');
const authController = require('../../../../controllers/authController');

router.post('/signup', [
    body('name','Minimum 3 characters required').isLength({min:3}),
    body('username','Minimum 5 characters required').isLength({min:5}),
    body('email','Enter a valid email').isEmail(),
    body('mobile','Enter a valid mobile number').isMobilePhone(),
    body('password')
        .isLength({ min: 8 }).withMessage('Minimum 8 characters required')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character (excluding $)')
        .not().matches(/\$/).withMessage('Password cannot contain the $ character'),
], authController.signup);

router.post('/login', [
    body('username','Minimum 5 characters required').isLength({min:5}),
    body('password','Minimum 8 characters required').isLength({min:8}),

], authController.login);

router.post('/chkusername', authController.checkUserName);

router.post('/chkemail', authController.checkEmail);

router.get('/captcha', authController.getCaptcha);

router.post('/rePass',[
    body('username','Please enter valid Email ID').isEmail(),
], authController.requestPasswordReset);

router.post('/reset-password/:token', [
    body('password')
        .isLength({ min: 8 }).withMessage('Minimum 8 characters required')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character (excluding $)')
        .not().matches(/\$/).withMessage('Password cannot contain the $ character'),
], authController.resetPassword);

router.post('/fetchUser', fetchuser, authController.fetchUser);
router.get('/fetchUsers', authController.fetchUsers)

module.exports = router;
