var express = require('express');
var router = express.Router();
// Require controller modules.
var category_controller = require('../controllers/categoryController');
var item_controller = require('../controllers/itemController');
  
/// CATEGORY ROUTES ///

// GET catalog home page.
router.get('/', category_controller.index);

// GET request for creating a category. NOTE This must come before routes that display category (uses id).
router.get('/category/create', category_controller.category_create_get);

// POST request for creating category.
router.post('/category/create', category_controller.category_create_post);

// GET request to delete category.
router.get('/category/:id/delete', category_controller.category_delete_get);

// POST request to delete category.
router.post('/category/:id/delete', category_controller.category_delete_post);

// GET request to update category.
router.get('/category/:id/update', category_controller.category_update_get);

// POST request to update category.
router.post('/category/:id/update', category_controller.category_update_post);

// GET request for one category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all category items.
router.get('/categories', category_controller.category_list);


// CATEGORY ROUTES ///

// GET request for creating a category. NOTE This must come before routes that display category (uses id).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating category.
router.post('/item/create', item_controller.item_create_post);

// GET request to delete category.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete category.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update category.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update category.
router.post('/item/:id/update', item_controller.item_update_post);

// GET request for one category.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all category items.
router.get('/items', item_controller.item_list);

module.exports = router;

