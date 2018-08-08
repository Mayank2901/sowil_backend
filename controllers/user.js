var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var session = require('./../libs/session');
var redis_client = require("../redis")
var crypto = require('crypto');

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

	router.route('/users')
    .post(session.checkToken,methods.userSignup)

  router.route('/users/session')
    .post(methods.userLogin)
    .delete(session.checkToken,methods.userLogout)

  router.route('/ping')
    .get(session.checkToken,methods.getUser)

  router.route('/users/type/:type')
    .get(session.checkToken,methods.getTypeUsers)
}


/*==============================================
***   method to create new User  ***
================================================*/
methods.userSignup = function(req, res) {
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
      username: req.body.email
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
	          type: req.body.type == "Doctor" ? 2 : 1,
	          password: req.body.password,
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
	            var token = jwt.sign({
	                email: req.body.email
	            }, 'thisisareallylongandbigsecrettoken', {
	                expiresIn: "1d"
	            });
              redis_client.set(token, user._id, 'EX', 24*60*60);
	            response.userMessage = 'Signup done, you are being redirected to dashboard'
              response.data = {
                token: token,
                user: {
                  email: user.email,
                  _id: user._id,
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
    userSignup Ends
*********************/

/*********************
  Create user login and send session info
*********************/
methods.userLogin = function(req, res, next) {
  NullResponseValue();
  //Check for any errors.
  //crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  req.checkBody('email', 'email is required.').notEmpty();
  req.checkBody('password', 'Password is required, and should be between 8 to 80 characters.').notEmpty();
  var errors = req.validationErrors(true);
  if (errors) {
    console.log('err:', errors);
    response.error = true;
    response.errors = errors;
    response.userMessage = 'Validation errors';
    response.data = null;
    response.code = 400;
    return SendResponse(res, 400);
  }
  else {
    User.findOne({
      username: req.body.email
    }, function(err, user) {
      if (err){
        response.error = true;
        response.code = 10901;
        response.errors = errors;
        response.userMessage = 'error';
        return SendResponse(res, 500);
      }
      else{
        var hash = crypto.createHmac('sha1', user.salt).update(req.body.password).digest('hex')
        if (hash == user.hashed_password){
          var token = jwt.sign({
            email: req.body.email
          }, 'thisisareallylongandbigsecrettoken', {
            expiresIn: "1d"
          });
          redis_client.set(token, user._id, 'EX', 24*60*60);
          response.error = false;
          response.code = 200;
          response.userMessage = 'Thanks for logging in.';
          response.data = {
              token: token,
              user: {
                email: user.username,
                _id: user._id
              }
          };
          response.errors = null;
          console.log('response',response)
          return SendResponse(res, 200);
        }
        else{
          response.error = true;
          response.code = 401; //user Doesn't exists
          response.data = null;
          response.userMessage = "Wrong password!!";
          console.log('response',response)
          return SendResponse(res, 401);
        }
      }
    });
  }
};

/*********************
  userLogin ends
*********************/

/*********************
  Get user
*********************/
methods.getUser = function(req,res){
  NullResponseValue();
  console.log("USER is here",req.user);
  response.data = {
    user : req.user
  }
  response.error = false
  response.userMessage = '';
  response.code = 200;
  response.errors = null;
  return SendResponse(res,200);
};

/*********************
  getUser ends
*********************/


/*********************
        user logout
*********************/
methods.userLogout = function(req, res) {
  NullResponseValue();
  Session.findOneAndRemove({
    user: req.user._id
  })
  .lean()
  .exec(function(err) {
    if (err) {
      console.log('err:', err);
      response.error = true;
      response.code = 10903;
      response.userMessage = 'There was a problem with the request, please try again.'
      return SendResponse(res, 500);
    } else {
      response.data = null;
      response.error = false;
      response.userMessage = 'User Logged Out successfully';
      response.code = 200;
      response.errors = null;
      return SendResponse(res, 200);
    }
  });
};
/*********************
        userLogout Ends
*********************/

/*********************
  Get Type Users
*********************/
methods.getTypeUsers = function(req,res){
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