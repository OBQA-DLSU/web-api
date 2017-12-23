const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /programMyClass/:id
exports.getOneMyClass = async (req, res, next) => {
  const { id } = req.params;
  let myClass;
  try {
    myClass = await db.myClass.findOne({
      where: {id},
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    });
    if (!myClass) { res.status(400).send(ErrorMessageService.clientError(`MyClass ID: ${id} is not existing.`)); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateMyClass = async (req, res, next) => {
  const { id } = req.params;
  const { term, academicYear, cycle, programId, programCourseId, instructorId } = req.body;
  let myClass;
  try {
    myClass = await updateMyClass(id, term, academicYear, cycle, programId, programCourseId);
    if (!myClass) { res.status(400).send(ErrorMessageService.clientError(`Invalid Input`)); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteMyClass = async (req, res, next) => {
  const { id } = req.params;
  let myClass;
  try {
    myClass = await deleteMyClass(id);
    if (myClass === 0) {
      res.status(400).send(ErrorMessageService.clientError(`MyClass ID: ${id} is not existing.`));
      return;
    } else {
      res.status(200).send({message: `Class ID: ${id} was successfully deleted.`});
    }
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
    myClasses = await db.myClass.findAll({
      where: { programId },
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    });
    if (myClasses.length === 0) { res.status(400).send(ErrorMessageService.clientError(`There is no classes yet for Program ID: ${programId}`)); return; }
    res.status(200).send(myClasses);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createMyClass = async (req, res, next) => {
  const { programId } = req.params;
  const { term, academicYear, cycle, programCourseId, instructorId } = req.body;
  let myClass;
  try {
    myClass = await createMyClass(term, academicYear, cycle, programId, programCourseId, instructorId);
    if (!myClass) { res.status(400).send(ErrorMessageService.clientError('Invalid Input.')); return; }
    res.status(200).send(myClass);
  }
  catch (e) {
    console.log(e);
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
    myClasses = await db.myClass.findAll({
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    });
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
  console.log(req.payload);
  let jsonData, error = [], success =[];
  try {
    jsonData = req.payload;
    if (!jsonData || jsonData.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Invalid JSON data`)); return; }
    const result = await Promise.all( jsonData.map( async (data) => {
      let course, programCourse, instructor, myClass, user;
      try {
        course = await db.course.findOne({where: {code: data['COURSE']}});
        if (!course) { err.push(ErrorMessageService.clientError('Course not found.')); }
        programCourse = await db.programCourse.findOne({where: {programId, courseId: course.id}});
        if (!programCourse) { err.push(ErrorMessageService.clientError('ProgramCourse not found')); return; }
        user = await db.user.findOne({where: {fname: data['FIRSTNAME OF INSTRUCTOR'], lname: data['LASTNAME OF INSTRUCTOR']}, include: [db.instructor]});
        console.log(user);
        if (!user) { err.push(ErrorMessageService.clientError(`User ${data['FIRSTNAME OF INSTRUCTOR']} not found`)); return; }
        instructor = await db.instructor.findOne({where: {userId: user.id}});
        if (!instructor) { err.push(ErrorMessageService.clientError(`Instructor not found.`)); return; }
        
        const newData = {
          term: parseInt(data['TERM']),
          academicYear: data['ACADEMIC YEAR'],
          cycle: parseInt(data['CYCLE']),
          programCourseId: programCourse.id,
          instructorId: instructor.id
        };
        const { term, academicYear, cycle, programCourseId, instructorId } = newData;
        myClass = await createMyClass(term, academicYear, cycle, programId, programCourseId, instructorId);
        if (!myClass) { err.push(ErrorMessageService.clientError(`Failed to create new MyClass.`)); return; }
        success.push(myClass);
      }
      catch (e) {
        console.log(e);
        err.push(ErrorMessageService.serverError());
      }
    }));
    res.status(200).send({error, success});
  }
  catch (e) {
    console.log(e);
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
const createMyClass = (term, academicYear, cycle, programId, programCourseId, instructorId) => {
  return new Promise((resolve, reject) => {
    db.myClass.findOne({
      where: {term, academicYear, cycle, programId, programCourseId, instructorId},
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    })
    .then(result => {
      if (result) {
        resolve(result);
      } else {
        db.myClass.create({term, academicYear, cycle, programId, programCourseId, instructorId}, { individualHooks: true })
        .then(myClass => {
          db.myClass.findOne({
            where: {id: myClass.id},
            include: [
              { model: db.program },
              { model: db.programCourse, include: [ {model: db.course} ]},
              { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
              { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
              { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
            ]
          })
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

const updateMyClass = (id, term, academicYear, cycle, programId, programCourseId, instructorId) => {
  return new Promise((resolve, reject) => {
    db.myClass.update({term, academicYear, cycle, programId, programCourseId, instructorId}, {where:{id}, returning: true, individualHooks: true})
    .then(result => {
      db.myClass.findOne({
        where: {id: result[1][0].id},
        include: [
          { model: db.program },
          { model: db.programCourse, include: [ {model: db.course} ]},
          { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
          { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
          { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
        ]
      })
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
    db.myClass.findOne({
      where: {id},
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    })
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
      break;
    case 'ACADEMICYEAR': filter = { academicYear: filterValue, programId };
      break;
    case 'PROGRAMCOURSEID': filter = { programCourseId: filterValue, programId };
      break;
    case 'INSTRUCTORID': filter = { instructorId: filterValue, programId };
      break;
    case 'CYCLE': filter = { cycle: filterValue, programId };
      break;
    default: filter = null;
  }
  return new Promise((resolve, reject) => {
    if (!filter) { resolve([]) }
    db.myClass.findAll({
      where: filter,
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    })
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
      break;
    case 'TERM': filter = { term: filterValue };
      break;
    case 'ACADEMICYEAR': filter = { academicYear: filterValue };
      break;
    case 'PROGRAMID': filter = { programId: filterValue };
      break;
    case 'PROGRAMCOURSEID': filter = { programCourseId: filterValue };
      break;
    case 'INSTRUCTORID': filter = { instructorId: filterValue };
      break;
    case 'CYCLE': filter = { cycle: filterValue };
      break;
    default: filter = null;
  }
  return new Promise((resolve, reject) => {
    if (!filter) { resolve([]); }
    db.myClass.findAll({
      where: filter,
      include: [
        { model: db.program },
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.instructor, include: [ { model: db.user, attributes: ['id', 'email', 'lname', 'fname']}]},
        { model: db.myClassAssessment, include: [ { model: db.assessment } ] },
        { model: db.myClassStudent, include: [ { model: db.student, include: [{model: db.user, attributes: ['id', 'idNumber', 'email', 'fname', 'lname']}] } ] }
      ]
    })
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
    db.myClass.destroy({where: {id}, individualHooks: true, returning: true})
    .then(result => {
      resolve(result);
    })
    .catch(err => {
      reject(err);
    });
  });
};