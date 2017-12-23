const express = require('express');
const courseRouter = express.Router();
const Course = require('../api/course');
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

courseRouter.route('/:programId')
	.get(Course.getCourse);

courseRouter.route('/programCourse/:id')
	.get(Course.getOneCourse)
	.put(Course.updateCourse)
	.delete(Course.deleteCourse);

courseRouter.route('/bulk/:programId')
	.post(uploadXlsx.single('file'), xlsxMiddleware.parseXLSX, Course.bulkAddCourse)
	.put(Course.bulkUpdateCourse)
	.delete(Course.bulkDeleteCourse);

courseRouter.route('/:programId/:toBeAssessed')
	.get(Course.getToBeAssessedCourse)
	.post(Course.addCourse);

module.exports = courseRouter;

