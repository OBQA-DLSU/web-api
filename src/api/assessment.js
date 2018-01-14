const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');
const { Op } = require('sequelize');
const AssessmentHelper = require('../helpers/assessment.helper');
// /all
exports.getAllAssessments = async (req, res, next) => {
  let assessments;
  try {
    assessments = await db.assessment.findAll({
      where:{},
      include: [
        { model: db.program },
        { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
        { model: db.programCourse, include: [{ model: db.course }] },
        { model: db.assessmentDiscussion }
      ]
    });
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.getAssessmentWithFilterObject = async (req, res, next) => {
  const { operator, queryObjectArray } = req.body;
  let result;
  try {
    result = await AssessmentHelper.getAssessmentWithFilterObjectHelper(operator, queryObjectArray);
    if (result.err) {
      res.status(400).send(result.err);
    }
    res.status(200).send(result.assessments);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:id
exports.getOneAssessment = async (req, res, next) => {
  const { id } = req.params;
  let assessment;
  try {
    assessment = await db.assessment.findOne({
      where: {id},
      include: [
        { model: db.program },
        { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
        { model: db.programCourse, include: [{ model: db.course }] },
        { model: db.assessmentDiscussion }
      ]
    });
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
    if (!updatedAssessment) { res.status(400).send(ErrorMessageService.clientError(`Assessment ID: ${id} was not updated.`)); return; }
    res.status(200).send(updatedAssessment);
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
    if (deletedAssessment === 0) { res.status(400).send(ErrorMessageService.clientError(`Assessment with ID: ${id} does not exists.`)); return; }
    res.status(200).send({id:id} );
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
    assessments = await db.assessment.findAll({
      where: {programId},
      include: [
        { model: db.program },
        { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
        { model: db.programCourse, include: [{ model: db.course }] }
      ],
      raw: true
    });
    res.status(200).send(assessments);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createAssessment = async (req, res, next) => {
  let createdAssessment, checkProgram;
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
    programSopiId,
    programCourseId
  } = req.body;
  try {
    checkProgram = await db.program.findOne({ where: {id: programId} });
    if (!checkProgram) { res.status(400).send(ErrorMessageService.clientError(`Program with ID: ${programId} is not existing.`)); return; }
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
exports.bulkCreateAssessment = async (req, res, next) => {
  const { programId } = req.params;
  const jsonData = req.payload;
  let success = [], error = [];
  try {
    if (!jsonData || jsonData.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Invalid or corrupted file.`)); return; }
    const result = await Promise.all(jsonData.map( async(data) => {
      try {
        let newData, insertedData;
        newData = await assessmentInputConverter(programId, data);
        const {
          assessmentLevel,
          target,
          assessmentTask,
          passingGrade,
          performance,
          improvementPlan,
          term,
          academicYear,
          cycle,
          programSopiId,
          programCourseId
        } = newData;
        insertedData = await createAssessmentFunction(
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
        if (!insertedData) { error.push({errorMessage: ErrorMessageService.clientError}); return; }
        success.push(insertedData);
      }
      catch (e) {
        error.push(e);
      }
    }));
    res.status(200).send({success, error});
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
  // create assessment
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
    let newAssessment, populatedAssessment, checkAssessment;
    try {
      checkAssessment = await db.assessment.findOne({
        where: {
          term, academicYear, cycle, programId, programSopiId, programCourseId
        },
        include: [
          { model: db.program },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
          { model: db.programCourse, include: [{ model: db.course }] },
          { model: db.assessmentDiscussion }
        ]
      });
      if (!checkAssessment) {
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
        populatedAssessment = await db.assessment.findOne({
          where: {id: newAssessment.id},
          include: [
            { model: db.program },
            { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
            { model: db.programCourse, include: [{ model: db.course }] },
            { model: db.assessmentDiscussion }
          ]
        });
      } else {
        populatedAssessment = checkAssessment;
      }
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
      populatedAssessment = await db.assessment.findOne({
        where: {id: updateAssessment[1][0].id},
        include: [
          { model: db.program },
          { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
          { model: db.programCourse, include: [{ model: db.course }] }
        ],
        raw: true
      });
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
    case 'ASSESSMENTLEVEL': queryObject = { assessmentLevel: filterValue }; break;
    case 'ASSESSMENTTASK': queryObject = { assessmentTask: filterValue }; break;
    case 'TARGETGREATERTHAN': queryObject = { target: { [Op.gt]: JSON.parse(filterValue) } }; break;
    case 'TARGETLESSTHAN': queryObject = { target: { [Op.lt]: JSON.parse(filterValue) } }; break;
    case 'PASSINGGRADEGREATERTHAN': queryObject = { passingGrade: { [Op.gt]: JSON.parse(filterValue)} }; break;
    case 'PASSINGGRADELESSTHAN': queryObject = { passingGrade: { [Op.lt]: JSON.parse(filterValue)} }; break;
    case 'PERFORMANCEGREATERTHAN': queryObject = { performance: { [Op.lt]: JSON.parse(filterValue)} }; break;
    case 'PERFORMANCELESSTHAN': queryObject = { performance: { [Op.lt]: JSON.parse(filterValue)} }; break;
    case 'TERM': queryObject = { term: filterValue }; break;
    case 'ACADEMICYEAR': queryObject = { academicYear: filterValue }; break;
    case 'CYCLE': queryObject = { cycle: filterValue }; break;
    case 'PROGRAMID': queryObject = { programId: filterValue }; break;
    case 'PROGRAMSOPIID': queryObject = { programSopiId: filterValue }; break;
    case 'PROGRAMCOURSEID': queryObject = { programCourseId: filterValue }; break;
    default: queryObject = null;
  }
  return queryObject;
};

const getFilteredProgramAssessmentsFunction = (programId, filterName, filterValue) => {
  return new Promise(async(resolve, reject) => {
    let assessments;
    const queryObject = getQueryFilterFunction(filterName, filterValue);
    if (!queryObject) { resolve([]); return; }
    try {
      assessments = await db.assessment.findAll({ where: {
        [Op.and]: {
          programId,
          ...queryObject
        }
      },
      include: [
        { model: db.program },
        { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
        { model: db.programCourse, include: [{ model: db.course }] },
        { model: db.assessmentDiscussion }
      ]
    });
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
    if (!queryObject) { resolve([]); return; }
    try {
      assessments = await db.assessment.findAll({ where: {
        ...queryObject
      },
      include: [
        { model: db.program },
        { model: db.programSopi, include: [{ model: db.sopi, include: [{model: db.so}]}] },
        { model: db.programCourse, include: [{ model: db.course }] },
        { model: db.assessmentDiscussion }
      ]
    });
      resolve(assessments);
    }
    catch (e) {
      reject(e);
    }
  });
};

const assessmentInputConverter = (programId, data) => {
  return new Promise(async (resolve, reject) => {
    let sopi, programSopi, course, programCourse;
    try {
      sopi = await db.sopi.findOne({ where: {code: data['SOPI'] }});
      if (!sopi) { reject({errorMessage: ErrorMessageService.clientError(`Sopi with code ${data['SOPI']} does not exist.`)}); return; }
      programSopi = await db.programSopi.findOne({ where: { sopiId: sopi.id, programId }});
      if (!programSopi) { reject({errorMessage: ErrorMessageService.clientError(`Program SOPI with sopiCode ${data['SOPI']} does not exist.`)}); return; }
      course = await db.course.findOne({ where: {code: data['COURSE']} });
      if (!course) { reject({errorMessage: ErrorMessageService.clientError(`Course with code ${data['COURSE']} does not exist`)}); return; }
      programCourse = await db.programCourse.findOne({ where: {courseId: course.id, programId}});
      if (!programCourse) { reject({errorMessage: ErrorMessageService.clientError(`ProgramCourse with courseCode: ${data['COURSE']} does not exist.`)}); return; }
      const newData = {
        programSopiId: programSopi.id,
        programCourseId: programCourse.id,
        term: data['TERM'],
        academicYear: data['ACADEMIC YEAR'],
        cycle: data['CYCLE'],
        assessmentTask: data['ASSESSMENT TASK'],
        assessmentLevel: data['ASSESSMENT LEVEL'],
        target: data['TARGET'],
        improvementPlan: data['IMPROVEMENT PLAN'] || null,
        passingGrade: data['PASSING GRADE'],
        performance: null,
      };
      resolve(newData);
    }
    catch (e) {
      reject({errorMessage: e});
    }
  });
};
