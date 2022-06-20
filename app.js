var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var booksRouter = require('./routes/books');

const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
  await sequelize.sync({ force: true });
})();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/books', booksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404,"The page you were looking for was not found!"));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.error = err;
  if(err.status!=404){
    err.message= 'Oops! Looks like something went wrong.';
    err.status=(err.status||500);
    res.status(err.status);
    res.render('error',{err,title:err.message});
  }else{
    res.status(err.status);
    res.render('page-not-found',{err,title:err.message});
  }
});

module.exports = app;
