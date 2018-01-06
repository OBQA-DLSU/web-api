const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

exports.getCourse = async (req, res, next) => {
  const { programId } = req.params;
  let programCourses;
  try {
    programCourses = await db.programCourse.findAll({ 
      where: { programId },
      include: [
        { model: db.course },
        { model: db.program }
      ] 
    });
    if(!programCourses || programCourses.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Cannot find Course for Program ID: ${programId}`)); return; }
    res.status(200).send(programCourses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.addCourse = async (req, res, next) => {
  const {code, name, description } = req.body;
  const { programId, toBeAssessed } = req.params;
  let addCourseResponse, course, addProgramCourseResponse, programCourse, finalProgramCourse;
  try {
    course = await db.course.findOne({where: {code}});
    if (!course) {
      addCourseResponse = await courseCreate(name, code);
      if(!addCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
    } else {
      addCourseResponse = course;
    }
    programCourse = await db.programCourse.findOne({where: {programId, courseId: addCourseResponse.id}});
    if(!programCourse) {
      addProgramCourseResponse = await programCourseCreate(programId, addCourseResponse.id, toBeAssessed, description);
      if(!addProgramCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
    } else {
      addProgramCourseResponse = programCourse;
    }
    finalProgramCourse = await db.programCourse.findOne({ where: {id: addProgramCourseResponse.id }, include: [{model: db.course}, {model: db.program}]});
    res.status(200).send(finalProgramCourse);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.getToBeAssessedCourse = async (req, res, next) => {
  const { programId, toBeAssessed } = req.params;
  let toBeAssessedCourses;
  try {
    toBeAssessedCourses = await db.programCourse.findAll({
      where: { programId, toBeAssessed },
      include: [
        { model: db.course }, { model: db.program }
      ]
    });
    res.status(200).send(toBeAssessedCourses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.getOneCourse = async (req, res, next) => {
  const { id } = req.params;
  let programCourse;
  try {
    programCourse = await db.programCourse.findOne({ where: { id }, include: [ {model: db.course}, {model: db.program} ]});
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
  let updateCourseResponse, updateProgramCourseResponse, updatedProgramCourse;
  try {
    programCourse = await db.programCourse.findOne({where: {id}});
    if (!programCourse) { res.status(400).send(ErrorMessageService.clientError(`Program Course ID: ${id} not found.`)); return; }
    else {
      updateCourseResponse = await courseUpdate(programCourse.courseId, name, code);
      updateProgramCourseResponse = await programCourseUpdate(id, programCourse.programId, programCourse.courseId, (JSON.parse(toBeAssessed) === true) ? true : false, description);
    }
    if (!updateCourseResponse || !updateProgramCourseResponse) { res.status(400).send(ErrorMessageService.clientError(`Proccess Error.`)); return; }
    updatedProgramCourse = await db.programCourse.find({
      where: {id}, include: [
        {model: db.course},
        {model: db.program}
      ]
    });
    if (!updatedProgramCourse) { res.status(400).send(ErrorMessageService.clientError(`Proccess Error.`)); return; }
    res.status(200).send(updatedProgramCourse);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteCourse = async (req, res, next) => {
  const { id } = req.params;
  let deleteProgramCourseResponse;
  try {
    deleteProgramCourseResponse = await db.programCourse.destroy({where: {id}, individualHooks: true});
    if(deleteProgramCourseResponse > 0) {
      res.status(200).send({id:id});
    } else {
      res.status(400).send(ErrorMessageService.clientError(`Program Course ID: ${id} can't be find.`));
    }
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// bulk transactions
exports.bulkAddCourse = async (req, res, next) => {
  if (!req.payload) { res.status(400).send(ErrorMessageService.clientError('No File Detected')); return; }
  const { programId } = req.params;
  let jsonData, error = [], success =[];
  try {
    jsonData = req.payload;
    if (!jsonData || jsonData.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Invalid file or Unsupported format`)); return; }
    
    const result = await Promise.all( jsonData.map( async (data) => {
      const newData = {
        code: data['CODE'],
        name: data['NAME'],
        description: data['DESCRIPTION'],
        toBeAssessed: (data['TO BE ASSESSED'] && data['TO BE ASSESSED'].toUpperCase() === 'TRUE') ? true : false
      };
      const { code, name, description, toBeAssessed } = newData;
      let addCourseResponse, course, addProgramCourseResponse, programCourse, result;
      try {
        course = await db.course.findOne({where: {code}});
        if (!course) {
          addCourseResponse = await courseCreate(name, code);
          if(!addCourseResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
        } else {
          addCourseResponse = course;
        }
        programCourse = await db.programCourse.findOne({where: {programId, courseId: course.id} });
        if(!programCourse) {
          addProgramCourseResponse = await programCourseCreate(programId, course.id, toBeAssessed, description);
          if(!addProgramCourseResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
        } else {
          addProgramCourseResponse = await programCourseUpdate(programCourse.id, programId, course.id, toBeAssessed, description);
          if(!addProgramCourseResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input...`)); return; }
        }
        success.push(addProgramCourseResponse, addCourseResponse);
      }
      catch (e) {
        err.push(e);
      }
    }));
    res.status(200).send({success, error});
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.bulkUpdateCourse = (req, res, next) => {
  res.status(200).send({message: `This feature is not yet available...`});
};

exports.bulkDeleteCourse = (req, res, next) => {
  res.status(200).send({message: `This feature is not yet available...`});
};

// functions
const courseCreate = (name, code, description) => {
  return new Promise((resolve, reject) => {
    db.course.create({name, code, description}, { individualHooks: true})
    .then(result => {
      resolve(result);
    })
    .catch(e => {
      if (!e) {resolve({message: 'Success'});}
      reject(e);
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
    db.programCourse.update({programId, courseId, toBeAssessed, description}, { where: {id}, returning: true })
    .then(result => {
      db.programCourse.findOne({where: {id: result[1][0].id}})
      .then(data => {
        resolve(data);
      })
    })
    .catch(e => {
      reject(ErrorMessageService.serverError());
    });
  });
};
