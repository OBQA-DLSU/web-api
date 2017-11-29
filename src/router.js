const passportService = require('./services/passport.service');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignin = passport.authenticate('local', { session: false });
const { Admin } = require('./middlewares/accessLevel');

const Authentication = require('./api/authentication');

module.exports = (app) => {
  app.get('/', function (req, res, next) {
    res.status(200).send({ message: 'Welcome to OBQA web-api!!'});
  });
  // auth
  app.post('/auth/signin', requireSignin, Authentication.signin);
  app.post('/auth/signup', Authentication.signup);
};
