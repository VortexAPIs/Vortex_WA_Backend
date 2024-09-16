const companyService = require('../services/companyService');

exports.createCompany = async (req, res) => {
    try {
        const company = await companyService.createCompany(req.body);
        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.fetchCompany = async (req, res) => {
    // console.log(req.body);
    try {
        const company = await companyService.getCompanyById(req.body);
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
