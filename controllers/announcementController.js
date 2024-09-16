const announcementService = require('../services/announcementService')
const path = require('path');

exports.create = async (req,res) => {
    try {
        const file = req.file;
        const { uuid, subject, description } = req.body;  // Extract additional fields

        // Ensure title, description, and userId are provided (if required)
        if (!uuid || !subject || !description) {
            return res.status(400).send({ message: 'Missing required fields.' });
        }

        // Handle file data only if it exists
        let fileData = null;
        if (file) {
            fileData = {
                fileName: file.filename,
                filePath: file.path,

            };
        }

        // Pass data to the service layer
        const result = await announcementService.create({ fileData, uuid, subject, description });
        res.send({ message: 'Data uploaded successfully.', fileId: result.insertId });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred while uploading the file.', error });
    }
};

exports.view = async (req,res) => {
    try {
        const result = await announcementService.view(req.body)
        // console.log(result)
        res.json({message: 'Announcement Found', result: result})
    } catch (error) {
        
    }
}

exports.details = async (req,res) => {
    console.log(req.params)
    try {
        const result = await announcementService.details(req.params)
        console.log(result)
        res.json({message: 'Details Fetched', result: result})
    } catch (error) {
        
    }
}