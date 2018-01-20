const express = require('express');
const googleDrive = require('google-drive');
const googleDriveRouter = express.Router();
const path = require('path');
const GoogleAuth = require('../middlewares/googleCredential.middleware'); 
const GoogleDrive = require('../api/googleDrive');
const fs = require('fs');
const multer = require('multer');
const tempPath = path.join(__dirname, '../tmp/');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, tempPath)
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
});
const upload = multer({
	storage: storage
});

googleDriveRouter.route('/:programId')
.get(GoogleAuth, GoogleDrive.fileList)
.post(GoogleAuth, upload.single('file'), GoogleDrive.saveFile);


module.exports = googleDriveRouter;
