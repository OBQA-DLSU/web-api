module.exports = (app) => {
  app.get('/', function(req, res, next) {
    res.send({message: 'Welcome to web-api this is a new branch!!'});
  });
};