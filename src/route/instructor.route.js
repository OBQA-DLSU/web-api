const express = require('express');
const instructorRouter = express.Router();
const Instructor = require('../api/instructor');
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

instructorRouter.route('/all')
.get(Instructor.getAllInstructor);

instructorRouter.route('/program/:programId/')
.get(Instructor.getInstructorByProgram)
.post(Instructor.createInstructor)

instructorRouter.route('/:id')
.get(Instructor.getOneInstructor)
.put(Instructor.updateInstructor)
.delete(Instructor.deleteInstructor);

module.exports = instructorRouter;
