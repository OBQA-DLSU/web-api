const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /programMyClass/:id
exports.getOneMyClass = async (req, res, next) => {
  const { id } = req.params;
  let myClass;
  try {
    myClass = await db.myClass.findOne({ where: {id}, include: [{all: true}]});
    if (!myClass) { res.status(400).send(ErrorMessageService.clientError(`MyClass ID: ${id} is not existing.`)); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateMyClass = async (req, res, next) => {
  const { id } = req.params;
  const { term, academicYear, programId, programCourseId, instructorId } = req.body;
  let myClass;
  try {
    myClass = await updateMyClass(id, term, academicYear, programId, programCourseId);
    if (!myClass) { res.status(400).send(ErrorMessageService.clientError(`Invalid Input`)); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteMyClass = async (req, res, next) => {
  const { id } = req.params;
  let myClass;
  try {
    myClass = await deleteMyClass(id);
    res.status(200).send({message: `Class ID: ${id} was successfully deleted.`});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:programId
exports.getMyClass = async (req, res, next) => {
  const { programId } = req.params;
  let myClasses;
  try {
    myClasses = await db.myClass.findAll({where: {programId}, include: [{all: true}]});
    if (!myClasses) { res.status(400).send(ErrorMessageService.clientError('Invalid Program ID.')); return; }
    res.status(200).send(myClasses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createMyClass = async (req, res, next) => {
  const { programId } = req.params;
  const { term, academicYear, programCourseId, instructorId } = req.body;
  let myClass;
  try {
    myClass = await createMyClass(term, academicYear, programId, programCourseId, instructorId);
    if (myClass) { res.status(400).send(ErrorMessageService.clientError('Invalid Input.')); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /filteredByProgramId/:programId/:filterName/:filterValue
exports.getMyClassPerProgramFiltered = async (req, res, next) => {
  const { programId, filterName, filterValue } = req.params;
  let myClasses;
  try {
    myClasses = await getFilteredMyClassPerProgram(programId, filterName, filterValue);
    if (!myClasses) { res.status(400).send(ErrorMessageService.clientError(`Cannot find Classes for Program ID: ${programId}.`)); return; }
    res.status(200).send(myClasses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:filterName/:filterValue
exports.getMyClassFiltered = async (req, res, next) => {
  const { filterName, filterValue } = req.params;
  let myClasses;
  try {
    myClasses = await getFilteredMyClass(filterName, filterValue);
    if (!myClasses) { res.status(400).send('Cannot find classes on specified filters.'); return; }
    res.status(200).send(myClasses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /all!!!
exports.getAllMyClass = async (req, res, next) => {
  let myClasses;
  try {
    myClasses = await db.myClass.findAll({include: [{all: true}]});
    if (!myClasses) { res.status(400).send(ErrorMessageService.clientError('Cannot find Classes.')); return; }
    res.status(200).send(myClasses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /bulk/:programId
exports.bulkCreateMyClass = async (req, res, next) => {
  const { programId } = req.params;
  if (!req.payload) { res.status(400).send(ErrorMessageService.clientError('Invalid JSON data.')); return; }
  let jsonData, err = [], success =[];
  try {
    jsonData = req.payload;
    if (!jsonData || jsonData.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Invalid JSON data`)); return; }
    const result = await Promise.all( jsonData.map( async (data) => {
      let course, programCourse, instructor, myClass;
      try {
        course = await db.course.findOne({where: {code: data['SOPI']}});
        if (!course) { err.push(ErrorMessageService.clientError('Course not found.')); }
        programCourse = await db.programCourse.findOne({where: {programId, courseId: course.id}});
        if (!programCourse) { err.push(ErrorMessageService.clientError('ProgramCourse not found')); return; }
        instructor = await db.user.findOne({where: {fname: data['INSTRUCTOR FIRSTNAME'], lname: data['INSTRUCTOR LASTNAME']}});
        if (!instructor) { err.push(ErrorMessageService.clientError(`Instructor not found.`)); return; }
        const newData = {
          term: data['TERM'],
          academicYear: data['ACADEMIC YEAR'],
          programCourseId: programCourse.id,
          programId: programId,
          instructorId: instructor.id
        };
        const { term, academicYear, programCourseId, programId, instructorId } = newData;
        myClass = await createMyClass(term, academicYear, programId, programCourseId, instructorId);
        if (!myClass) { err.push(ErrorMessageService.clientError(`Failed to create new MyClass.`)); return; }
        success.push(myClass);
      }
      catch (e) {
        err.push(ErrorMessageService.serverError());
      }
      res.status(200).send(success, err);
    }));
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.bulkUpdateMyClass = (req, res, next) => {
  res.status(200).send({ message: 'This feature is not yet available.'});
};

exports.bulkDeleteMyClass = (req, res, next) => {
  res.status(200).send({ message: 'This feature is not yet available.'});
}

// functions
const createMyClass = (term, academicYear, programId, programCourseId, instructorId) => {
  return new Promise((resolve, reject) => {
    db.myClass.findOne({where: {term, academicYear, programId, programCourseId, instructorId}, include: [{all: true}]})
    .then(result => {
      if (result) {
        resolve(result);
      } else {
        db.myClass.create({term, academicYear, programId, programCourseId, instructorId}, { individualHooks: true })
        .then(myClass => {
          db.myClass.findOne({where: {id: myClass.id}, include: [{all: true}]})
          .then( data => {
            resolve(data);
          })
          .catch(err => {
            reject(err);
          });
        })
        .catch(err => {
          reject(err);
        });
      }
    })
    .catch(err => {
      reject(err);
    });
  });
};

const updateMyClass = (id, term, academicYear, programId, programCourseId, instructorId) => {
  return new Promise((resolve, reject) => {
    db.myClass.update({term, academicYear, programId, programCourseId, instructorId}, {where:{id}, individualHooks: true})
    .then(result => {
      db.myClass.findOne({where: {id: result.id}, include: [{ all: true }]})
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject(err);
      })
    })
    .catch(err => {
      reject(err);
    });
  });
};

const getOneMyClass = (id) => {
  return new Promise((resolve, reject) => {
    db.myClass.findOne({where: {id}, include: [{all: true}]})
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      reject(err);
    });
  });
};

const getFilteredMyClassPerProgram = (programId, filterName, filterValue) => {
  let filter;
  switch (filterName.toUpperCase()) {
    case 'TERM': filter = { term: filterValue, programId };
    case 'ACADEMICYEAR': filter = { academicYear: filterValue, programId };
    case 'PROGRAMCOURSEID': filter = { programCourseId: filterValue, programId };
    case 'INSTRUCTORID': filter = { instructorId: filterValue, programId };
    default: filter = { id: filterValue };
  }
  return new Promise((resolve, reject) => {
    db.myClass.findAll({where: filter, include: [{all: true}]})
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      reject(err);
    });
  });
};

const getFilteredMyClass = (filterName, filterValue) => {
  let filter;
  switch (filterName.toUpperCase()) {
    case 'ID': filter = { id: filterValue };
    case 'TERM': filter = { term: filterValue };
    case 'ACADEMICYEAR': filter = { academicYear: filterValue };
    case 'PROGRAMID': filter = { programId: filterValue };
    case 'PROGRAMCOURSEID': filter = { programCourseId: filterValue };
    case 'INSTRUCTORID': filter = { instructorId: filterValue };
    default: filter = { id: filterValue };
  }
  return new Promise((resolve, reject) => {
    db.myClass.findAll({where: filter, include: [{all: true}]})
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      reject(err);
    });
  });
};

const deleteMyClass = (id) => {
  return new Promise((resolve, reject) => {
    db.myClass.destroy({where: {id}, individualHooks: true})
    .then(result => {
      resolev(result);
    })
    .catch(err => {
      reject(err);
    });
  });
};