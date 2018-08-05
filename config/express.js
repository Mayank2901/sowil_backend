var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var csrf = require('csurf');
var winston = require('winston');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var env = process.env.NODE_ENV || 'development';
var config = require('./config');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var expressValidator = require('express-validator');
// var docGenerator = require('yaag-nodejs');
require('events').EventEmitter.defaultMaxListeners = Infinity;

module.exports = function(app) {
  // winston.emitErrs = true;

  // var logger = new winston.createLogger({
  //   transports: [
  //     new(winston.transports.Console)()
  //   ]
  // });



  // module.exports = logger;
  // module.exports.stream = {
  //   write: function(message, encoding) {

  //     logger.info(message);
  //   }
  // };


  // bodyParser should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  // app.use(expressValidator());
  app.use(expressValidator({
    customValidators: {
      isArray: function(value) {
        return Array.isArray(value);
      },
      gte: function(param, num) {
        return param.length >= num;
      }
    }
  }));

  app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  app.use(cookieParser());
  app.use(cookieSession({
    secret: 'thisisareallylongandbigsecrettoken'
  }));
  // app.use(session({
  //   resave: true,
  //   saveUninitialized: true,
  //   secret: 'thisisareallylongandbigsecrettoken',
  //   store: new mongoStore({
  //     url: config.db,
  //     collection: 'sessions'
  //   })
  // }));

  app.set('x-powered-by', false);


  // adds CSRF support
  // if (process.env.NODE_ENV != 'test') {

  // app.use(csrf());
  // app.use(function(err, req, res, next) {
  //   if (req.url != '/api/users/session' && req.url != '/api/users') {

  //     if (err && err.code == 'EBADCSRFTOKEN') {
  //       res.status(403)
  //       res.send({
  //         error: 'session expired'
  //       })
  //     } else return next();
  //   } else return next();
  // });
  // }

  //CORS middleware
  app.use(function(req, res, next) {
    var origin = req.get('origin');
    res.header('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override,Authorization, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
  });
};