var mongoose = require('mongoose');
var fs = require('fs');
var config = require('./config')

module.exports = function(router) {

  // Bootstrap controllers
  fs.readdirSync(config.root + '/controllers').forEach(function(file) {
    if (~file.indexOf('.js')) {
      var route = require(config.root + '/controllers/' + file).controller(router);
    }
  });


  router.use(function(err, req, res, next) {
    // treat as 404
    if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }


    console.error(err.stack);
    res.status(500).send({
      error: err.stack
    });


  });
  // assume 404 since no middleware responded
  router.use(function(req, res, next) {
    res.status(404).send({
      url: req.originalUrl,
      error: 'Not found'
    });
  });

};