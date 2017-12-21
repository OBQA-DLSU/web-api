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
    assessmentId,
    myClassId
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
      assessmentId,
      myClassId
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


// /all


//  /:filterName/:filterValue



// module.exports = (sequelize, DataTypes) => {
//   const grade = sequelize.define('grade', {
//     grade: { type: DataTypes.DOUBLE, allowNull: false, validate: { max: 1 } },
//     term: { type: DataTypes.INTEGER, allowNull: false },
//     cycle: { type: DataTypes.INTEGER, allowNull: false },
//     academicYear: { type: DataTypes.STRING, allowNull: false, validate: { len: [9] } }
//   });

//   grade.associate = models => {
//     grade.belongsTo(models.student);
//     grade.belongsTo(models.instructor);
//     grade.belongsTo(models.programCourse);
//     grade.belongsTo(models.programSopi);
//     grade.belongsTo(models.assessment);
//   }

//   return grade;
// };

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
  assessmentId,
  myClassId
) => {
  return new Promise(async(resolve, reject) => {
    let newGrade;
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
        assessmentId,
        myClassId
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
              assessmentId,
              myClassId
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
  assessmentId,
  myClassId
) => {
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
        assessmentId,
        myClassId
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
              assessmentId,
              myClassId
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
