var mongoose = require('mongoose');
var User = mongoose.model('User');
var session = {};
var redis = require("../redis")

var response = {
	error:false,
	code:"",
	data:null,
	userMessage:''
};
var SendResponse = function(res,status){
	return res.status(status || 200).send(response);
};

/*********************
	Checking for token of loggedin user
*********************/


session.checkToken = function(req,res,next){

	console.log("session");
	var bearerToken;
	//console.log('rh==',req.headers);
	var bearerHeader = req.headers["authorization"];
    if (typeof(bearerHeader) !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    }
	var token = bearerToken || req.body.token || req.query.token;
	redis.get(token, function (err, reply) {
    	if(err){
			console.log('err:',err)
			response.error = true;
			response.code = 10901;
			response.userMessage = "There was a problem with the request, please try again."
			return SendResponse(res,500);
		}
		else{
			console.log('reply',reply)
			if(reply)
			{ 	// Horray!! Your session exists.
				//find user in mongo
				User
				.findOne({_id:reply})
				.lean()
				.exec(function(err,data){
					if(err){
						console.log('err:',err)
						response.error = true;
						response.code = 10901;
						response.userMessage = "There was a problem with the request, please try again."
						return SendResponse(res,500);
					}
					else{
						req.user = {
							username: data.username,
							_id: data._id,
							type: data.type,
						};
						console.log("user",req.user,data);
						return next();
					}
				});
			}
			else
			{
				response.error = true;
				response.userMessage = "Your session doesn't exists.";
				return SendResponse(res,403);
			}
		}
	});
};

/*********************
	checkToken Ends
*********************/

/****************************************
	Checking for admin
*****************************************/


session.checkAdmin = function(req,res,next){

	console.log("session");
	var bearerToken;
	//console.log('rh==',req.headers);
	var bearerHeader = req.headers["authorization"];
    if (typeof(bearerHeader) !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    }
	var token = bearerToken || req.body.token || req.query.token;
	redis.get(token, function (err, reply) {
    	if(err){
			console.log('err:',err)
			response.error = true;
			response.code = 500;
			response.userMessage = "There was a problem with the request, please try again."
			return SendResponse(res,500);
		}
		else{
			if(reply){
				// Horray!! Your session exists.
				//find user in mongo
				User
				.findOne({_id:reply})
				.lean()
				.exec(function(err,data){
					if(err){
						console.log('err:',err)
						response.error = true;
						response.code = 500;
						response.userMessage = "There was a problem with the request, please try again."
						return SendResponse(res,500);
					}
					else{
						console.log('data',data)
						req.user = data.user;
						if(data.type == 0){
							return next();
						}
						else{
							response.error = true;
							response.code = 500;
							response.userMessage = "There was a problem with the request, please try again."
							return SendResponse(res,500);
						}
						console.log("user",req.user);
					}
				});
			}
			else{
				response.error = true;
				response.userMessage = "Your session doesn't exists.";
				return SendResponse(res,403);
			}
		}
	});
};

/*********************
	Ends
*********************/
module.exports = session;