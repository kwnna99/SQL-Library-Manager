var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

function asyncHandler(cb){
    return async(req, res, next) => {
      try {
        await cb(req, res, next)
      } catch(error){
        // Forward error to the global error handler
        next(error);
      }
    }
}

/* GET books. */
router.get('/', asyncHandler(async (req, res) => {
    const books = await Book.findAll();
    res.render("index", { books, title: "Book Library" });
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
    res.render("new-book", {book:{}, title: "New Book" });
  });

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/" + book.id);
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", { book, errors: error.errors, title: "New Book" });
      } else {
        throw error;
      }  
    }
  }));
  
  /* GET individual book. */
  router.get("/:id", asyncHandler(async (req, res,next) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
      console.log(book);
      res.render("update-book", { book,title:"Update Book" });  
    } else {
      const err = new Error();
      err.status = 404;
      err.message = "No book exists with that ID";
      next(err)
    }
  })); 
  
  /* Update an book. */
  router.post('/:id', asyncHandler(async (req, res,next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if(book) {
        await book.update(req.body);
        res.redirect("/books/" + book.id); 
      } else {
          const err = new Error();
          err.status = 404;
          err.message = "No book exists with that ID";
          next(err);
      }
    } catch (error) {
      if(error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        console.log(error.errors);
        res.render("update-book", { book, errors: error.errors, title: "Update Book" });
      } else {
        throw error;
      }
    }
  }));

  /* Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res,next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books");
  } else {
    const err = new Error();
    err.status = 404;
    err.message = "No book exists with that ID";
    next(err);
  }
}));
  module.exports = router;