var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config/config');

var app = express();

var mongoose = require('mongoose');
var db = mongoose.connection;

// connect to the db
mongoose.connect(config.db);

app.use(logger('dev'));
app.use(bodyParser.json());


app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept');
  // If someone calls with method OPTIONS, let's display the allowed methods on our API
  if (req.method == 'OPTIONS') {
    res.status(200);
    res.write("Allow: GET,PUT,POST,DELETE,OPTIONS");
    res.end();
  } else {
    next();
  }
});

// start db
db.on('error', console.error);
db.once('open', function() {
  
  /**
   *
   * In case we want other routes to be unprotected, let's just make sure that
   * /beer* and /user* are validated, the rest will not be authenticated like the
   * /login route for instance
   * 
   */
  app.all('/beer*', [require('./auth/validate')]);
  app.all('/user*', [require('./auth/validate')]);
  
  app.use('/',require('./routes'));
  
  // If no route is matched, return a 404
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // Start the server
  app.set('port', process.env.PORT || 3000);
  
  var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
  });
});
