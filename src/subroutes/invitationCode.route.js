const express = require('express');
const Authentication = require('../api/authentication');
const invitationCodeRouter = express.Router();

const InvitationCode = require('../api/invitationCode');

invitationCodeRouter.route('/get-code')
.post(InvitationCode.getCode);

module.exports = invitationCodeRouter;