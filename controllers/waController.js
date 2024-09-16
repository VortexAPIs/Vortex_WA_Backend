const waService = require('../services/waService');

exports.createSession = (req, res) => {
    const { id } = req.body;
    waService.createWhatsappSession(id);
    res.json({ message: 'Session creation initiated' });
};

exports.fetchInstance = async (req, res) => {
    
    try {
        // console.log(req.body);
        const id  = req.body.uuid;
        const instances = await waService.fetchInstance(id);
        res.json(instances);
    } catch (error) {
        res.status(500).send(error.message);
    }
    // res.json(instances);
};

exports.createInstance = async (req, res) => {
    try {
        const instances = await waService.createInstance(req.body);
        res.json(instances);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
