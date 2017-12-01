const db = require('../models');
const config = require('../../config');
const invitationCodeService = require('../services/invitationCode.service');

exports.getCode = function (req, res, next) {
  // need program and role
  const { program, role } = req.body;
  const code = invitationCodeService.convertToCode(program, role);
  console.log(code);
  if(!code) {
    res.status(422).send({ errorMessage: 'Invalid Program or Role'});
  }
  db.invitationCode.create({
    code
  }).then(invitationCode => {
    res.status(200).send(invitationCode);
  });
};
