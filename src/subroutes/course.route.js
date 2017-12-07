const express = require('express');
const courseRouter = express.Router();
const Course = require('../api/course');

courseRouter.route('/')
.get(Course.getCourse)
.post(Course.addCourse);

courseRouter.route('/:id')
.get(Course.getOneCourse)
.put(Course.updateCourse)
.delete(Course.deleteCourse);



module.exports = courseRouter;