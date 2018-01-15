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
