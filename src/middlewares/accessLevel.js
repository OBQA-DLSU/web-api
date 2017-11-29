module.exports = {
  Admin: function (req, res, next) {
    const { role } = req.user;
    if (role > 1) {
      console.log('Intruder');
      res.status(400).send({error:'Unauthorized user!'});
    }else{
      console.log('OK');
      next();
    }
  }
};