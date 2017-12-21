const express = require('express');
const passport = require('passport');
const passportService = require('../services/passport.service');
const requireSignin = passport.authenticate('local', { session: false });
const Authentication = require('../api/authentication');
const authRoute = express.Router();

authRoute.route('/signin')
.post(requireSignin, Authentication.signin);
authRoute.route('/signup')
.post(Authentication.signup);

module.exports = authRoute;