const express = require('express');
const sopiRouter = express.Router();
const Sopi = require('../api/sopi');
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

sopiRouter.route('/programSopi/:id')
  .get(Sopi.getOneProgramSopi)
  .put(Sopi.updateProgramSopi)
  .delete(Sopi.deleteProgramSopi);

sopiRouter.route('/bulk/:programId')
  .post(uploadXlsx.single('sopi'), xlsxMiddleware.parseXLSX, Sopi.bulkCreateProgramSopi)
  .put(Sopi.bulkUpdateProgramSopi)
  .delete(Sopi.bulkDeleteProgramSopi);

sopiRouter.route('/:programId')
  .get(Sopi.getProgramSopi)
  .post(Sopi.createProgramSopi);

module.exports = sopiRouter;
