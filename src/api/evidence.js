const db = require('../models');
const EvidenceHelper = require('../helpers/evidence.helper');
const ErroMessage = require('../services/errorMessage.service');

exports.getListOfEvidencePerProgram = (req, res, next) => {
  
};

// /:programId/:id
exports.updateEvidence = async (req, res, next) => {
  console.log(req.params);
  const { programId } = req.params;
  const {
    type,
    assessmentId,
    myClassId,
    programSopiId,
    programCourseId
  } = req.body;
  try {
    const updateFile = await EvidenceHelper.updateFile(req);
    if (updateFile.err) {
      res.status(400).send(ErroMessage.clientError('File was not updated.'));
      return;
    }
    const { id, name, mimeType } = updateFile.response;
    const updateEvidence = await EvidenceHelper.updateEvidence(req.params.id, name, id, mimeType, type, programId, assessmentId, myClassId, programSopiId, programCourseId);
    if (updateEvidence.err) {
      res.status(400).send(updateEvidence.err);
      return;
    }
    res.status(200).send(updateEvidence.evidence);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErroMessage.serverError());
  }
}

// /program/:programId
exports.saveEvidence = async (req, res, next) => {
  const { programId } = req.params;
  const {
    type,
    assessmentId,
    myClassId,
    programSopiId,
    programCourseId
  } = req.body;
  try {
    const saveData = await EvidenceHelper.saveFile(req);
    if (saveData.err) {
      res.status(400).send(ErroMessage.clientError('File was not save.'));
      return;
    }
    const { id, name, mimeType  } = saveData.response;
    const saveEvidence = await EvidenceHelper.createEvidence(name, id, mimeType, type, programId, assessmentId, myClassId, programSopiId, programCourseId);
    if (saveEvidence.err) {
      res.status(400).send(saveEvidence.err);
      return;
    }
    res.status(200).send(saveEvidence.evidence);
  }
  catch(e) {
    console.log(e);
    res.status(500).send(ErroMessage.serverError());
  }
};

// /myClass/:myClassId
exports.getMyClassEvidenceMetaData = async (req, res, next) => {
  const { myClassId } = req.params;
  try {
    const getEvidence = await EvidenceHelper.getMyClassEvidenceMetaData(myClassId);
    res.status(200).send(getEvidence.evidences);
  }
  catch(e) {
    console.log(e);
    res.status(500).send(ErroMessage.serverError());
  }
};
