const db = require('../models');
const Op = require('sequelize').Op;
const ErrorMessageService = require('../services/errorMessage.service');

exports.getGradeWithQueryObjectHelper = (operator, queryObjectArray) => {
  let op;
  if (operator && operator.toUpperCase() === 'ADD') {
    op = Op.and;
  } else {
    op = Op.or;
  }
  return new Promise(async(resolve, reject) => {
    try {
      grades = await db.grade.findAll({
        where: {[op]: queryObjectArray},
        include: [
          { model: db.student, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.instructor, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{ model: db.so }] }] },
          { model: db.programCourse, include: [{ model: db.course }] },
          { model: db.assessment },
          { model: db.myClass }
        ],
        raw: true
      });
      if (!grades) {
        resolve({err: ErrorMessageService.clientError('Invalid query.')});
        return;
      }
      resolve({err: null, grades});
    }
    catch (e) {
      resolve({err: ErrorMessageService.clientError('Invalid query.')});
    }
  });
};

exports.createUpdateGradeHelper = (
  gradeData, // array that has programSopiId, assessmentId, and grade
  term,
  cycle,
  academicYear,
  studentId,
  instructorId,
  programCourseId,
  myClassId
) => {
  return new Promise(async(resolve, reject) => {
    let result, error = [], success = [];
    try {
      result = await Promise.all(gradeData.map(async(d) => {
        let checkGrade, grade;
        try {
          checkGrade = await db.grade.findOne({where: {term, cycle, academicYear, studentId, instructorId, programCourseId, assessmentId: d.assessmentId, programSopiId: d.programSopiId}});
          if (!checkGrade) {
            newGrade = await createGradeFunction(d.grade, term, cycle, academicYear, studentId, instructorId, programCourseId, d.programSopiId, myClassId, d.assessmentId);
          } else {
            newGrade = await updateGradeFunction(checkGrade.id, d.grade);
          }
          success.push(newGrade);
        }
        catch(e) {
          error.push(e);
        }
      }));
      resolve({error, success});
    }
    catch(e) {
      reject(e);
    }
  });
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
    let newGrade, checkGrade;
    try {
      checkGrade = await db.grade.findOne({ where: {term, cycle, academicYear, studentId, instructorId, programCourseId, programSopiId, assessmentId} });
      if (!checkGrade) {
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
      } else {
        newGrade = null;
      }
      if (!newGrade) {
        resolve(null);
        return;
      }
      const gradeData = await db.grade.findOne({
        where: {id: newGrade.id},
        include: [
          { model: db.student, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.instructor, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{ model: db.so }] }] },
          { model: db.programCourse, include: [{ model: db.course }] },
          { model: db.assessment },
          { model: db.myClass }
        ],
        raw: true
      })
      resolve(gradeData);
    }
    catch (e) {
      reject(e);
    }
  });
};

const updateGradeFunction = (id, grade) => {
  return new Promise(async(resolve, reject) => {
    let updatedGrade;
    try {
      updatedGrade = await db.grade.update({
        grade: grade
      }, { where: {id}, individualHooks: true, returning: true });
      if (!updatedGrade[1][0]) { resolve(null); return; }
      const gradeData = await db.grade.findOne({
        where: {id: updatedGrade[1][0].id},
        include: [
          { model: db.student, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.instructor, include: [{ model: db.user, attributes: ['id','idNumber', 'email', 'lname', 'fname'] }] },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{ model: db.so }] }] },
          { model: db.programCourse, include: [{ model: db.course }] },
          { model: db.assessment },
          { model: db.myClass }
        ],
        raw: true
      });
      resolve(gradeData);
    }
    catch (e) {
      reject(e);
    }
  });
};
