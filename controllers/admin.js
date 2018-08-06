var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var session = require('./../libs/session');
var redis_client = require("../redis")

var response = {
  error: false,
  code: "",
  data: null,
  userMessage: '',
  errors: null
};

var NullResponseValue = function() {
  response = {
    error: false,
    code: "",
    data: null,
    userMessage: '',
    errors: null
  };
  return true;
};
var SendResponse = function(res, status) {
  res.status(status || 200).send(response);
  NullResponseValue();
};

var methods = {};
/*
Routings/controller goes here
*/
module.exports.controller = function(router) {

	router.route('/users/modify')
    .post(session.checkAdmin,methods.createUser)
    .put(session.checkAdmin,methods.editUser)

  router.route('/users/all/:type')
    .get(session.checkAdmin,methods.getUsers)
}

/*==============================================
***   method to create new doctor/patient  ***
================================================*/
methods.createUser = function(req, res) {
  //Check for any errors.
  req.checkBody('email', 'Valid Email address is required.').notEmpty().isEmail();
  req.checkBody('password','Password is required, and should be between 8 to 80 characters.').notEmpty().len(8, 80);
  req.checkBody('confirm_password', 'Confirm password is required, and should be same as password.').notEmpty().equals(req.body.password);
  req.checkBody('type', 'Type cannot be empty.').notEmpty();

  var errors = req.validationErrors(true);
  if (errors) {
    console.log('err:', errors)
    response.error = true;
    response.code = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return SendResponse(res, 400);
  }
  else{
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err){
          response.error = true;
          response.code = 10901;
          response.errors = errors;
          response.userMessage = 'error';
          return SendResponse(res, 500);
        } 
        else if (user) {
          console.log("email exist");
          response.error = true;
          response.code = 10901;
          response.userMessage = 'Email already in use.'
          response.data = null;
          response.errors = null;
          return SendResponse(res, 409);
        }
        else{
          console.log("user doest not exist");
          var newUser = new User({
            email: req.body.email,
            type: req.body.type == "doctor" ? 2 : 1,
            password: req.body.password,
            name:req.body.name
          });
          newUser.save(function(err, user) {
            if (err) {
              response.error = true;
              response.code = 10800;
              response.userMessage = 'Could not save user to database'
              response.data = null;
              response.errors = null;
              return SendResponse(res, 400);
            }
            else {
              response.userMessage = 'New User Created.'
              response.data = {
                user: {
                  email: user.email,
                  password: req.body.password,
                }
              };
              response.error = false;
              response.code = 200;
              return SendResponse(res, 200);
            }
          });
        }
    });
  }
};
/*********************
  Ends
*********************/

/*==============================================
***   method to edit doctor/patient  ***
================================================*/
methods.editUser = function(req, res) {
  //Check for any errors.
  var update = {}

  if(req.body.type){
    update = {$set : {type : req.body.type == "doctor" ? 2 : 1}}
  }
  if(req.body.password){
    update = {$set : {password : req.body.password}}
  }


  var errors = req.validationErrors(true);
  if (errors) {
    console.log('err:', errors)
    response.error = true;
    response.code = 400;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    return SendResponse(res, 400);
  }
  else{
    User.findOneAndUpdate({
      email: req.body.email
    }, update, {new : true}, function(err, user) {
      if (err){
          response.error = true;
          response.code = 10901;
          response.errors = errors;
          response.userMessage = 'error';
          return SendResponse(res, 500);
        }
        else{
          response.userMessage = 'User Edited.'
          response.data = {
            user: {
              email: user.email
            }
          };
          response.error = false;
          response.code = 200;
          return SendResponse(res, 200);
        }
    });
  }
};
/*********************
  Ends
*********************/


/*==============================================
***   method to get doctor/patient  ***
================================================*/
methods.getUsers = function(req, res) {
  //Check for any errors.

  User.findAll({
    type: req.param.type
  }, function(err, user) {
    if (err){
      response.error = true;
      response.code = 10901;
      response.errors = errors;
      response.userMessage = 'error';
      return SendResponse(res, 500);
    }
    else{
      response.userMessage = 'Users Found.'
      response.data = {
        user: user
      };
      response.error = false;
      response.code = 200;
      return SendResponse(res, 200);
    }
  });
};
/*********************
  Ends
*********************/