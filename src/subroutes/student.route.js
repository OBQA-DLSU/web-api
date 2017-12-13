const express = require('express');
const studentRouter = express.Router();
const Student = require('../api/student');
const fs = require('fs');
const multer = require('multer');
const xlsxMiddleware = require('../middlewares/xlsx.middleware');

studentRouter.route('/all')
.get(Student.getAllStudent)

// studentRouter.route('/myClass/:myClassId')
// .get()
// .post()

// studentRouter.route('/myClass/:myClassId/:id')
// .get()

// studentRouter.route('/program/:programId/')
// .get()

// studentRouter.route('/bulk/:myClassId')
// .post()
// .put()
// .delete()

// studentRouter.route('/:id')
// .put()
// .delete()

module.exports = studentRouter;