module.exports = (app) => {
  app.get('/', function(req, res, next) {
    res.send({message: 'Congratulations you updated Web API staging!!'});
  });
};