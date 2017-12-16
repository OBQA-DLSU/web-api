const db = require('../models');
const jwtService = require('../services/jwt.service');
const Op = require('sequelize').Op;
const to = require('await-to-js');
const _ = require('lodash');
const invitationCodeService = require('../services/invitationCode.service');


exports.signin = async function(req, res, next) {
  let user, checkUser;
  try {
    checkUser = await db.user.findOne({where: {id: req.user.id}, include: [ {model: db.role }, {model: db.instructor}, {model: db.student} ]});
    user = {
      id: checkUser.id,
      idNumber: checkUser.idNumber,
      email: checkUser.email,
      lname: checkUser.lname,
      fname: checkUser.fname,
      roleId: checkUser.roleId,
      role: checkUser.role,
      instructor: checkUser['instructors'],
      student: checkUser['students']
    };
    if (!user) { res.status(400).send({errorMessage: `Invalid User.`}); return; }
    res.status(200).send({user, token: jwtService.tokenForUser(req.user)});
  }
  catch (e) {
    console.log(e);
    res.status(500).send({errorMessage: `Internal server error.`});
  }
};

// this signup is only for instructors 
exports.signup = async (req, res, next) => {
  const { email, fname, lname, idNumber, password, confirmation, invitationCode } = req.body;
  let checkForUser, programId, roleId, isAdmin, isStudent, convertedCode, output, codeOutput, user, instructor, token, err;
  if (password !== confirmation) { res.status(422).send({errorMessage: 'Passwords do not match!'}); return; }
  try {
    checkForUser = await db.user.findOne({where: {
      [Op.or]: [{email}, {idNumber}]
    }});

    if(checkForUser && checkForUser.password) { res.status(422).send({errorMessage: 'Email or IdNumber is already in use'}); return; }
    output = await db.invitationCode.findOne({where: {
      invitationCode
    }});

    if(!output) { res.status(422).send({errorMessage: 'Invalid Invitation code.'}); return; }

    codeOutput = output.code;
    convertedCode = invitationCodeService.readCode(codeOutput);
    programId = convertedCode.programId;
    roleId = convertedCode.roleId;
    isAdmin = convertedCode.isAdmin;
    isStudent = convertedCode.isStudent;
    if(checkForUser) {
      const updatedUser = await db.user.update({fname, lname, password}, { where: {id: checkForUser.id}, individualHooks: true});
      user = updatedUser[0][1];
    } else {
      user = await db.user.create({email, fname, lname, idNumber, password, roleId },{ individualHooks: true });
    }
    if(!user) { res.status(422).send({errorMessage: 'Invalid Credentials'}); return; }
    const destroy = await db.invitationCode.destroy({ where: { invitationCode }});
    if (!user.isStudent) {
      instructor = await db.instructor.create({userId: user.id, programId, isAdmin, status: 'ACTIVE'});
    } else {
      student = await db.student.create({userId: user.id, programId, isAdmin, status: 'ACTIVE'});
    }
    const userFinal = await db.user.findOne({where: {id: user.id}, include: [ {model: db.role }, {model: db.instructor}, {model: db.student} ]});
    token = await jwtService.tokenForUser(user.id);
    res.status(200).send({user: userFinal, token});
    return;
  }
  catch(e) {
    res.status(500).send({errorMessage: 'There is a server Error.'});
    return;
  }
}
