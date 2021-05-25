var Item = require('../models/item');
var Category = require('../models/category');
const async = require('async');
const multer = require('multer')

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

exports.index = function(req, res) {

    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
    }, function(err, results) {
        res.render('index', { title: 'Groceries Iventory', error: err, data: results });
    });
};

//post photo

// Display list of all items.
exports.item_list = function(req, res, next) {

    Item.find()
      .sort([['name', 'ascending']])
      .exec(function (err, list_items) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('item_list', { title: 'ITEMS', item_list: list_items });
      });
  
  };

// Display detail page for a specific item.
exports.item_detail = function(req, res, next) {

    Item.findById(req.params.id)
    .exec(function (err, item) {
      if (err) { return next(err); }
      if (item==null) { // No results.
          var err = new Error('item copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('item_detail', { item:  item});
    })

};

// Display item create form on GET.
exports.item_create_get = function(req, res, next) {

    // Get all authors and categories, which we can use for adding to our item.
    async.parallel({
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('item_form', { title: 'Create Item', authors: results.authors, categories: results.categories });
    });

};

// Handle item create on POST.
exports.item_create_post = [
    // Convert the category to an array.
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category ==='undefined')
            req.body.category = [];
            else
            req.body.category = new Array(req.body.category);
        }
        next();
    },


    // Validate and sanitize fields.
    //body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('category.*').escape(),
    //body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('stock', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),


    // Process request after validation and sanitization.
    upload.single('img'),(req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var item = new Item(
            {
                name: req.body.name,
                summary: req.body.summary,
                category:req.body.category,
                price: req.body.price,
                stock: req.body.stock,
                measure: req.body.measure,
                img: req.file.filename
            });

            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/error messages.
    
                // Get all authors and categories for form.
                async.parallel({
                    categories: function(callback) {
                        Category.find(callback);
                    },
                }, function(err, results) {
                    if (err) { return next(err); }
    
                    // Mark our selected categories as checked.
                    for (let i = 0; i < results.categories.length; i++) {
                        if (item.category.indexOf(results.categories[i]._id) > -1) {
                            results.categories[i].checked='true';
                        }
                    }
                    res.render('item_form', { title: 'Create Item', categories:results.categories, item: item, errors: errors.array() });
                });
                return;
            }
            else {
                // Data from form is valid. Save item.
                item.save(function (err) {
                    if (err) { return next(err); }
                       //successful - redirect to new item record.
                       res.redirect(item.url);
                    });
            }
        }
    ];
    

// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {

    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.item==null) { // No results.
            res.redirect('/catalog/items');
        }
        // Successful, so render.
        res.render('item_delete', { title: 'Delete item', item: results.item } );
    });

};

// Handle item delete on POST.
exports.item_delete_post = function(req, res, next) {

    async.parallel({
        item: function(callback) {
          Item.findById(req.body.itemid).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            // item has no items. Delete object and redirect to the list of items.
            Item.findByIdAndRemove(req.body.itemid, function deleteitem(err) {
                if (err) { return next(err); }
                // Success - go to item list
                res.redirect('/catalog/categories')
            })
        }
    });
};

// Display item update form on GET.
exports.item_update_get = function(req, res, next) {

    // Get item, authors and categories for form.
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).populate('item').populate('category').exec(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.item==null) { // No results.
                var err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected categories as checked.
            for (var all_g_iter = 0; all_g_iter < results.categories.length; all_g_iter++) {
                for (var item_g_iter = 0; item_g_iter < results.item.category.length; item_g_iter++) {
                    if (results.categories[all_g_iter]._id.toString()===results.item.category[item_g_iter]._id.toString()) {
                        results.categories[all_g_iter].checked='true';
                    }
                }
            }
            res.render('item_formupdate', { title: 'Update Item', authors: results.authors, categories: results.categories, item: results.item });
        });

};

// Handle item update on POST.
exports.item_update_post = [

    // Convert the category to an array
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category==='undefined')
            req.body.category=[];
            else
            req.body.category=new Array(req.body.category);
        }
        next();
    },

    /// Validate and sanitize fields.
    //body('name', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('category.*').escape(),
    //body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    //body('stock', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    upload.single('img'),(req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Item object with escaped/trimmed data and old id.
        var item = new Item(
          { 
            name: req.body.name,
            summary: req.body.summary,
            category: (typeof req.body.category==='undefined') ? [] : req.body.category,
            price: req.body.price,
            stock: req.body.stock,
            measure: req.body.measure,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and categories for form.
            async.parallel({
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (item.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('item_formupdate', { title: 'Update Item',authors: results.authors, categories: results.categories, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theitem) {
                if (err) { return next(err); }
                   // Successful - redirect to item detail page.
                   res.redirect(theitem.url);
                });
        }
    }
];