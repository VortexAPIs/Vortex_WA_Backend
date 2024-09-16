const express = require('express');
const router = express.Router();
const companyController = require('../../../../controllers/companyController');

router.post('/create', companyController.createCompany);
router.post('/fetch', companyController.fetchCompany);

module.exports = router;
