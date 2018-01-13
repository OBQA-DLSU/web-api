const express = require('express');
const studentRouter = express.Router();
const Student = require('../api/student');
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


studentRouter.route('/all')
.get(Student.getAllStudent);

studentRouter.route('/myClass/:myClassId')
.get(Student.getMyClassStudent)
.post(Student.createMyClassStudent);

studentRouter.route('/program/:programId/')
.get(Student.getStudentByProgram);

studentRouter.route('/bulk/:programId/:myClassId')
.post(uploadXlsx.single('student'), xlsxMiddleware.parseXLSX, Student.bulkCreateMyStudent);
// .put()
// .delete()

studentRouter.route('/myClassStudent/:id')
.get(Student.getOneMyClassStudent)
.put(Student.updateMyClassStudent)
.delete(Student.deleteMyClassStudent)

studentRouter.route('/:id')
.get(Student.getStudentById)
.put(Student.updateStudent)
.delete(Student.deleteStudent);

module.exports = studentRouter;
