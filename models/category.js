var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: {type: String, required: true},
    summary: {type: String, required: true},
    img: {type: String, required: true}
  }
);

// Virtual for book's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/catalog/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);