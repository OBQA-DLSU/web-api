const express = require('express');
const invitationRouter = express.Router();
const Invitation = require('../api/invitation');

invitationRouter.route('/')
.post(Invitation.invitation)

module.exports = invitationRouter;
