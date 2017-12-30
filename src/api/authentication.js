const db = require('../models');
const jwtService = require('../services/jwt.service');
const Op = require('sequelize').Op;
const to = require('await-to-js');
const _ = require('lodash');
const ErrorMessageService = require('../services/errorMessage.service');
const invitationCodeService = require('../services/invitationCode.service');
const CodeGenerator = require('node-code-generator');
const sgMail = require('@sendgrid/mail');
const generator = new CodeGenerator();
const pattern = '************';
const secretKeys = require('../../secret-keys');

exports.signin = async function(req, res, next) {
  let user, checkUser;
  try {
    checkUser = await db.user.findOne({
      where: {id: req.user.id},
      attributes:['id', 'idNumber', 'email', 'lname', 'fname'],
      include: [
        {model: db.role },
        {model: db.instructor, include: [{ model: db.program }]},
        {model: db.student}
      ]
    });
    if (!checkUser) { res.status(400).send(`Invalid User.`); return; }
    res.status(200).send({user: checkUser, token: jwtService.tokenForUser(req.user)});
  }
  catch (e) {
    res.status(500).send(`Internal server error.`);
  }
};

// this signup is only for instructors 
exports.signup = async (req, res, next) => {
  const { email, fname, lname, idNumber, password, confirmation, invitationCode } = req.body;
  let checkForUser, programId, roleId, isAdmin, isStudent, convertedCode, output, codeOutput, user, instructor, token, err;
  if (password !== confirmation) { res.status(422).send('Passwords do not match!'); return; }
  try {
    checkForUser = await db.user.findOne({where: {
      [Op.or]: [{email}, {idNumber}]
    }});

    if(checkForUser && checkForUser.password) { res.status(422).send('Email or IdNumber is already in use'); return; }
    output = await db.invitationCode.findOne({where: {
      invitationCode
    }});

    if(!output) { res.status(422).send('Invalid Invitation code.'); return; }

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
    if(!user) { res.status(422).send('Invalid Credentials'); return; }
    const destroy = await db.invitationCode.destroy({ where: { invitationCode }});
    if (!user.isStudent) {
      instructor = await db.instructor.create({userId: user.id, programId, isAdmin, status: 'ACTIVE'});
    } else {
      student = await db.student.create({userId: user.id, programId, isAdmin, status: 'ACTIVE'});
    }
    const checkUser = await db.user.findOne({
      where: {id: user.id},
      attributes:['id', 'idNumber', 'email', 'lname', 'fname'],
      include: [
        {model: db.role },
        {model: db.instructor, include: [{ model: db.program }]},
        {model: db.student}
      ]
    });
    token = jwtService.tokenForUser(user);
    res.status(200).send({user: checkUser, token});
    return;
  }
  catch(e) {
    res.status(500).send('There is a server Error.');
    return;
  }
}

exports.retrievePassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const code = generator.generateCodes(pattern, 1);
    const newPassword = code[0];
    const checkUser = await db.user.findOne({where: {email}});
    if (!checkUser) { res.status(400).send(ErrorMessageService.clientError(`${email} is not existing.`)); return; }
    const updatedUser = await db.user.update({email, password: newPassword}, {where: {id: checkUser.id}, individualHooks: true});
    const sendPasswordResult = await sendPassword(email, checkUser, newPassword);
    res.status(200).send(sendPasswordResult);
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

exports.changePassword = async (req, res, next) => {
  const { newPassword, confirmation } = req.body;
  try {
    if (newPassword !== confirmation) { res.status(400).send(ErrorMessageService.clientError(`Passwords do not match.`)); return; }
    const updatedUser = await db.user.update({email: req.user.email, password: newPassword}, {where: {id: req.user.id}, individualHooks: true });
    const checkUser = await db.user.findOne({
      where: {id: updatedUser[1][0].id},
      attributes:['id', 'idNumber', 'email', 'lname', 'fname'],
      include: [
        {model: db.role },
        {model: db.instructor, include: [{ model: db.program }]},
        {model: db.student}
      ]
    });
    token = jwtService.tokenForUser(req.user);
    res.status(200).send({user: checkUser, token});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

const sendPassword = (email, user, password) => {
  return new Promise( async (resolve, reject) => {
    sgMail.setApiKey(secretKeys.OBQA_INVITE_KEY);
    const msg = {
      to: email,
      from: 'johnhiggins.avila@gmail.com',
      subject: 'Invitation from GCOE-CQI office',
      html: `<strong>Hello! ${user.fname}</strong><br/><p>Here is the your temporary password: ${password}</p></br><p>Sincerely,</p></br><p>GCOE-CQI Team</p>`
    };
    try {
      const mailResponse = await sgMail.send(msg);
      if (!mailResponse) { reject({ errorMessage: 'Invalid Credentials' }) }
      resolve({ message: `Successfully sent Temporary password to ${email}` });
    }
    catch (e) {
      reject(ErrorMessageService.serverError());
    }
  });
};
