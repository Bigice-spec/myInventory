var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true},
    summary: {type: String, required: true},
    category: [{type: Schema.Types.ObjectId, ref: 'Category', required: true}],
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    measure: {type: String, required: true},
    img: {type: String, required: true}
  }
);

// Virtual for book's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/catalog/item/' + this._id;
});

//Export model
module.exports = mongoose.model('Item', ItemSchema);