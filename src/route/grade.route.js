const express = require('express');
const gradeRouter = express.Router();
const Grade = require('../api/grade');

gradeRouter.route('/myClass/:myClassId')
.get(Grade.getMyClassGrades)
.put(Grade.updateMyClassGrades)
.post(Grade.createMyClassGrades);

gradeRouter.route('/bulk/:myClassId')
.post(Grade.createBulkMyClassGrades)


gradeRouter.route('/')
.get(Grade.getAllGrades)
.post(Grade.getGradeWithQueryObject);

gradeRouter.route('/myClassGrade/:myClassId')
.post(Grade.createMyClassGrade)

gradeRouter.route('/:filterName/:filterValue')
.get(Grade.getFilteredGrades)


gradeRouter.route('/:id')
.get(Grade.getOneGrade)
.put(Grade.updateGrade)
.delete(Grade.deleteGrade);

module.exports = gradeRouter;
