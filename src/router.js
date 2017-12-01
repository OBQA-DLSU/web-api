const authenticationRouter = require('./subroutes/authentication.route');
const invitationCodeRouter = require('./subroutes/invitationCode.route');
module.exports = (app) => {
  app.get('/', function (req, res, next) {
    res.status(200).send({ message: 'Welcome to OBQA web-api!!'});
  });
  // auth
  app.use('/auth', authenticationRouter);
  app.use('/invitation-code', invitationCodeRouter);
};
