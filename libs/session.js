var User = mongoose.model('User');
var session = {};
var redis = require("./redis")

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
			if(data)
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
						req.user = data.user;
						console.log("user",req.user);
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
module.exports = session;