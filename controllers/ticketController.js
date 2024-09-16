const ticketService = require('../services/ticketService')

exports.create = async (req, res) => {
    try {        
        const result = await ticketService.create(req.body);
        // console.log(result)
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.view = async (req,res) => {
    try {
        // console.log(req.body)
        const result = await ticketService.view(req.body)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

exports.ticketDetail = async (req, res) => {
    try {
        // console.log(req.query)
        const result = await ticketService.ticketDetail(req.body, req.query)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

exports.reply = async (req, res) => {
    req.body
    try {
        const result = await ticketService.reply(req.body, req.query, req.user)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}

exports.close = async (req,res) => {
    try {
        const result = await ticketService.close(req.body,req.query)
        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
}