const Razorpay = require("razorpay");
const db = require("../config/db");
const {createPaymentsTable} = require("../models/Payments");
const { addDays, format } = require('date-fns');
const { promisify } = require('util');
const queryAsync = promisify(db.query).bind(db);

exports.validate = async (data) => {
    try {
        createPaymentsTable();
        const razorpay_order_id = data.razorpay_order_id;
        const razorpay_payment_id = data.razorpay_payment_id;
        const insid = data.insid;
        const reslt = await queryAsync('Select instanceName FROM instances WHERE insid=?',[insid])
        const insName = reslt[0].instanceName
        // console.log(reslt[0].instanceName)
        const uuid = data.uuid;
        var duration = data.validity;
        var d = new Date();
        const formatDate = (date) => format(date, 'yyyy-MM-dd');
        const formatDate1 = (date) => format(date, 'yyyy-MM-dd');
        const billingDate = formatDate(d);
        // console.log(billingDate)
        var valid = await addDays(d, duration);
        // console.log(valid)
        const validTill = formatDate1(valid);
        // console.log(validTill)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id)
        // console.log(paymentDetails)
        if(paymentDetails.status === "authorized" || paymentDetails.status === "captured"){
            var card_vpa_wallet_id = paymentDetails.card_id || paymentDetails.bank || paymentDetails.wallet || paymentDetails.vpa;
            var transaction_id = '';
            if(paymentDetails.method === "card"){
                transaction_id = paymentDetails.acquirer_data.card_transaction_id
            }else if(paymentDetails.method === "netbanking"){
                transaction_id = paymentDetails.acquirer_data.bank_transaction_id
            }else if(paymentDetails.method === "wallet"){
                transaction_id = paymentDetails.acquirer_data.wallet_transaction_id
            }else if(paymentDetails.method === "upi"){
                transaction_id = paymentDetails.acquirer_data.upi_transaction_id
            }else{
                transaction_id = '';
            }
            
            // Insert payment details to Payments table
            const sql1 = `INSERT INTO payments (uuid, insid, instanceName, paymentID, orderID, amount, currency, status, method, card_vpa_wallet_id, email, contact, transaction_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            const result = await queryAsync(sql1, [
                uuid,
                insid,
                insName,
                paymentDetails.id,
                razorpay_order_id,
                paymentDetails.amount / 100,
                paymentDetails.currency,
                paymentDetails.status,
                paymentDetails.method,
                card_vpa_wallet_id,
                paymentDetails.email,
                paymentDetails.contact,
                transaction_id
            ])
            if(!result){
                return {message: "Payment failed"}
            }else{
                const sql = `UPDATE instances SET status = 'Active', trial = 0, authenticated = 0, billingDate = '${billingDate}', validTill = '${validTill}' WHERE insid = ?`;
                const results = await queryAsync(sql, [insid]);
            }
        }
        return {message: "Payment verified", orderId: razorpay_order_id, paymentId: razorpay_payment_id}
        
    } catch (error) {
        console.log(error)
        return {message: "Payment failed", error: error}        
    }
};

exports.order = async (data) => {
    try {
        // console.log(data.amount)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const options = {
            amount: data.amount,
            currency: 'INR',
            receipt: data.receipt,
            payment_capture: 1 // auto capture
        };
        const order = await razorpay.orders.create(options);

        if(!order){
            return {message: "Unable to create order"}
        }else{
            return {
                message: "Order Created",
                result: order
            }
        }
        
    } catch (error) {
        console.log(error)
        res.status
    }
}