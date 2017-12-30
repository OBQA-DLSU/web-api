const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');
const _ = require('lodash');

// /all
exports.getAllStudent = async (req, res, next) => {
  let user, student;
  try {
    student = await db.student.findAll({
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(e);
  }
};

// /myClass/:myClassId
exports.getMyClassStudent = async (req, res, next) => {
  const { myClassId } = req.params;
  let myClassStudent;
  try {
    myClassStudent = await db.myClassStudent.findAll({
      where: {myClassId},
      include: [
        { model: db.student, include: [
          { model: db.user, attributes: ['id', 'idNumber', 'lname', 'fname', 'email'] }
        ] }
      ],
      raw: true
    });
    if (!myClassStudent) { res.status(400).send(ErrorMessageService.clientError(`There are no students on Class ID: ${myClassId}.`)); return; }
    res.status(200).send(myClassStudent);
  }
  catch (e) {
    console.log(e);
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createMyClassStudent = async (req, res, next) => {
  const { myClassId } = req.params;
  const { idNumber, fname, lname, programId, email, isAdmin } = req.body;
  let checkUser, user, checkStudent, student, myClassStudentCheck, myClassStudent, checkClass, enrolledStudent;
  try {
    checkClass = await db.myClass.findOne({where: {id: myClassId}});
    if (!checkClass) { res.status(400).send(ErrorMessageService.clientError(`Class ID: ${myClassId} does not exist.`)); return; }
    checkUser = await db.user.findOne({where: { idNumber }});
    if (!checkUser) {
      user = await db.user.create({idNumber, fname, lname, email, roleId: 2 }, {individualHooks: true});
    } else {
      user = checkUser;
    }
    if (!user) { res.status(400).send(ErrorMessageService.clientError(`Invalid input.`)); return; }
    checkStudent = await db.student.findOne({where: {userId: user.id, programId} });
    if (!checkStudent) {
      student = await db.student.create({userId: user.id, programId, isAdmin});
    } else {
      student = checkStudent;
    }
    if (!student) { res.status(400).send(ErrorMessageService.clientError(`Student was not created.`)); return; }
    myClassStudentCheck = await db.myClassStudent.findOne({ where: {myClassId, studentId: student.id} });
    if (!myClassStudentCheck) {
      myClassStudent = await db.myClassStudent.create({myClassId, studentId: student.id}, {individualHooks:true});
    } else {
      myClassStudent = myClassStudentCheck;
    }
    if (!myClassStudent) { res.status(400).send(ErrorMessageService.clientError(`Student was not enrolled.`)); return; }
    enrolledStudent = await db.myClassStudent.findOne({
      where: {id: myClassStudent.id},
      include: [
        { model: db.student, include: [
          { model: db.user, attributes: ['idNumber', 'lname', 'fname', 'id', 'email'] }] }
        ],
        raw: true
      });
    res.status(200).send(enrolledStudent);
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
    student = await db.student.findAll({
      where: {programId},
      include: [
        { model: db.user, attributes: ['idNumber', 'lname', 'fname', 'id', 'email'] },
        { model: db.program }
      ]
    });
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
    student = await db.student.findOne({
      where: {id},
      include: [
        { model: db.user, attributes: [ 'id', 'idNumber', 'email', 'lname', 'fname']},
        { model: db.program }
      ]
    });
    if (!student) { res.status(400).send(ErrorMessageService.clientError(`Student ID: ${id} does not exist.`)); return; }
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateStudent = async (req, res, next) => {
  const { id } = req.params;
  const { fname, lname, email, idNumber, isAdmin } = req.body;
  let updatedStudent, student, checkStudent, updatedUser;
  try {
    checkStudent = await db.student.findOne({where: {id}});
    if (!checkStudent) { res.status(400).send(ErrorMessageService.clientError(`Student ID: ${id} does not exist.`)); return; }
    updatedUser = await db.user.update({
      fname, lname, email, idNumber
    }, { where: {id: checkStudent.studentId}, individualHooks: true});
    if (!updatedUser) { res.status(400).send(ErrorMessageService.clientError(`Student was not updated.`)); return; }
    updatedStudent = await db.student.update({isAdmin}, {where: {id: checkStudent.id}});
    if (!updatedStudent) { res.status(400).send(ErrorMessageService.clientError(`Student was not updated.`)); return; }
    student = await db.student.findOne({
      where: { id: checkStudent.id },
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteStudent = async (req, res, next) => {
  const { id } = req.params;
  let student;
  try {
    student = await db.student.destroy({ where: {id}, individualHooks: true, returning: true });
    if (student === 0) {
      res.status(400).send(ErrorMessageService.clientError(`Student ID: ${id} is not existing.`));
    } else {
      res.status(200).send({id:id});
    }
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError);
  }
};

// /myClassStudent/:id
exports.getOneMyClassStudent = async (req, res, next) => {
  const { id } = req.params;
  let myClassStudent;
  try {
    myClassStudent = await db.myClassStudent.findOne({
      where: {id},
      include: [
        { model: db.student, include: [
          { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
          { model: db.program }
        ] }
      ],
      raw: true
    });
    if (!myClassStudent) { res.status(400).send(ErrorMessageService.clientError(`MyClassStudent ID: ${id} does not exists.`)); return; }
    res.status(200).send(myClassStudent);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateMyClassStudent = async (req, res, next) => {
  const { id } = req.params;
  const { fname, lname, email, idNumber, isAdmin } = req.body;
  let myClassStudent, checkStudent, updatedStudent, student, checkUser;
  try {
    myClassStudent = await db.myClassStudent.findOne({ where: {id}});
    if (!myClassStudent) { res.status(400).send(ErrorMessageService.clientError(`MyClassStudent ID: ${id} is not existing.`)); return; }
    checkStudent = await db.student.findOne({ where: {id: myClassStudent.studentId} });
    if (!checkStudent) { res.status(400).send(ErrorMessageService.clientError(`Student ID: ${myclassStudent.studentId} does not exist.`)); return; }
    checkUser = await db.user.update({
      fname, lname, email, idNumber, isAdmin
    }, { where: {id: checkStudent.userId }});
    if (!checkUser) { res.status(400).send(ErrorMessageService.clientError(`User was not updated.`)); return; }
    updatedStudent = await db.student.update({isAdmin}, { where: {id: myClassStudent.studentId} });
    if (!updatedStudent) { res.status(400).send(ErrorMessageService.clientError(`Student was not updated.`)); return; }
    student = await db.myClassStudent.findOne({
      where: {id: myClassStudent.id },
      include: [
        { model: db.student, include: [
          { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
          { model: db.program }
        ] }
      ],
      raw: true
    });
    res.status(200).send(student);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteMyClassStudent = async (req, res, next) => {
  const { id } = req.params;
  let deletedMyClassStudent;
  try {
    deletedMyClassStudent = await db.myClassStudent.destroy({ where: {id}, individualHooks: true, returning: true });
    if (deletedMyClassStudent === 0) {
      res.status(400).send(ErrorMessageService.clientError(`MyClassStudent ID: ${id} is not existing.`));
      return;
    }
    res.status(200).send({id:id});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// functions
