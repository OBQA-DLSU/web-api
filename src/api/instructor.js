const db = require('../models');
const ErrorMessageService = require('../services/errorMessage.service');

// /all
exports.getAllInstructor = async (req, res, next) => {
  let instructors;
  try {
    instructors = await db.instructor.findAll({
      where: {},
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(instructors);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// /program/:programId
exports.getInstructorByProgram = async (req, res, next) => {
  const { programId } = req.params;
  let instructors;
  try {
    instructors = await db.instructor.findAll({
      where: { programId },
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(instructors);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.createInstructor = async (req, res, next) => {
  const { programId } = req.params;
  const { idNumber, email, lname, fname } = req.body;
  let checkUser, user, checkInstructor, instructor;
  try {
    checkUser = await db.user.findOne({ where: {idNumber} });
    if (!checkUser) {
      user = await db.user.create({idNumber, email, lname, fname, roleId: 2});
    } else {
      user = checkUser;
    }
    checkInstructor = await db.instructor.findOne({ where: { programId, userId: user.id }});
    if (!checkInstructor) {
      instructor = await db.instructor.create({programId, userId: user.id, isAdmin: false});
    } else {
      instructor = checkInstructor;
    }
    if (!instructor) { res.status(400).send(ErrorMessageService.clientError(`Instructor awas not created.`)); return; }
    res.status(200).send(instructor);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};


// /:id
exports.getOneInstructor = async (req, res, next) => {
  const { id } = req.params;
  let instructor;
  try {
    instructor = await db.instructor.findOne({
      where: { id },
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(instructor);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.updateInstructor = async (req, res, next) => {
  const { id } = req.params;
  const { idNumber, email, lname, fname, isAdmin } = req.body;
  let checkUser, updatedUser, checkInstructor, updatedInstructor, instructor;
  try {
    checkInstructor = await db.instructor.findOne({ where: id });
    if (!checkInstructor) { res.status(400).send(ErrorMessageService.clientError(`Instructor ID: ${id} does not exist.`)); return; }
    checkUser = await db.user.find({ where: {id: checkInstructor.userId}});
    if (!checkUser) { res.status(400).send(ErrorMessageService.clientError(`User ID: ${checkUser.userId} does not exist.`)); return; }
    updatedUser = await db.user.update({email, lname, fname }, { where: {id: checkUser.id }, individualHooks: true});
    updatedInstructor = await db.instructor.update({isAdmin: (isAdmin)? true: false }, {where: {id}});
    if (!updatedUser || !updatedInstructor) { res.status(400).send(ErrorMessageService.clientError(`Updated unsuccessful`)); return; }
    instructor = await db.instructor.findOne({
      where: {id},
      include: [
        { model: db.user, attributes: ['id', 'idNumber', 'email', 'lname', 'fname'] },
        { model: db.program }
      ]
    });
    res.status(200).send(instructor);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.deleteInstructor = async (req, res, next) => {
  const { id } = req.params;
  let deletedInstructor;
  try {
    deletedInstructor = await db.instructor.destroy({
      where: { id }, individualHooks: true, returning: true
    });
    if (deletedInstructor === 0) {
      res.status(400).send(ErrorMessageService.clientError(`Instructor ID: ${id} is not existing.`));
    }
    res.status(200).send({id: id});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};