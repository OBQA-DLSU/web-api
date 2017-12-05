const authenticationRouter = require('./subroutes/authentication.route');
const invitationRouter = require('./subroutes/invitation.route');
module.exports = (app) => {
  app.get('/', function (req, res, next) {
    res.status(200).send({ message: 'Welcome to OBQA web-api!!'});
  });
  // auth
  app.use('/api/auth', authenticationRouter);
  app.use('/api/invitation', invitationRouter);
};
