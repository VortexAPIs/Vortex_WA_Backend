const broadcastService = require('../services/broadcastService')


exports.CreateBroadcast = async (req,res) => {

    try {
        const file = req.file;
        const { subject, description } = req.body;  // Extract additional fields

        // Log the received data for debugging
        console.log('File:', file);
        console.log('Subject:', subject);
        console.log('Description:', description);

        // Ensure title, description, and userId are provided (if required)
        if (!subject || !description) {
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

        // Log the fileData for debugging
        console.log('FileData:', fileData);

        // Pass data to the service layer
        const result = await broadcastService.createBroadcast({ fileData, subject, description });
        res.send({ message: 'Data uploaded successfully.', fileId: result.insertId });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred while uploading the file.', error });
    }
}

exports.veiwBroadcast = async (req,res) => {
    try {
        const result = await broadcastService.veiwBroadcast(req.body)
        // console.log(result)
        res.json({message: 'Broadcasts Found', result: result})
    } catch (error) {
        
    }
}

exports.details = async (req,res) => {
    console.log(req.params)
    try {
        const result = await broadcastService.details(req.params)
        // console.log(result)
        res.json({message: 'Details Fetched', result: result})
    } catch (error) {
        
    }
}