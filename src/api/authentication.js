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
exports.signup = async (req, res, next) => {
  const { email, fname, lname, idNumber, password, confirmation, invitationCode } = req.body;
  let checkForUser, programId, roleId, convertedCode, output, codeOutput, user, instructor, token, err;

  try {
    checkForUser = await db.user.findAll({where: {
      [Op.or]: [{email}, {idNumber}]
    }});

    if(checkForUser.length > 0) { res.status(422).send({errorMessage: 'Email or IdNumber is already in use'}); return; }
    output = await db.invitationCode.findOne({where: {
      invitationCode
    }});

    if(!output) { res.status(422).send({errorMessage: 'Invalid Invitation code.'}); return; }

    codeOutput = output.code;
    convertedCode = invitationCodeService.readCode(codeOutput);
    programId = convertedCode.programId;
    roleId = convertedCode.roleId;
    user = await db.user.create({email, fname, lname, idNumber, password, confirmation, programId, roleId },{ individualHooks: true, raw: true });
    if(!user) { res.status(422).send({errorMessage: 'Invalid Credentials'}); return; }
    instructor = await db.instructor.create({userId: user.id, programId, status: 'ACTIVE'});
    token = await jwtService.tokenForUser(user.id);
    res.status(200).send({user, token});
    return;
  }
  catch(e) {
    console.log(e);
    res.status(500).send({errorMessage: e});
    return;
  }
}