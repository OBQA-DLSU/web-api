const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /:programId
exports.getProgramSopi = async (req, res, next) => {
  const { programId } = req.params;
  let programSopi;
  try {
    programSopi = await db.programSopi.findAll({where: { programId }, include: [ { all: true } ]});
    if (!programSopi || programSopi.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Program SOPIs with ID ${programId} are not existing.`)); return; }
    res.status(200).send(programSopi);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createProgramSopi = async (req, res, next) => {
  const { programId } = req.params;
  const { so, code, description } = req.body;
  let createSopiResponse, sopi, createProgramSopiResponse, programSopi, finalProgramSopi;
  try {
    sopi = await db.sopi.findOne({where: {code}});
    if (!sopi) {
      createSopiResponse = await sopiCreate(so, code);
      if (!createSopiResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data input`)); return; }
    } else {
      createSopiResponse = sopi;
    }
    programSopi = await db.programSopi.findOne({ where: { programId, sopiId: createSopiResponse.id }});
    if (!programSopi) {
      createProgramSopiResponse = await programSopiCreate(programId, createSopiResponse.id, description);
      if (!createProgramSopiResponse) { res.status(400).send(ErrorMessageService.clientError(`Invalid Data input`)); return; }
    } else {
      createProgramSopiResponse = programSopi;
    }
    finalProgramSopi = await db.programSopi.findOne({ where: { id: programSopi.id }, include: [{all:true}]});
    res.status(200).send(finalProgramSopi);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// programSopi/:id
exports.getOneProgramSopi = async (req, res, next) => {
  const { id } = req.params;
  let programSopi;
  try {
    programSopi = await db.programSopi.findOne({ where: { id }, include: [ { all: true } ]});
    if (!programSopi) { res.status(400).send(ErrorMessageService.clientError(`Program Sopi with ID: ${id} is not existing.`)); return;}
    res.status(200).send(programSopi);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateProgramSopi = async (req, res, next) => {
  const { id } = req.params;
  const { so, code, description } = req.body;
  let updateSopiResponse, updateProgramSopiResponse, updatedProgramSopi;
  try {
    programSopi = await db.programSopi.findOne({where: {id}});
    if (!programSopi) { res.status(400).send(ErrorMessageService.clientError(`Program SOPI ID: ${id} not found.`)); return; }
    else {
      updateSopiResponse = await sopiUpdate(programSopi.sopiId, so, code);
      updateProgramSopiResponse = await programSopiUpdate(id, programSopi.programId, programSopi.sopiId, description);
    }
    if (!updateSopiResponse || !updateProgramSopiResponse) { res.status(400).send(ErrorMessageService.clientError(`Process Error.`)); return; }
    updatedProgramSopi = await db.programSopi.findOne({ where: {id}, include: [{all:true}]});
    if (!updatedProgramSopi) { res.status(400).send(ErrorMessageService.clientError(`Process Error.`)); return;}
    res.status(200).send(updatedProgramSopi);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteProgramSopi = async (req, res, next) => {
  const { id } = req.params;
  let deletedProgramSopi;
  try {
    deletedProgramSopi = await db.programSopi.destroy({ where: {id}, individualHooks: true });
    res.status(200).send({message: `Program SOPI ID: ${id} was successfully deleted.`});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /bulk/:prograId

exports.bulkCreateProgramSopi = async (req, res, next) => {

};

exports.bulkUpdateProgramSopi = async (req, res, next) => {

};

exports.bulkDeleteProgramSopi = async (req, res, next) => {

};

// functions

const sopiCreate = (so, code, description) => {
  return new Promise((resolve, reject) => {
    db.sopi.create({ so, code, description }, { individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Credentials.'})}
      else { resolve(result); }
    })
    .catch(err => {
      rerject(err);
    })
  });
};

const sopiUpdate = (id, so, code, description) => {
  return new Promise((resolve, reject) => {
    db.sopi.update({ so, code, description }, { where: {id}, individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Credentials.'})}
      else { resolve(result); }
    })
    .catch(err => {
      rerject(err);
    });
  });
};

const programSopiCreate = (programId, sopiId, description) => {
  return new Promise((resolve, reject) => {
    db.programSopi.create({programId, sopiId, description}, { individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Credentials.'})}
      else { resolve(result); }
    })
    .catch(err => {
      rerject(err);
    });
  });
};

const programSopiUpdate = (id, programId, sopiId, description) => {
  return new Promise((resolve, reject) => {
    db.programSopi.update({programId, sopiId, description}, { where: {id}, individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Credentials.'})}
      else { resolve(result); }
    })
    .catch(err => {
      rerject(err);
    });
  });
};