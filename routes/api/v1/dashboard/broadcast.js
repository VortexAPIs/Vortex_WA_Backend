const express = require('express');
const router = express.Router();
const broadcastController = require('../../../../controllers/broadcastController')
const uploadBroad = require('../../../../middleWare/uploadBroad')
const path = require('path');


router.post('/create', uploadBroad.single('file'), broadcastController.CreateBroadcast)
router.post('/view',broadcastController.veiwBroadcast)
router.get('/:id',broadcastController.details)

router.get('/broadcastFiles/:filename', (req, res) => {
    const filename = req.params.filename;
    console.log(filename)
    const directoryPath = path.join(__dirname, '../../../../assets/uploads/broadcasts/');
    
    // Send the file
    res.sendFile(path.join(directoryPath, filename), (err) => {
        if (err) {
            res.status(404).send({ message: 'File not found.' });
        }
    });
});

// router.get('/announceFiles/:filename', (req, res) => {
//     const filename = req.params.filename;
//     const directoryPath = path.join(__dirname, '../../../../assets/uploads/announcements/');
//     console.log(directoryPath)
//     // Send the file
//     res.sendFile(path.join(directoryPath, filename), (err) => {
//         if (err) {
//             res.status(404).send({ message: 'File not found.' });
//         }
//     });
// });

module.exports = router;