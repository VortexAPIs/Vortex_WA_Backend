const express = require('express');
const router = express.Router();
const paymentController = require('../../../../controllers/paymentController');

router.post('/validate', paymentController.validate);
router.post('/order', paymentController.order);

module.exports = router;