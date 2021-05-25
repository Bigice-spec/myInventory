var Category = require('../models/category');
var Item = require('../models/item');
var path = require('path');
const multer = require('multer')

var async = require('async');
const { body,validationResult } = require('express-validator');


//define storage for the images 
const storage = multer.diskStorage({
    //destination for files
    destination: function(req, file, callback){
      callback(null, './public/uploads')
    },
    //add back the extension
    filename: function(req, file, callback){
      callback(null, Date.now() + file.originalname)
    }
  })
  
  //upload parameters for multer
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 3,
    }
  })

//exports.index = function(req, res) {
//
//    async.parallel({
//        category_count: function(callback) {
//            Category.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
//        },
//    }, function(err, results) {
//        res.render('index2', { title: 'Groceries Iventory', error: err, data: results });
//    });
//};

exports.index = function(req, res, next) {

    Category.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('index', { title: 'CATEGORIES', category_list: list_categories });
      });
};


// Display list of all categories.
exports.category_list = function(req, res, next) {

    Category.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_categories) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('category_list', { title: 'CATEGORIES', category_list: list_categories });
      });
  
  };

// Display detail page for a specific category.
exports.category_detail = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },
  
        category_items: function(callback) {
            Item.find({ 'category': req.params.id })
              .exec(callback);
        },
  
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items } );
    });
  
  };
  

// Display category create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create category'});
};

// Handle category create on POST.
exports.category_create_post = [

    // Validate and sanitize fields.
    //body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('img', 'Image not picked.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    upload.single('img'),(req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category_form', { title: 'Create Category', category: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an category object with escaped and trimmed data.
            var category = new Category(
                {
                    name: req.body.name,
                    summary: req.body.summary,
                    img: req.file.filename,
                });
            category.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new category record.
                res.redirect(category.url);
            });
        }
    }
];

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_items: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
          },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/catalog/categories');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete category', category: results.category , category_items: results.category_items} );
    });

};

// Handle category delete on POST.
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category: function(callback) {
          Category.findById(req.body.categoryid).exec(callback)
        },
        category_items: function(callback) {
            Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.category_items.length > 0) {
            // Categoryr has books. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.categoty, category_items: results.category_items } );
            return;
        }
        else {
            // category has no categories. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.categoryid, function deletecategory(err) {
                if (err) { return next(err); }
                // Success - go to category list
                res.redirect('/catalog/categories')
            })
        }
    });
};

// Display category update form on GET.
exports.category_update_get = function(req, res, next) {

    Category.findById(req.params.id, function(err, category) {
        if (err) { return next(err); }
        if (category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('category_formupdate', { title: 'Update Category', category: category });
    });
  
  };

// Handle category update on POST.
exports.category_update_post = [
 
    // Validate and sanitze the name field.
    body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
        // Extract the validation errors from a request .
        const errors = validationResult(req);
  
    // Create a category object with escaped and trimmed data (and the old id!)
        var category = new Category(
          {
            name: req.body.name,
            summary: req.body.summary,
          _id: req.params.id
          
          }
        );
  
  
        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('category_formupdate', { title: 'Update category', category: category, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
                if (err) { return next(err); }
                   // Successful - redirect to category detail page.
                   res.redirect(thecategory.url);
                });
        }
    }
  ];