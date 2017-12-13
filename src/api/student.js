const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');
const _ = require('lodash');

// /all
exports.getAllStudent = async (req, res, next) => {
  let user, student;
  try {
    console.log(db.student);
    user = await db.user.findAll({where: {}, include: [db.student]});
    student = _.filter(user, (u) => { return u['students'].length > 1 });
    res.status(200).send(student);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

// /myClass/:myClassId
exports.getMyClassStudent = async (req, res, next) => {

};

// /myClass/:myClassId/:id

// /program/:programId/

// /bulk/:myClassId

// /:id

// functions



const studentCreate = (idNumber, fname, lname, programId, email, roleId) => {
  return new Promise((req, res) => {
    db.user.create({idNumber, fname, lname, email})
    .then(result => {
      db.student.create({userId: result.id, programId, roleId})
      .then(student => {
        db.user.findOne({where: {idNumber}, include: [db.student]})
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
      })
      .catch(err => {
        reject(err);
      });
    })
    .catch(err => {
      reject(err);
    })
  });
};

