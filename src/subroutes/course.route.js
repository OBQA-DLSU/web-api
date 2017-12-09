const express = require('express');
const courseRouter = express.Router();
const Course = require('../api/course');

courseRouter.route('/programCourse/:id')
.get(Course.getOneCourse)
.put(Course.updateCourse)
.delete(Course.deleteCourse);

courseRouter.route('/bulk/:programId')
.post(Course.bulkAddCourse)
.put(Course.bulkUpdateCourse)
.delete(Course.bulkDeleteCourse);

courseRouter.route('/:programId/:toBeAssessed')
.get(Course.getCourse)
.post(Course.addCourse);

module.exports = courseRouter;