const express = require('express');
const googleDrive = require('google-drive');
const evidenceRouter = express.Router();
const path = require('path');
const GoogleAuth = require('../middlewares/googleCredential.middleware'); 
const Evidence = require('../api/evidence');
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

evidenceRouter.route('/:programId')
.get(GoogleAuth, Evidence.getListOfEvidencePerProgram)
.post(GoogleAuth, upload.single('file'), Evidence.saveEvidence);

evidenceRouter.route('/query/:programId') // with query object.
.post()

module.exports = evidenceRouter;
