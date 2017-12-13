const db = require('../models');
const jwtService = require('../services/jwt.service');
const Op = require('sequelize').Op;
const to = require('await-to-js');
const _ = require('lodash');
const invitationCodeService = require('../services/invitationCode.service');

const { user } = db;

exports.signin = function(req, res, next) {
  const user = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  }
  res.send({user, token: jwtService.tokenForUser(req.user)});
};

// this signup is only for instructors 
exports.signup = async (req, res, next) => {
  const { email, fname, lname, idNumber, password, confirmation, invitationCode } = req.body;
  let checkForUser, programId, roleId, convertedCode, output, codeOutput, user, instructor, token, err;
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
    if(checkForUser) {
      user = await db.user.update({fname, lname, password}, { where: {id: checkForUser.id}, individualHooks: true});
    } else {
      user = await db.user.create({email, fname, lname, idNumber, password, programId, roleId },{ individualHooks: true });
    }
    if(!user) { res.status(422).send({errorMessage: 'Invalid Credentials'}); return; }
    db.invitationCode.destroy({ where: { invitationCode }});
    instructor = await db.instructor.create({userId: user.id, programId, status: 'ACTIVE'});
    token = await jwtService.tokenForUser(user.id);
    res.status(200).send({user, token});
    return;
  }
  catch(e) {
    console.log(e);
    res.status(500).send({errorMessage: 'There is a server Error.'});
    return;
  }
}