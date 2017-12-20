const sgMail = require('@sendgrid/mail');
const db = require('../models');
const invitationCodeService = require('../services/invitationCode.service');
const secretKeys = require('../../secret-keys');
const ErrorMessageService = require('../services/errorMessage.service');
exports.invitation = async (req, res, next) => {
  const { invitationItems } = req.body;
  // this should be an array of invitations
  let error = [], success = [];
  // loop trough invitationData
  try {
    const result = await Promise.all(invitationItems.map( async(data) => {
      const errorMessage = 'There is an error occured while looping trough the array';
      const { email, programId, roleId, isAdmin, isStudent } = data;
      const invitationCode = await getCode(programId, roleId, isAdmin, isStudent);
      if (!invitationCode) { error.push({ errorMessage })}
      if (invitationCode.errorCode) { error.push(invitationCode) }
      const invitationResult = await invite(email, invitationCode);
      if (!invitationResult) { error.push({ errorMessage })}
      if (invitationCode.errorCode) { error.push({errorMessage})}
      success.push(invitationResult);
    }));
    res.status(200).send({success, error});
  }
  catch (e) {
    res.status(500).send(ErrorMessageService.serverError());
  }
};

// functions
const getCode = (programId, roleId, isAdmin, isStudent) => {
  return new Promise( async (resolve, reject) => {
    let invitationCode;
    const code = invitationCodeService.convertToCode(programId, roleId, isAdmin, isStudent);
    if(!code) {
      reject({ errorMessage: 'Invalid Program or Role'});
    }
    try {
      invitationCode = await db.invitationCode.create({code});
      if (!invitationCode) { reject({ errorMessage: 'Invalid Program or Role'});}
      resolve(invitationCode.invitationCode);
    }
    catch (e) {
      reject(ErrorMessageService.serverError());
    }
  });
};

const invite = (email, invitationCode) => {
  return new Promise( async (resolve, reject) => {
    sgMail.setApiKey(secretKeys.OBQA_INVITE_KEY);
    const msg = {
      to: email,
      from: 'johnhiggins.avila@gmail.com',
      subject: 'Invitation from GCOE-CQI office',
      html: `<strong>Hello!</strong><br/><p>Please click the following link to signup: <a href="www.google.com/${invitationCode}">Sign up with code: ${invitationCode}<a></p></br><p>Sincerely,</p></br><p>GCOE-CQI Team</p>`
    };
    try {
      const mailResponse = await sgMail.send(msg);
      if (!mailResponse) { reject({ errorMessage: 'Invalid Credentials' }) }
      resolve({ message: `Successfully sent invite to ${email}` });
    }
    catch (e) {
      reject(ErrorMessageService.serverError());
    }
  });
};