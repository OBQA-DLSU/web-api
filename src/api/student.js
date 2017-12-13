const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');
const _ = require('lodash');

// /all
exports.getAllStudent = async (req, res, next) => {
  let user, student;
  try {
    user = await db.user.findAll({where: {}, include: [ {model: db.student, include: [{all:true}]}]});
    student = _.filter(user, (u) => { return u['students'].length > 0 });
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(e);
  }
};

// /myClass/:myClassId
exports.getMyClassStudent = async (req, res, next) => {
  const { myClassId } = req.params;
  let myClass;
  try {
    myClass = await db.myClass.findOne({where: {id: myClassId}, include: [{model: db.myClassStudent}]});
    if (!myClass || myClass['myClassStudents'].length === 0) { res.status(400).send(ErrorMessageService.clientError(`There are no students on Class ID: ${myClassId}.`)); return; }
    res.status(200).send(myClass['students']);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createMyClassStudent = async (req, res, next) => {
  const { myClassId } = req.params;
  const { idNumber, fname, lname, programId, email } = req.body;
  let user, student, myClassStudent, checkClass, enrolledStudent;
  try {
    checkClass = await db.myClass.findOne({where: {id: myClassId}});
    if (!checkClass) { res.status(400).send(ErrorMessageService.clientError(`Class ID: ${myClassId} does not exist.`)); return; }
    user = await db.user.create({idNumber, fname, lname, email, role: 4}, {individualHooks: true});
    if (!user) { res.status(400).send(ErrorMessageService.clientError(`Invalid input.`)); return; }
    student = await db.student.create({programId}, {individualHooks: true});
    if (!student) { res.status(400).send(ErrorMessageService.clientError(`Student was not created.`)); return; }
    myClassStudent = await db.myClassStudent.create({myClassId, studentId: student.id}, {individualHooks:true});
    if (!myClassStudent) { res.status(400).send(ErrorMessageService.clientError(`Student was not enrolled.`)); return; }
    enrolledStudent = await db.myClassStudent.findOne({where: {myClassId, studentId: myClassStudent.id}}, {include: [{all:true}]});
    res.status(200).send(enrolledStudent.student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /program/:programId/
exports.getStudentByProgram = async (req, res, next) => {
  const { programId } = req.params;
  let student;
  try {
    student = await db.student.findAll({ where: {programId}, include: [{all:true}] });
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /bulk/:myClassId

// /:id
exports.getStudentById = async (req, res, next) => {
  const { id } = req.params;
  let student;
  try {
    student = await db.findOne({where: {id}, include: [{all: true}]});
    if (!student) { res.status(400).send(ErrorMessageService.clientError(`Student ID: ${id} does not exist.`)); return; }
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateStudent = async (req, res, next) => {
  res.status(200).send({message: `This feature is not yet available.`});
  // const { id } = req.params;
  // let student, user;
  // try {

  // }
  // catch (e) {

  // }
};

exports.deleteStudent = async (req, res, next) => {
  res.status(200).send({message: `This feature is not yet available.`});
};

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
