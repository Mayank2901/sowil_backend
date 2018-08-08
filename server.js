var express = require('express')
require('dotenv').config()
var app = express()
var server = require('http').createServer(app);
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config');

var port = process.env.PORT || 8080; // set our port
// Connect to mongodb
mongoose.Promise = global.Promise;
var connect = function() {
	mongoose.connect(config.db, config.mongoose);
};
connect();

var response = {
	error: false,
	data: null,
	userMessage: '',
	errors: null
};

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(__dirname + '/models').forEach(function(file) {
	if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

var io = require('socket.io')(server);

fs.readdirSync(__dirname + '/socket').forEach(function(file) {
	if (~file.indexOf('.js')) require(__dirname + '/socket/' + file)(io);
});

require('./config/express')(app);
// Bootstrap routes
var router = express.Router();
require('./config/routes')(router);
app.use('/api', router);

var User = mongoose.model('User');

function createAdmin(){
  	User.findOne({
      username: 'admin'
    }, function(err, user) {
      if (err){
          console.log('error occured',err)
        } 
        else if (user) {
          console.log("user exist");
        }
        else{
          console.log("user does not exist");
          var newUser = new User({
            username: 'admin',
            password: 'admin',
            type: 0
          });
          newUser.save(function(err, user) {
            if (err) {
              console.log('error occured in saving user to db',err)
            }
            else {
              console.log('admin created')
            }
          });
        }
    });
}

app.listen(port,() => console.log('Listening on port ' + port))

createAdmin();

module.exports = app;