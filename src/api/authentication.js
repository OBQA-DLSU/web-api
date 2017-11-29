const db = require('../models');
const config = require('../../config');
const jwtService = require('../services/jwt.service');

const { user } = db;

exports.signin = function(req, res, next) {
  const user = {
    id: req.user.id,
    email: req.user.email,
    role: req.user.role
  }
  res.send({user, token: jwtService.tokenForUser(req.user)});
};
exports.signup = function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(422).send({error: 'You must provide email and password'});
  }
  user.findOne({
    where:{
      email
    }
  })
  .then(existingUser => {
    if(existingUser){
      return res.status(422).send({error: 'Email is in use'});
    }else{
      user.findAll({})
      .then(result => {
        if (result.length === 0) {
          return role = 1;
        }
      })
      .then(role => {
        user.create({
          email,
          password,
          role
        }, {
          individualHooks: true
        })
        .then(result => {
          const user = {
            id: result.id,
            email: result.email,
            role: result.role
          }
          if(!result){return res.status(500).send({error:'Cannot create new user'})}
          else {res.status(200).send({user,token:jwtService.tokenForUser(result)});}
        })
        .catch(err => {
          console.log(err);
          return res.status(500).send(err);
        })
      })
    }
  })
  .catch(err => {
    return res.status(500).send(err);
  });
}