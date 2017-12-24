const express = require('express');
const assessmentRouter = express.Router();
const Assessment = require('../api/assessment');
const fs = require('fs');
const multer = require('multer');
const xlsxMiddleware = require('../middlewares/xlsx.middleware');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, __dirname + '/uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
});

const uploadXlsx = multer({
	storage: storage,
	fileFilter: function (req, file, callback) { //file filter
		if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
			try {
				fs.unlinkSync(__dirname + '/uploads/' + file.originalname);
				console.log(result);
				req.payload = result;
				return callback(undefined);
			}
			catch (e) {
				try {
					fs.unlinkSync(__dirname + '/uploads/*');
					console.log('ERROR FILE IS NOT DELETED!!!!');
					return callback(undefined);
				}
				catch (e) { return callback(undefined); }
			}
		}
		callback(null, true);
	}
});

assessmentRouter.route('/programAssessment/:programId')
.get(Assessment.getProgramAssessments)
.post(Assessment.createAssessment);

assessmentRouter.route('/bulk/:programId')
.post(uploadXlsx.single('assessment'), xlsxMiddleware.parseXLSX, Assessment.bulkCreateAssessment)
.put(Assessment.bulkUpdateAssessment)
.delete(Assessment.bulkDeleteAssessment);

assessmentRouter.route('/filteredByProgramId/:programId/:filterName/:filterValue')
.get(Assessment.getFilteredProgramAssessments);

assessmentRouter.route('/all')
.get(Assessment.getAllAssessments)

assessmentRouter.route('/:filterName/:filterValue')
.get(Assessment.getFilteredAssessments)

assessmentRouter.route('/:id')
.get(Assessment.getOneAssessment)
.put(Assessment.updateAssessment)
.delete(Assessment.deleteAssessment);

module.exports = assessmentRouter;
