const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // URL for product image
  description: { type: String, required: true },
  type: { type: String, required: true },
  brand: { type: String }, // URL for brand image
  category: { type: String, required: true }, // Category of the product
  price: { type: Number, required: true },
  discount: {type: Number},
});

// Export the Product model
module.exports = mongoose.model('Product', productSchema);
