const db = require('../models');
const Op = require('sequelize').Op;
const ErrorMessageService = require('../services/errorMessage.service');

exports.getAssessmentWithFilterObjectHelper = (operator, queryObjectArray) => {
  let op, assessments;
  if (operator && operator.toUpperCase() === 'AND') {
    op = Op.and;
  } else {
    op = Op.or;
  }

  return new Promise(async(resolve, reject) => {
    try {
      assessments = await db.assessment.findAll({
        where: {[op]: queryObjectArray},
        include: [
          { model: db.program },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
          { model: db.programCourse, include: [{ model: db.course }] }
        ],
        raw: true
      });
      if (!assessments) {
        resolve({err: ErrorMessageService.clientError('Invalid query.')});
        return;
      }
      resolve({err: null, assessments});
    }
    catch (e) {
      resolve({err: ErrorMessageService.clientError('Invalid query.')});
    }
  });
};

