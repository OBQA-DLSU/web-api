const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');
const { Op } = require('sequelize');

// /all
exports.getAllAssessments = async (req, res, next) => {
  let assessments;
  try {
    assessments = await db.assessment.findAll({where:{}, include: [{ all: true }]});
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:id
exports.getOneAssessment = async (req, res, next) => {
  const { id } = req.params;
  let assessment;
  try {
    assessment = await db.assessment.findOne({where: {id}, include: [{ all: true }]});
    if (!assessment) { res.status(400).send(ErrorMessageService.clientError(`Assessment ID: ${id} is not existing.`)); return; }
    res.status(200).send(assessment);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  } 
};

exports.updateAssessment = async (req, res, next) => {
  let updatedAssessment;
  const { id } = req.params;
  const { 
    assessmentLevel,
    assessmentTask,
    target,
    passingGrade,
    performance,
    improvementPlan,
    term,
    academicYear,
    cycle,
    programId,
    programSopiId,
    programCourseId } = req.body;

  try {
    updatedAssessment = await updateAssessmentFunction(
      id,
      assessmentLevel,
      assessmentTask,
      target,
      passingGrade,
      performance,
      improvementPlan,
      term,
      academicYear,
      cycle,
      programId,
      programSopiId,
      programCourseId
    );
    if (!updateAssessment) { res.status(400).send(ErrorMessageService.clientError(`Assessment ID: ${id} was not updated.`)); return; }
    res.status(200).send(updateAssessment);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteAssessment = async (req, res, next) => {
  const { id } = req.params;
  let deletedAssessment;
  try {
    deletedAssessment = await db.assessment.destroy({where: {id}, individualHooks: true, returning: true });
    res.status(200).send(deletedAssessment);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /programAssessment/:programId

exports.getProgramAssessments = async (req, res, next) => {
  const { programId } = req.params;
  let assessments;
  try {
    assessments = await db.assessment.findAll({ where: {id}, include: [ { all: true } ]});
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createAssessment = async (req, res, next) => {
  let createdAssessment;
  const { programId } = req.params;
  const { 
    assessmentLevel,
    assessmentTask,
    target,
    passingGrade,
    performance,
    improvementPlan,
    term,
    academicYear,
    cycle,
    programId,
    programSopiId,
    programCourseId
  } = req.body;
  try {
    createdAssessment = await createAssessmentFunction(
      assessmentLevel,
      assessmentTask,
      target,
      passingGrade,
      performance,
      improvementPlan,
      term,
      academicYear,
      cycle,
      programId,
      programSopiId,
      programCourseId
    );
    if (!createdAssessment) { res.status(400).send(ErrorMessageService.clientError(`Invalid Inputs.`)); return; }
    res.status(200).send(createdAssessment);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /filteredByProgramId/:programId/:filterName/:filterValue

exports.getFilteredProgramAssessments = async (req, res, next) => {
  const { programId, filterName, filterValue } = req.params;
  let assessments;
  try {
    assessments = await getFilteredProgramAssessmentsFunction(programId, filterName, filterValue);
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:filterName/:filterValue

exports.getFilteredAssessments = async (req, res, next) => {
  const { programId, filterName, filterValue } = req.params;
  let assessments;
  try {
    assessments = await getFilteredAssessmentsFunction(filterName, filterValue);
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /bulk/:programId
exports.bulkCreateAssessment = (req, res, next) => {
  res.status(200).send({ message: 'This function is not yet available. '});
};

exports.bulkUpdateAssessment = (req, res, next) => {
  res.status(200).send({ message: 'This function is not yet available. '});
};

exports.bulkDeleteAssessment = (req, res, next) => {
  res.status(200).send({ message: 'This function is not yet available. '});
};

// functions
const createAssessmentFunction = (
  assessmentLevel,
  assessmentTask,
  target,
  passingGrade,
  performance,
  improvementPlan,
  term,
  academicYear,
  cycle,
  programId,
  programSopiId,
  programCourseId
) => {
  return new Promise(async(resolve, reject) => {
    let newAssessment, populatedAssessment;
    try {
      newAssessment = await db.assessment.create({
        assessmentLevel,
        assessmentTask,
        target,
        passingGrade,
        performance,
        improvementPlan,
        term,
        academicYear,
        cycle,
        programId,
        programSopiId,
        programCourseId
      });
      if (!newAssessment) { resolve(null); return; }
      populatedAssessment = await db.assessment.findOne({where: {id: newAssessment.id}, include: [{ all:true }]});
      resolve(populatedAssessment);
    }
    catch (e) {
      reject(e);
    }
  });
};

const updateAssessmentFunction = (
  id,
  assessmentLevel,
  assessmentTask,
  target,
  passingGrade,
  performance,
  improvementPlan,
  term,
  academicYear,
  cycle,
  programId,
  programSopiId,
  programCourseId
) => {
  return new Promise(async(resolve, reject) => {
    let updatedAssessment, populatedAssessment;
    try {
      updateAssessment = await db.assessment.update({
        assessmentLevel,
        assessmentTask,
        target,
        passingGrade,
        performance,
        improvementPlan,
        term,
        academicYear,
        cycle,
        programId,
        programSopiId,
        programCourseId
      }, { where: {id}, individualHooks: true, returning: true });
      if (!updateAssessment && !updateAssessment[1][0]) { resolve(null); return; }
      populatedAssessment = await db.assessment.findOne({where: {id: updateAssessment[1][0].id}, include: [{ all: true }]});
      resolve(populatedAssessment);
    }
    catch (e) {
      reject(e);
    }
  });
};

const getQueryFilterFunction = (filterName, filterValue) => {
  let queryObject;
  switch (filterName.toUpperCase()) {
    case 'ASSESSMENTLEVEL': queryObject = { assessmentLevel: filterValue };
    case 'ASSESSMENTTASK': queryObject = { assessmentTask: filterValue };
    case 'TARGETGREATERTHAN': queryObject = { target: { [Op.gt]: JSON.parse(filterValue) } };
    case 'TARGETLESSTHAN': queryObject = { target: { [Op.lt]: JSON.parse(filterValue) } };
    case 'PASSINGGRADEGREATERTHAN': queryObject = { passingGrade: { [Op.gt]: JSON.parse(filterValue)} };
    case 'PASSINGGRADELESSTHAN': queryObject = { passingGrade: { [Op.lt]: JSON.parse(filterValue)} };
    case 'PERFORMANCEGREATERTHAN': queryObject = { performance: { [Op.lt]: JSON.parse(filterValue)} };
    case 'PERFORMANCELESSTHAN': queryObject = { performance: { [Op.lt]: JSON.parse(filterValue)} };
    case 'TERM': queryObject = { term: filterValue };
    case 'ACADEMICYEAR': queryObject = { academicYear: filterValue };
    case 'CYCLE': queryObject = { cycle: filterValue };
    case 'PROGRAMID': queryObject = { programId: filterValue };
    case 'PROGRAMSOPIID': queryObject = { programSopiId: filterValue };
    case 'PROGRAMCOURSEID': queryObject = { programCourseId: filterValue };
    default: queryObject = null;
  }
  return queryObject;
};

const getFilteredProgramAssessmentsFunction = (programId, filterName, filterValue) => {
  return new Promise(async(resolve, reject) => {
    let assessments;
    const queryObject = getQueryFilterFunction(filterName, filterValue);
    if (!queryObject) { resolve(null); return; }
    try {
      assessments = await db.assessment.findAll({ where: {
        [Op.and]: {
          programId,
          ...queryObject
        }
      }, include: [{ all: true }] });
      resolve(assessments);
    }
    catch (e) {
      reject(e);
    }
  });
};

const getFilteredAssessmentsFunction = (filterName, filterValue) => {
  return new Promise(async(resolve, reject) => {
    let assessments;
    const queryObject = getQueryFilterFunction(filterName, filterValue);
    if (!queryObject) { resolve(null); return; }
    try {
      assessments = await db.assessment.findAll({ where: {
        ...queryObject
      }, include: [{ all: true }] });
      resolve(assessments);
    }
    catch (e) {
      reject(e);
    }
  });
};

