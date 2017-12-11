const authenticationRouter = require('./subroutes/authentication.route');
const invitationRouter = require('./subroutes/invitation.route');
const courseRouter = require('./subroutes/course.route');
const sopiRouter = require('./subroutes/sopi.route');
const myClassRouter = require('./subroutes/myClasses.route');


module.exports = (app) => {
  app.get('/', function (req, res, next) {
    res.status(200).send({ message: 'Welcome to OBQA web-api!!'});
  });
  app.use('/api/auth', authenticationRouter);
  app.use('/api/invitation', invitationRouter);
  app.use('/api/course', courseRouter);
  app.use('/api/sopi', sopiRouter);
  app.use('/api/myClass', myClassRouter);
};
