const express = require('express');
const myClassRouter = express.Router();
const MyClass = require('../api/myClass');
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

myClassRouter.route('/programMyClass/:id')
.get(MyClass.getOneMyClass)
.put(MyClass.updateMyClass)
.delete(MyClass.deleteMyClass);

myClassRouter.route('/bulk/:programId')
.post(uploadXlsx.single('classes'), xlsxMiddleware.parseXLSX, MyClass.bulkCreateMyClass)
.put(MyClass.bulkUpdateMyClass)
.delete(MyClass.bulkDeleteMyClass);

myClassRouter.route('/filteredByProgramId/:programId/:filterName/:filterValue')
.get(MyClass.getMyClassPerProgramFiltered);

myClassRouter.route('/all/')
.get(MyClass.getAllMyClass)

myClassRouter.route('/:programId')
.get(MyClass.getMyClass)
.post(MyClass.createMyClass);

myClassRouter.route('/:filterName/:filterValue')
.get(MyClass.getMyClassFiltered)


module.exports = myClassRouter;
