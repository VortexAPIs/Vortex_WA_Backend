const messageService = require('../services/messageService');


exports.send = async (req, res) => {
    try {
        const data = {body:req.body, id:req.query.insid, key:req.headers['key']}
        // console.log(data)
        const message = await messageService.send(data);
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkNumberStatus = async (req, res) => {
    try {
        const data = {body:req.body, id: req.query.insid, number: req.query.number, key: req.headers['key']}
        // console.log(data)
        const numberStatus = await messageService.checkNumberStatus(data)
        // console.log(numberStatus)
        res.json(numberStatus)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}