const express = require('express');
const router = express.Router();
const announcementController = require('../../../../controllers/announcementController')
const uploadAnn = require('../../../../middleWare/uploadAnn')
const path = require('path');

router.post('/create', uploadAnn.single('file'), announcementController.create)
router.post('/view', announcementController.view)
router.get('/:id',announcementController.details)

router.get('/announceFiles/:filename', (req, res) => {
    const filename = req.params.filename;
    const directoryPath = path.join(__dirname, '../../../../assets/uploads/announcements/');
    console.log(directoryPath)
    // Send the file
    res.sendFile(path.join(directoryPath, filename), (err) => {
        if (err) {
            res.status(404).send({ message: 'File not found.' });
        }
    });
});

module.exports = router;