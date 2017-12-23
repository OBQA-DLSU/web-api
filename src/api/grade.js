const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /:id
exports.getOneGrade = async (req, res, next) => {
  const { id } = req.params;
  let gradeData;
  try {
    gradeData = await db.grade.findOne({ where: {id}, include: [{ all: true }] });
    if (!gradeData) { res.status(400).send(ErrorMessageService.clientError(`Data for grade ID: ${id} was not found.`)); return; }
    res.status(200).send(gradeData);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateGrade = async (req, res, next) => {
  const { id } = req.params;
  const { 
    grade,
    term,
    cycle,
    academicYear,
    studentId,
    instructorId,
    programCourseId,
    programSopiId,
    myClassId,
    assessmentId
   } = req.body;
  let updatedGrade;
  try {
    updatedGrade = await updateGradeFunction(
      id,
      grade,
      term,
      cycle,
      academicYear,
      studentId,
      instructorId,
      programCourseId,
      programSopiId,
      myClassId,
      assessmentId
    );
    if (!updatedGrade) { res.status(400).send(ErrorMessageService.clientError(`Was not able to update grade ID: ${id}`)); return; }
    res.status(200).send(updatedGrade);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteGrade = async (req, res, next) => {
  const { id } = req.params;
  let deletedGrade;
  try {
    deletedGrade = await db.grade.destroy({ where: {id}, individualHooks: true, returning: true });
    res.status(200).send(deletedGrade);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /myClass/:myClassId
exports.getMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  let gradeData;
  try {
    gradeData = await db.grade.findAll({ 
      where: {myClassId},
      include: [
        { model: db.programSopi, include: [ {model: db.sopi}]},
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.student, include: [{ model: db.user, attributes: ['id', 'lname', 'fname', 'email'] }] },
        { model: db.assessment, include: [{ all: true }]}
      ]
    });
    res.status(200).send(gradeData);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  const { myClassGradeData } = req.body; // this must be an array of gradeData.
  let updateMyClassGradesResult;
  try {
    updateMyClassGradesResult = await updateMyClassGradesArrayFunction(myClassId, myClassGradeData);
    res.status(200).send(updateMyClassGradesResult);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }

};

exports.createMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  const { myClassGradeData } = req.body; // this must be an array of gradeData.
  let myClassInputResult;
  try {
    myClassInputResult = await createGradeArrayFunction(myClassId, myClassGradeData);
    res.status(200).send(myClassInputResult);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /bulk/:myClassId
exports.createBulkMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  let myClassInputResult, createdGrades;
  try {
    jsonData = req.payload;
    myClassInputResult = await gradeXlsxHeaderReaderHelper(myClassId, jsonData);
    createdGrades = await createGradeArrayFunction(myClassId, myClassInputResult);
    res.status(200).send(createdGrades);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateBulkMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  res.status(200).send({message: 'This feature is not yet available.'});
};

exports.deleteBulkMyClassGrades = async (req, res, next) => {
  const { myClassId } = req.params;
  res.status(200).send({message: 'This feature is not yet available.'});
};

// /all
exports.getAllGrades = async (req, res, next) => {
  let gradeData;
  try {
    gradeData = await db.grade.findAll({
      include: [
        { model: db.programSopi, include: [ {model: db.sopi}]},
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.student, include: [{ model: db.user, attributes: ['id', 'lname', 'fname', 'email'] }] },
        { model: db.assessment, include: [{ all: true }]}
      ]
    });
    res.status(200).send(gradeData);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

//  /:filterName/:filterValue

exports.getFilteredGrades = async (req, res, next) => {
  const { filterName, filterValue } = req.params;
  const queryObject = gradeFilterHelper(filterName, filterValue);
  let gradeData;
  try {
    gradeData = await db.grade.findAll({ where: queryObject,
      include: [
        { model: db.programSopi, include: [ {model: db.sopi}]},
        { model: db.programCourse, include: [ {model: db.course} ]},
        { model: db.student, include: [{ model: db.user, attributes: ['id', 'lname', 'fname', 'email'] }] },
        { model: db.assessment, include: [{ all: true }]}
      ]
    });
    res.status(200).send(gradeData);
  }
  catch (e) {
    res.status(200).send(ErrorMessageService.serverError());
  }
};

// functions
const createGradeFunction = (
  grade,
  term,
  cycle,
  academicYear,
  studentId,
  instructorId,
  programCourseId,
  programSopiId,
  myClassId,
  assessmentId ) => {
  return new Promise(async(resolve, reject) => {
    try {
      newGrade = await db.grade.create({
        grade,
        term,
        cycle,
        academicYear,
        studentId,
        instructorId,
        programCourseId,
        programSopiId,
        myClassId,
        assessmentId
      });
      resolve(newGrade);
    }
    catch (e) {
      reject(e);
    }
  });
};

const createGradeArrayFunction = (myClassId, myClassGradeData) => {
  return new Promise(async(req, res) => {
    let success = [], error = [];
    try {
      const myClassGradeData = await myClassGradeData.map(
        async (myClassGrade) => {
          let newGrade;
          const {
            grade,
            term,
            cycle,
            academicYear,
            studentId,
            instructorId,
            programCourseId,
            programSopiId,
            assessmentId
          } = myClassGrade;
          try {
            newGrade = await createGradeFunction(
              grade,
              term,
              cycle,
              academicYear,
              studentId,
              instructorId,
              programCourseId,
              programSopiId,
              myClassId,
              assessmentId
            );
            if (!newGrade) { error.push({ errorMessage: ErrorMessageService.clientError(`Was not able to add new Grade.`) }); return; }
            success.push(newGrade);
          }
          catch (e) {
            error.push({errorMessage: ErrorMessageService.serverError()});
          }
        }
      );
      resolve({ success, error });
    }
   catch (e) {
    reject(e);
   } 
  });
};

const updateGradeFunction = (
  id,
  grade,
  term,
  cycle,
  academicYear,
  studentId,
  instructorId,
  programCourseId,
  programSopiId,
  myClassId,
  assessmentId ) => {
  return new Promise(async(resolve, reject) => {
    let updatedGrade;
    try {
      updatedGrade = await db.grade.update({
        grade,
        term,
        cycle,
        academicYear,
        studentId,
        instructorId,
        programCourseId,
        programSopiId,
        myClassId,
        assessmentId
      }, { where: {id}, individualHooks: true, returning: true });
      
      resolve(updatedGrade[1][0]);
    }
    catch (e) {
      reject(e);
    }
  });
};

const updateMyClassGradesArrayFunction = (myClassId, myClassGradeData) => {
  return new Promise(async(resolve, reject) => {
    let success = [], error = [];
    try {
      const myClassGradeDataProcess = await myClassGradeData.map(
        async (myClassGrade) => {
          let updatedGrade;
          const {
            id,
            grade,
            term,
            cycle,
            academicYear,
            studentId,
            instructorId,
            programCourseId,
            programSopiId,
            assessmentId
          } = myClassGrade;
          try {
            updatedGrade = await updateGradeFunction(
              id,
              grade,
              term,
              cycle,
              academicYear,
              studentId,
              instructorId,
              programCourseId,
              programSopiId,
              myClassId,
              assessmentId
            );
            if (!updatedGrade) { error.push({ errorMessage: ErrorMessageService.clientError(`Grade ID: ${id} was not updated.`) }); return; }
            success.push(updatedGrade);
          }
          catch (e) {
            error.push({ errorMessage: ErrorMessageService.serverError() });
          }
        }
      );
      resolve({ success, error });
    }
    catch (e) {
      reject(e);
    }
  });
}

const gradeXlsxHeaderReaderHelper = (myClassId, data) => {
  return new Promise(async(resolve, reject) => {
    let result = [], myClass, instructorId, programCourseId, assessmentId, assessments;
    try {
      // getting myClass Details
      myClass = await db.myClass.findOne({ where: {id: myClassId},
        include: [
          { model: assessment, include: [
            { model: programSopi , include: [
              { model: sopi }
            ]}
          ]}
        ]
      });
      assessments = myClass.assessment;
      // loop tru each data.
      const dataLoop = data.map( async(d) => {
        let student, userFinder, user, studentFinder, myClassStudentFinder, myClassStudent;
        try {
          userFinder = await db.user.findOne({
            where: { idNumber: d['ID NUMBER'] }
          });
          if (!userFinder) {
            user = await db.user.create({idNumber: d['ID NUMBER'], lname: d['STUDENT LASTNAME'], fname: d['STUDENT FIRSTNAME']});
            student = await db.student.create({userId: user.id, programId: myClass.programId});
            myClassStudent = await db.myClassStudent.create({ studentId: student.id, myClassId: myClass.id });
          } else {
            user = userFinder;
            studentFinder = await db.student.findOne({where: {userId: user.id, programId: myClass.programId}});
            if (!studentFinder) {
              student = await db.student.create({userId: user.id, programId: myClass.programId});
              myClassStudent = await db.myClassStudent.create({ studentId: student.id, myClassId: myClass.id });
            } else {
              student = studentFinder;
              myClassStudentFinder = await db.myClassStudent.findOne({where: {myClassId: myClass.id, studentId: student.id}});
              if (!myClassStudentFinder) {
                myClassStudent = await db.myClassStudent.create({ studentId: student.id, myClassId: myClass.id });
              } else {
                myClass = myClassStudentFinder;
              }
            }
          }
          // loop tru each assessments.
          assessment.forEach((v, i, a) => {
            let newObject = {
              grade: d[v.programSopi.sopi.code],
              term: v.term,
              cycle: v.cycle,
              academicYear: v.academicYear,
              studentId: student.id,
              instructorId: myClass.instructorId,
              programCourseId: v.programCourseId,
              programSopiId: v.programSopiId,
              myClassId: myClass.id,
              assessmentId: v.id
            }
            result.push(newObject);
          });
        }
        catch (e) {
          return;
        }
      })
      resolve(result);
    }
    catch (e) {
      reject(e);
    }
  });
};

const gradeFilterHelper = (filterName, filterValue) => {
  switch (filterName.toUpperCase()) {
    case 'TERM': return { term: filterValue };
    case 'ASSESSMENTID': return { assessmentId: filterValue };
    case 'CYCLE': return { cycle: filterValue };
    case 'ACADEMICYEAR': return { academicYear: filterValue };
    case 'STUDENTID': return { studentId: filterValue };
    case 'PROGRAMCOURSEID': return { programCourseId: filterValue };
    case 'PROGRAMSOPIID': return { programSopiId: filterValue };
    case 'MYCLASSID': return { myClassId: filterValue };
    default: return { '*': filterValue };
  } 
};
