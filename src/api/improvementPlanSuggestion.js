const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /assessment/:assessmentId
exports.getImprovementPlanSuggestion = async (req, res, next) => {
  const { assessmentId } = req.params;
  let suggestions;
  try {
    suggestions = await suggestionsFindAll({assessmentId});
    res.status(200).send(suggestions);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createImprovementPlanSuggestion = async (req, res, next) => {
  const { assessmentId } = req.params;
  const { instructorId, suggestion } = req.body;
  let newSuggestion;
  try {
    newSuggestion = await createSuggestion(instructorId, assessmentId, suggestion);
    if (!newSuggestion) { res.status(400).send(ErrorMessageService.clientError(`Cannot add suggestion this time.`)); return; }
    res.status(200).send(newSuggestion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:id
exports.getOneImprovementPlanSuggestion = async (req, res, next) => {
  const { id } = req.params;
  let suggestion;
  try {
    suggestion = await suggestionsFindOne({id});
    if (!suggestion) { res.status(400).send(ErrorMessageService.clientError(`Suggestion ID: $[id} does not exist.`)); return; }
    res.status(200).send(suggestion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateImprovementPlanSuggestion = async (req, res, next) => {
  const { id } = req.params;
  const { suggestion } = req.body;
  let updatedSuggestion;
  try {
    updatedSuggestion = await updateSuggestion(id, suggestion);
    if (!updatedSuggestion) { res.status(400).send(ErrorMessageService.clientError(`Suggestion ID: $[id} does not exist.`)); return; }
    res.status(200).send(updatedSuggestion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteImprovementPlanSuggestion = async (req, res, next) => {
  const { id } = req.params;
  let deletedSuggestion;
  try {
    deletedSuggestion = await db.improvementPlanSuggestion.destroy({where: {id}, individualHooks: true, returning: true});
    if (deletedSuggestion === 0) { res.status(400).send(ErrorMessageService.clientError(`Suggestion ID: ${id} does not exist.`)); return; }
    res.status(200).send({id});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// functions
const suggestionsFindOne = (queryObject) => {
  return new Promise(async(resolve, reject) => {
    let suggestions;
    try {
      suggestions = await db.findOne({
        where: queryObject,
        include: [
          { model: db.assessment, include: [
            { model: db.programSopi, include:[ {model: db.sopi, include: [{model: db.so}]} ]},
            { model: db.programCourse, include: [{model: db.course}]}
          ] },
          { model: db.instructor, include: [
            { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
            { model: db.program }
          ] }
        ]
      });
      resolve(suggestions);
    }
    catch (e) {
      reject(e);
    }
  });
};

const suggestionsFindAll = (queryObject) => {
  return new Promise(async(resolve, reject) => {
    let suggestions;
    try {
      suggestions = await db.findAll({
        where: queryObject,
        include: [
          { model: db.assessment, include: [
            { model: db.programSopi, include:[ {model: db.sopi, include: [{model: db.so}]} ]},
            { model: db.programCourse, include: [{model: db.course}]}
          ] },
          { model: db.instructor, include: [
            { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
            { model: db.program }
          ] }
        ]
      });
      resolve(suggestions);
    }
    catch (e) {
      reject(e);
    }
  });
};

const createSuggestion = (instructorId, assessmentId, suggestion) => {
  return new Promise(async(resolve, reject) => {
    let checkSuggestion,updatedSuggestion, suggestion;
    try {
      checkSuggestion = await suggestionsFindOne({instructorId, assessmentId});
      if (!checkSuggestion) {
        suggestion = await createSuggestion(instructorId, assessmentId, suggestion);
      } else {
        updatedSuggestion = await updateSuggestion(checkSuggestion.id, suggestion);
        if (!updatedSuggestion) { resolve(null); return; }
        suggestion = updatedSuggestion;
      }
      resolve(suggestion);
    }
    catch (e) {
      reject(e);
    }
  });
};

const updateSuggestion = (id, suggestion) => {
  return new Promise(async(resolve, reject) => {
    let updatedSuggestion;
    try {
      updatedSuggestion = await db.improvementPlanSuggestion.update({suggestion}, {where: {id}, returning: true, individualHooks: true});
      if (!updatedSuggestion[1][0]) { resolve(null); return; }
      suggestion = await suggestionsFindOne({id: updatedSuggestion[1][0].id});
      resolve(suggestion);
    }
    catch (e) {
      reject(e);
    }
  });
};
