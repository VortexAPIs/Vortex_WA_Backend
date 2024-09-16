const express = require('express');
const router = express.Router();
const messageController = require('../../../../controllers/messageController');

router.post('/send', messageController.send);
router.post('/checknumberstatus', messageController.checkNumberStatus);
// router.get('/messageLogs', messageController.messageLogs)


module.exports = router;
