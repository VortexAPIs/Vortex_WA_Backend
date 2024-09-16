// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = path.join(__dirname, '../assets/uploads/broadcasts/');

        // Log the directory path
        console.log('Directory Path:', dirPath);

        // Check if directory exists
        if (!fs.existsSync(dirPath)) {
            // Create the directory
            console.log('Directory does not exist, creating...');
            fs.mkdirSync(dirPath, { recursive: true });
        } else {
            console.log('Directory exists.');
        }

        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        const fileName = file.fieldname + '_' + Date.now() + path.extname(file.originalname);
        
        // Log the file name
        console.log('Generated File Name:', fileName);
        
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage
});

module.exports = upload;
