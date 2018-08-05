var express = require('express')
require('dotenv').config()
var app = express()
var fs = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/config');
require("./redis")

var port = process.env.PORT || 8080; // set our port
// Connect to mongodb
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
//client.set("foo_rand000000000000", "OK");
 
// This will return a JavaScript String
// redis.get("foo_rand000000000000", function (err, reply) {
//     console.log('reply',reply.toString()); // Will print `OK`
// });
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Bootstrap models
fs.readdirSync(__dirname + '/models').forEach(function(file) {
	if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

require('./config/express')(app);
// Bootstrap routes
var router = express.Router();
require('./config/routes')(router);
app.use('/api', router);
app.listen(port,() => console.log('Listening on port ' + port))

module.exports = app;