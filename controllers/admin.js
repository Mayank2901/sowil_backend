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
    .delete(session.checkAdmin,methods.deleteUser)

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
          response.code = 500;
          response.errors = errors;
          response.userMessage = 'error';
          return SendResponse(res, 500);
        } 
        else if (user) {
          console.log("email exist");
          response.error = true;
          response.code = 409;
          response.userMessage = 'Email already in use.'
          response.data = null;
          response.errors = null;
          return SendResponse(res, 409);
        }
        else{
          console.log("user does not exist",req.body.type,req.body.type == "Doctor");
          var newUser = new User({
            username: req.body.email,
            type: req.body.type == "Doctor" ? "2" : "1",
            password: req.body.password,
          });
          newUser.save(function(err, user) {
            if (err) {
              response.error = true;
              response.code = 400;
              response.userMessage = 'Could not save user to database'
              response.data = null;
              response.errors = err;
              return SendResponse(res, 400);
            }
            else {
              console.log('user',user)
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
    update = {$set : {type : req.body.type == "Doctor" ? 2 : 1}}
  }
  if(req.body.password){
    update = {$set : {password : req.body.password}}
  }
  console.log('update',update,req.body.type,req.body.email)

  User.findOneAndUpdate({
    username: req.body.email
  }, update, {new : true}, function(err, user) {
    if (err){
        response.error = true;
        response.code = 500;
        response.errors = err;
        response.data = null
        response.userMessage = 'An error occured during updation.';
        return SendResponse(res, 500);
      }
      else{
        console.log('user',user)
        response.userMessage = 'User Edited.'
        response.data = {
          user: {
            email: user.email
          }
        };
        response.errors = null;
        response.error = false;
        response.code = 200;
        return SendResponse(res, 200);
      }
  });
};
/*********************
  Ends
*********************/


/*==============================================
***   method to get doctor/patient  ***
================================================*/
methods.getUsers = function(req, res) {
  console.log('type',req.params.type)
  User.find({
    type: req.params.type
  }, function(err, user) {
    if (err){
      response.error = true;
      response.code = 10901;
      response.errors = err;
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

/*==============================================
***   method to delete doctor/patient  ***
================================================*/
methods.deleteUser = function(req, res) {
  console.log('id',req.body.id)
  User.findOneAndRemove({
    _id: req.body.id
  })
  .lean()
  .exec(function(err) {
    if (err) {
      console.log('err:', err);
      response.error = true;
      response.code = 500;
      response.data = null
      response.userMessage = 'There was a problem with the request, please try again.'
      response.errors = err;
      return SendResponse(res, 500);
    } else {
      response.data = null;
      response.error = false;
      response.userMessage = 'User Deleted successfully';
      response.code = 200;
      response.errors = null;
      return SendResponse(res, 200);
    }
  });
};
/*********************
  Ends
*********************/