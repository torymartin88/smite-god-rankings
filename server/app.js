var express = require('express'),
	http = require('http'),
	path = require('path'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	hoganExpress = require('hogan-express'),
	cookieParser = require('cookie-parser'),
	config = require('./config');


// Database
var mongo = require('mongodb'),
	monk = require('monk');

var db = monk('localhost:27017/tierlists');

// App includes
var routes = require('./routes/index');
// var lists = require('./routes/lists');


// Create Server
var app = express();

// view engine setup
app.set('view engine', 'html');
app.set('layout', 'layout');
// app.set('partials', {foo: 'foo'});
// app.enable('view cache');
app.engine('html', hoganExpress);
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;