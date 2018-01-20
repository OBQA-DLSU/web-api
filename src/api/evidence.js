const db = require('../models');
const EvidenceHelper = require('../helpers/evidence.helper');
const ErroMessage = require('../services/errorMessage.service');

exports.getListOfEvidencePerProgram = (req, res, next) => {
  
};

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
