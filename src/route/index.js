const authenticationRouter = require('./authentication.route');
const invitationRouter = require('./invitation.route');
const courseRouter = require('./course.route');
const sopiRouter = require('./sopi.route');
const myClassRouter = require('./myClass.route');
const studentRouter = require('./student.route');
const assessmentRouter = require('./assessment.route');
const gradeRouter = require('./grade.route');
const instructorRouter = require('./instructor.route');
const assessmentDiscussionRouter = require('./assessmentDiscussion.route');
const googleDriveRouter = require('./googleDrive.route');
const evidenceRouter = require('./evidence.route');

const welcomePage = (req, res, next) => {
  res.status(200).send({ message: `Welcome to OBQA web-api!!` });
};

module.exports = (app) => {
  app.get('/', welcomePage);
  app.use('/api/auth', authenticationRouter);
  app.use('/api/invitation', invitationRouter);
  app.use('/api/course', courseRouter);
  app.use('/api/sopi', sopiRouter);
  app.use('/api/myClass', myClassRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/assessment', assessmentRouter);
  app.use('/api/grade', gradeRouter);
  app.use('/api/instructor', instructorRouter);
  app.use('/api/assessmentDiscussion', assessmentDiscussionRouter);
  app.use('/api/google-drive', googleDriveRouter);
  app.use('/api/evidence', evidenceRouter);
};
