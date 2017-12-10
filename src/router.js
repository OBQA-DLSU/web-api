const authenticationRouter = require('./subroutes/authentication.route');
const invitationRouter = require('./subroutes/invitation.route');
const courseRouter = require('./subroutes/course.route');

var multer  = require('multer');
var upload = multer();


module.exports = (app) => {
  app.get('/', function (req, res, next) {
    res.status(200).send({ message: 'Welcome to OBQA web-api!!'});
  });
  app.use('/api/auth', authenticationRouter);
  app.use('/api/invitation', invitationRouter);
  app.use('/api/course', courseRouter);
};
