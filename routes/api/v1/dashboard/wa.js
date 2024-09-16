const express = require('express');
const router = express.Router();
const waController = require('../../../../controllers/waController');

router.post('/createSession', waController.createSession);
router.post('/fetchInstance', waController.fetchInstance);
router.post('/createInstance', waController.createInstance);

module.exports = router;
