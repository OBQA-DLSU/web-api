const express = require('express');
const studentRouter = express.Router();
const Student = require('../api/student');
const fs = require('fs');
const multer = require('multer');
const xlsxMiddleware = require('../middlewares/xlsx.middleware');

studentRouter.route('/all')
.get(Student.getAllStudent);

studentRouter.route('/myClass/:myClassId')
.get(Student.getMyClassStudent)
.post(Student.createMyClassStudent);

studentRouter.route('/program/:programId/')
.get(Student.getStudentByProgram);

// studentRouter.route('/bulk/:myClassId')
// .post()
// .put()
// .delete()

studentRouter.route('/:id')
.get(Student.getStudentById)
.put(Student.updateStudent)
.delete(Student.deleteStudent);

module.exports = studentRouter;