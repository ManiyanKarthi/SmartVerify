var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var expressMongoDb = require('express-mongo-db');
var cors = require('cors')
var db = require('./config/dbconnection');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var invoiceRouter = require('./routes/invoice');

var app = express();
//const expressValidator = require('express-validator');

//app.use(expressValidator());
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/invoice', invoiceRouter);

// const db_url = 'mongodb://localhost:27017/smart_vision';
//app.use(expressMongoDb(db_url));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

const url = 'mongodb://localhost:27017/smart_vision';
const dbName = 'smart_vision';
db.connect(url,dbName,function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
	  /*db.get().collection('invoice').findOne({type:1},(err, res)=> {
		console.log(res,'res---');
	  })*/
  }
});

var a='2018-07-26';var b='2018-07-26';
if(a==b){
  console.log(a,'truueee');
}else{
  console.log(a,'falsee');
}

/*
const url = 'mongodb://localhost:27017/smart_vision';
// Database Name
const dbName = 'smart_vision';

//var dbo; 
// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server"); 
  const dbo = db.db(dbName);  
  app.set('dbo', dbo);  
  /*dbo.collection("invoice").findOne({}, function(err, result) {
    if (err) throw err;
    console.log(result);
    //db.close();
  }); */ 
  //client.close();
/*});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
