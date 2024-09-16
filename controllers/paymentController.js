const paymentService = require('../services/paymentService');

exports.validate = async (req, res) => {
    try {
        // console.log(req.body);
        const payment = await paymentService.validate(req.body);
        res.json(payment);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
exports.order = async (req, res) => {
    try {
        // console.log(req.body);
        const order = await paymentService.order(req.body);
        res.json(order);
    } catch (error) {
        res.status(500).send(error.message);
    }
};