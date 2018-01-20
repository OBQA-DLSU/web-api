const google = require('googleapis');
const fs = require('fs');
const db = require('../models');
const ErroMessage = require('../services/errorMessage.service');

exports.saveFile = (req) => {
  const token = req.googleAuth;
  const drive = google.drive('v3');

  return new Promise((resolve, reject) => {
    drive.files.create({
      auth: token,
      resource: {
        name: req.file.originalname,
        mimeType: req.file.mimetype
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.destination + req.file.originalname)
      }
    }, function (err, response) {
      if (err) {
        fs.unlinkSync(req.file.destination + req.file.originalname);
        console.log(err);
        resolve({err});
        return;
      }
      fs.unlinkSync(req.file.destination + req.file.originalname);
      console.log(response);
      resolve({err: null, response});
    });
  });
};

exports.createEvidence = (
  name,
  googleId,
  mimeType,
  type,
  programId,
  assessmentId,
  myClassId,
  programSopiId,
  programCourseId
) => {
  return new Promise(async(resolve, reject) => {
    try {
      let result;
      const checkEvidence = await db.evidence.findOne({where: {
        programId, type, assessmentId, myClassId, programSopiId, programCourseId
      }});
      if (!checkEvidence) {
        result = await db.evidence.create({name, googleId, mimeType, myClassId, type, programId, assessmentId, programSopiId, programCourseId});
      } else {
        const updateEvidence = await db.evidence.update({
          name, googleId, mimeType, type, programId, assessmentId, myClassId, programId, assessmentId, programSopiId, programCourseId
        },{where: {id: checkEvidence.id}, individualHooks: true, returning: true });
        result = updateEvidence[1][0];
      }
      if (!result) {
        resolve({err: ErroMessage.clientError('Invalid Input')});
        return;
      }
      const evidence = await db.evidence.findOne({
        where: {id: result.id},
        include: [
          { model: db.assessment },
          { model: db.myClass },
          { model: db.program },
          { model: db.programSopi, include: [
            { model: db.sopi, include: [{model: db.so}]}
          ] },
          { model: db.programCourse, include: [{model: db.course}]}
        ]
      });
      resolve({err: null, evidence});
    }
    catch(e) {
      reject(e);
    }
  });
};
