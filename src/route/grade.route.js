const express = require('express');
const gradeRouter = express.Router();
const Grade = require('../api/grade');
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

gradeRouter.route('/:id')
.get(Grade.getOneGrade)
.put(Grade.updateGrade)
.delete(Grade.deleteGrade);

gradeRouter.route('/myClass/:myClassId')
.get(Grade.getMyClassGrades)
.put(Grade.updateMyClassGrades)
.post(Grade.createMyClassGrades);

gradeRouter.route('/bulk/:myClassId')
.post(uploadXlsx.single('grade'), xlsxMiddleware.parseXLSX, Grade.createBulkMyClassGrades)
.put(uploadXlsx.single('grade'), xlsxMiddleware.parseXLSX, Grade.updateBulkMyClassGrades)
.delete(Grade.deleteBulkMyClassGrades);


gradeRouter.route('/all')
.get(Grade.getAllGrades)

gradeRouter.route('/:filterName/:filterValue')
.get(Grade.getFilteredGrades)

module.exports = gradeRouter;
