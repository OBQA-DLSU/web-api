const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /assessment/:assessmentId
exports.getAssessmentDiscussion = async (req, res, next) => {
  const { assessmentId } = req.params;
  let discussions;
  try {
    discussions = await discussionFindAll({assessmentId});
    res.status(200).send(discussions);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createAssessmentDiscussion = async (req, res, next) => {
  const { assessmentId } = req.params;
  const { instructorId, discussion } = req.body;
  let newDiscussion;
  try {
    newDiscussion = await createDiscussion(instructorId, assessmentId, discussion);
    if (!newDiscussion) { res.status(400).send(ErrorMessageService.clientError(`Cannot add discussion this time.`)); return; }
    res.status(200).send(newDiscussion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /:id
exports.getOneAssessmentDiscussion = async (req, res, next) => {
  const { id } = req.params;
  let discussion;
  try {
    discussion = await discussionFindOne({id});
    if (!discussion) { res.status(400).send(ErrorMessageService.clientError(`Discussion ID: $[id} does not exist.`)); return; }
    res.status(200).send(discussion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateAssessmentDiscussion = async (req, res, next) => {
  const { id } = req.params;
  const { discussion } = req.body;
  let updatedDiscussion;
  try {
    updatedDiscussion = await updateDiscussion(id, discussion);
    if (!updatedDiscussion) { res.status(400).send(ErrorMessageService.clientError(`Discussion ID: $[id} does not exist.`)); return; }
    res.status(200).send(updatedDiscussion);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteAssessmentDiscussion = async (req, res, next) => {
  const { id } = req.params;
  let deletedDiscussion;
  try {
    deletedDiscussion = await db.assessmentDiscussion.destroy({where: {id}, individualHooks: true, returning: true});
    if (deletedDiscussion === 0) { res.status(400).send(ErrorMessageService.clientError(`Discussion ID: ${id} does not exist.`)); return; }
    res.status(200).send({id});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// functions
const discussionFindOne = (queryObject) => {
  return new Promise(async(resolve, reject) => {
    let discussion;
    try {
      discussion = await db.assessmentDiscussion.findOne({
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
      resolve(discussion);
    }
    catch (e) {
      reject(e);
    }
  });
};

const discussionFindAll = (queryObject) => {
  return new Promise(async(resolve, reject) => {
    let discussions;
    try {
      discussions = await db.assessmentDiscussion.findAll({
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
      resolve(discussions);
    }
    catch (e) {
      reject(e);
    }
  });
};

const createDiscussion = (instructorId, assessmentId, discussion) => {
  return new Promise(async(resolve, reject) => {
    let result;
    try {
      result = await db.assessmentDiscussion.create({instructorId, assessmentId, discussion});
      const createdDiscussion = await discussionFindOne({id: result.id});
      resolve(createdDiscussion);
    }
    catch (e) {
      reject(e);
    }
  });
};

const updateDiscussion = (id, discussion) => {
  return new Promise(async(resolve, reject) => {
    let updatedDiscussion, discussion;
    try {
      updatedDiscussion = await db.assessmentDiscussion.update({discussion}, {where: {id}, returning: true, individualHooks: true});
      if (!updatedDiscussion[1][0]) { resolve(null); return; }
      discussion = await discussionFindOne({id: updatedDiscussion[1][0].id});
      resolve(discussion);
    }
    catch (e) {
      reject(e);
    }
  });
};
