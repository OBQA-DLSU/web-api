const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /:programId
exports.getProgramSopi = async (req, res, next) => {
  const { programId } = req.params;
  let programSopi;
  try {
    programSopi = await db.programSopi.findAll({where: { programId }, include: [ {model: db.program}, {model: db.sopi, include: [db.so]} ]});
    if (!programSopi || programSopi.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Program SOPIs with ID ${programId} are not existing.`)); return; }
    res.status(200).send({programSopi});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createProgramSopi = async (req, res, next) => {
  const { programId } = req.params;
  const { soId, code, description } = req.body;
  let createSopiResponse, sopi, createProgramSopiResponse, programSopi, finalProgramSopi;
  try {
    sopi = await db.sopi.findOne({where: {code}});
    if (!sopi) {
      createSopiResponse = await sopiCreate(soId, code);
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
    finalProgramSopi = await db.programSopi.findOne({ where: { id: programSopi.id }, include: [{model: db.program}, {model: db.sopi, include: [{model: db.so}]}]});
    res.status(200).send({programSopi: finalProgramSopi});
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
    programSopi = await db.programSopi.findOne({ where: { id }, include: [{model: db.program}, {model: db.sopi, include: [{model: db.so}]}]});
    if (!programSopi) { res.status(400).send(ErrorMessageService.clientError(`Program Sopi with ID: ${id} is not existing.`)); return;}
    res.status(200).send({programSopi});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateProgramSopi = async (req, res, next) => {
  const { id } = req.params;
  const { soId, code, description } = req.body;
  let updateSopiResponse, updateProgramSopiResponse, updatedProgramSopi;
  try {
    so = await db.so.findOne({where: {code: so}});
    programSopi = await db.programSopi.findOne({where: {id}});
    if (!programSopi) { res.status(400).send(ErrorMessageService.clientError(`Program SOPI ID: ${id} not found.`)); return; }
    else {
      updateSopiResponse = await sopiUpdate(programSopi.sopiId, soId, code);
      updateProgramSopiResponse = await programSopiUpdate(id, programSopi.programId, programSopi.sopiId, description);
    }
    if (!updateSopiResponse || !updateProgramSopiResponse) { res.status(400).send(ErrorMessageService.clientError(`Process Error.`)); return; }
    updatedProgramSopi = await db.programSopi.findOne({ where: { id }, include: [{model: db.program}, {model: db.sopi, include: [{model: db.so}]}]});
    if (!updatedProgramSopi) { res.status(400).send(ErrorMessageService.clientError(`Process Error.`)); return;}
    res.status(200).send({programSopi: updatedProgramSopi});
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

// /bulk/:programId

exports.bulkCreateProgramSopi = async (req, res, next) => {
  if (!req.payload) { res.status(400).send(ErrorMessageService.clientError('No File Detected')); return; }
  const { programId } = req.params;
  let jsonData, err = [], success =[];
  try {
    jsonData = req.payload;
    if (!jsonData || jsonData.length === 0) { res.status(400).send(ErrorMessageService.clientError(`Invalid file or Unsupported format`)); return; }
    const result = await Promise.all(jsonData.map(async (data) => {
      const newData = {
        so: data['SO'],
        code: data['SOPI'],
        description: data['DESCRIPTION']
      };
      const { so, code, description } = newData;
      let createSopiResponse,soNew, createSoResponse, sopi, createProgramSopiResponse, programSopi, finalData;
      try {
        soNew = await db.so.findOne({where: {code: so}});
        if (!soNew) {
          createSoResponse = await db.so.create({code: so});
          if (!createSoResponse) { err.push(ErrorMessageService.clientError(`SO was not created.`)); return; }
        } else {
          createSoResponse = soNew;
        }
        sopi = await db.sopi.findOne({where: {code}});
        if (!sopi) {
          createSopiResponse = await sopiCreate(createSoResponse.id, code);
          if (!createSopiResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
        } else {
          createSopiResponse = sopi;
        }
        programSopi = await db.programSopi.findOne({where: { programId, sopiId: createSopiResponse.id }});
        if (!programSopi) {
          createProgramSopiResponse = await programSopiCreate(programId, createSopiResponse.id, description);
          if (!createProgramSopiResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
        } else {
          createProgramSopiResponse = await programSopiUpdate(programSopi.id, programId, sopi.id, description);
          if (!createProgramSopiResponse) { err.push(ErrorMessageService.clientError(`Invalid Data Input`)); return; }
        }
        finalData = await db.programSopi.findOne({ where: { id: programSopi.id }, include: [{model: db.program}, {model: db.sopi, include: [{model: db.so}]}]});
        success.push(finalData);
      }
      catch (e) {
        err.push(e);
      }
    }));
    res.status(200).send({success, err});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.bulkUpdateProgramSopi = async (req, res, next) => {
  res.status(200).send({message: 'This feature is not yet available.'});
};

exports.bulkDeleteProgramSopi = async (req, res, next) => {
  res.status(200).send({message: 'This feature is not yet available.'});
};

// functions

const sopiCreate = (soId, code, description) => {
  return new Promise((resolve, reject) => {
    db.sopi.create({ soId, code, description }, { individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Inputs.'})}
      else { resolve(result); }
    })
    .catch(err => {
      reject(err);
    });
  });
};

const sopiUpdate = (id, soId, code, description) => {
  return new Promise((resolve, reject) => {
    db.sopi.update({ soId, code, description }, { where: {id}, individualHooks: true, returning: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Inputs.'})}
      else { resolve(result[1][0]); }
    })
    .catch(err => {
      reject(err);
    });
  });
};

const programSopiCreate = (programId, sopiId, description) => {
  return new Promise((resolve, reject) => {
    db.programSopi.create({programId, sopiId, description}, { individualHooks: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Inputs.'})}
      else { resolve(result); }
    })
    .catch(err => {
      reject(err);
    });
  });
};

const programSopiUpdate = (id, programId, sopiId, description) => {
  return new Promise((resolve, reject) => {
    db.programSopi.update({programId, sopiId, description}, { where: {id}, individualHooks: true, returning: true })
    .then(result => {
      if (!result) { reject({ errorMessage: 'Invalid Inputs.'})}
      else { resolve(result[1][0]); }
    })
    .catch(err => {
      reject(err);
    });
  });
};