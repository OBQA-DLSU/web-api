const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

exports.getCourse = async (req, res, next) => {
  const { programId } = req.params;
  let programCourses;
  try {
    programCourses = await db.programCourse.findAll({ where: {programId}, include: [ { all: true } ] });
    if(!programCourses || programCourses.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Cannot find Course for Program ID: ${programId}`)); return; }
    res.status(200).send(programCourses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.addCourse = (req, res, next) => {
  
};

exports.getOneCourse = (req, res, next) => {
  const { id } = req.params;
  let programCourse;
  try {
    programCourse = await db.programCourse.findOne({ where: { id }, include: [ {all:true} ]});
    if(!programCourse) { res.status(400).send(ErrorMessageService.clientError(`Cannot find Course ID: ${id}`)); return; }
    res.status(200).send(programCourse);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateCourse = (req, res, next) => {

};

exports.deleteCourse = (req, res, next) => {

};
