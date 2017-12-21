const authenticationRouter = require('./route/authentication.route');
const invitationRouter = require('./route/invitation.route');
const courseRouter = require('./route/course.route');
const sopiRouter = require('./route/sopi.route');
const myClassRouter = require('./route/myClass.route');
const studentRouter = require('./route/student.route');
const assessmentRouter = require('./route/assessment.route');
const gradeRouter = require('./route/grade.route');

module.exports = (app) => {
  app.get('/', welcomePage);
  app.use('/api/auth', authenticationRouter);
  app.use('/api/invitation', invitationRouter);
  app.use('/api/course', courseRouter);
  app.use('/api/sopi', sopiRouter);
  app.use('/api/myClass', myClassRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/assessment', assessmentRouter);
  app.use('/api/grades', gradeRouter);
};


const welcomePage = (req, res, next) => {
  res.status(200).send({ message: `Welcome to OBQA web-api!!` });
};
