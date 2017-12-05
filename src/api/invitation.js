const sgMail = require('@sendgrid/mail');
const db = require('../models');
const invitationCodeService = require('../services/invitationCode.service');
const secretKeys = require('../../secret-keys');
exports.invitation = async (req, res, next) => {
  console.log(req.body);
  // this should be an array of invitations
  let error = [];
  // loop trough invitationData
  try {
    const result = await Promise.all(req.body.map( async(data) => {
      const errorMessage = 'There is an error occured while looping trough the array';
      const { email, program, role } = data;
      const invitationCode = await getCode(program, role);
      if (!invitationCode) { error.push({errorCode: 422, errorMessage })}
      if (invitationCode.errorCode) { error.push(invitationCode) }
      const invitationResult = await invite(email, invitationCode);
      if (!invitationResult) { error.push({errorCode: 422, errorMessage })}
      if (invitationCode.errorCode) { error.push({errorCode:422, errorMessage})}
      return invitationResult;
    }));
    if (!result) { res.status(422).send({errorMessage: 'There is an error occured while inviting users.'}); return;}
    res.status(200).send({success: result, error});
  }
  catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

// functions
const getCode = (program, role) => {
  return new Promise( async (resolve, reject) => {
    let invitationCode;
    const code = invitationCodeService.convertToCode(program, role);
    if(!code) {
      reject({ errorCode: 422, errorMessage: 'Invalid Program or Role'});
    }
    try {
      invitationCode = await db.invitationCode.create({code});
      if (!invitationCode) { reject({ errorCode: 422, errorMessage: 'Invalid Program or Role'});}
      resolve(invitationCode.invitationCode);
    }
    catch (e) {
      reject({ errorCode: 500,errorMessage: 'Internal server error' });
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
      html: `<strong>Hello!</strong><br /><p>Please click the following link to signup: <a href="www.google.com/${invitationCode}">Sign up with code: ${invitationCode}<a></p></br><p>Sincerely,</p></br><p>GCOE-CQI Team</p>`
    };
    try {
      const mailResponse = await sgMail.send(msg);
      if (!mailResponse) { reject({ errorCode: 422, errorMessage: 'Invalid Credentials' }) }
      resolve({ message: `Successfully sent invite to ${email}` });
    }
    catch (e) {
      reject({ errorCode: 500,errorMessage: 'Internal server error' });
    }
  });
};