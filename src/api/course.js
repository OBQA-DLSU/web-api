const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

exports.getCourse = async (req, res, next) => {
  const { programId, toBeAssessed } = req.params;
  let programCourses;
  try {
    programCourses = await db.programCourse.findAll({ where: {programId, toBeAssessed: JSON.parse(toBeAssessed) === true }, include: [ { all: true } ] });
    if(!programCourses || programCourses.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Cannot find Course for Program ID: ${programId}`)); return; }
    res.status(200).send(programCourses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.addCourse = async (req, res, next) => {
  const {code, name, description } = req.body;
  const { programId, toBeAssessed } = req.body.params;
  let addCourseResponse, course, addProgramCourseResponse, programCourse, result;
  try {
    course = await db.course.findOne({where: {code}});
    if (!course) {
      addCourseResponse = await courseCreate(name, code);
      if(!addCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
    } else {
      addCourseResponse = course;
    }
    programCourse = await db.programCourse.findOne({where: {programId, courseId: course.id}});
    if(!programCourse) {
      addProgramCourseResponse = await programCourseCreate(programId, course.id, toBeAssessed, description);
      if(!programCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
    } else {
      addProgramCourseResponse = programCourse;
    }
    res.status(200).send(addProgramCourseResponse, addCourseResponse);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.getOneCourse = async (req, res, next) => {
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

exports.updateCourse = async (req, res, next) => {
  const { id } = req.params;
  const { code, name, description, toBeAssessed } = req.body;
  let updateCourseResponse, course, updateProgramCourseResponse, programCourse;
  try {
    programCourse = db.programCourse.findOne({where: {id}});
    if (!programCourse) { res.status(400).send(ErrorMessageService.clientError(`Program Course ID: ${id} not found.`)); return; }
    else {
      updateCourseResponse = await courseUpdate(programCourse.id, name, code);
      updateProgramCourseResponse = await programCourseUpdate(id, programCourse.programId, programCourse.courseId, (JSON.parse(toBeAssessed) === true)? true : false);
    }
    if (!updateCourseResponse || !updateProgramCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Proccess Error.`)); return; }
    const result = {
      programCourse: updateProgramCourseResponse,
      course: updateCourseResponse
    };
    res.status(200).send(result);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteCourse = async (req, res, next) => {
  const { id } = req.params;
  let deleteProgramCourseResponse;
  try {
    deleteProgramCourseResponse = await db.programCourse.delete({where: {id}, individualHooks: true});
    res.status(200).send(deleteProgramCourseResponse);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};


// functions
const courseCreate = (name, code, description) => {
  return new Promise((resolve, reject) => {
    db.course.create({name, code, description}, { individualHooks: true})
    .then(result => {
      resolve(result);
    })
    .catch(e => {
      reject(ErrorMessageService.serverError());
    });
  });
};

const courseUpdate = (id, name, code, description) => {
  return new Promise((resolve, reject) => {
    db.course.update({name, code, description}, { where: {id}, individualHooks: true })
    .then(result => {
      resolve(result);
    })
    .catch(e => {
      reject(ErrorMessageService.serverError());
    });
  });
}

const programCourseCreate = (programId, courseId, toBeAssessed, description) => {
  return new Promise((resolve, reject) => {
    db.programCourse.create({programId, courseId, toBeAssessed, description}, { individualHooks: true })
    .then(result => {
      resolve(result);
    })
    .catch(e => {
      reject(ErrorMessageService.serverError());
    });
  });
};

const programCourseUpdate = (id, programId, courseId, toBeAssessed, description) => {
  return new Promise((resolve, reject) => {
    db.programCourse.update({id, programId, courseId, toBeAssessed, description})
    .then(result => {
      resolve(result);
    })
    .catch(e => {
      reject(ErrorMessageService.serverError());
    });
  });
};
