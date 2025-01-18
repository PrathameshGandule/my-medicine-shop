const express = require('express');
const Product = require('../models/product');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// GET route to fetch all products with search functionality
router.get('/', verifyToken, authorizeRoles("admin", "manager", "user"), async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    // If search parameter exists, create a search query
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },          // Case-insensitive name search
          { description: { $regex: search, $options: 'i' } },   // Case-insensitive description search
          { category: { $regex: search, $options: 'i' } },      // Case-insensitive category search
          { manufacturer: { $regex: search, $options: 'i' } }   // Case-insensitive manufacturer search
        ]
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET route to fetch a single product by ID
// is this route duplicate ?
// router.get('/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// POST route to add a new product
// is this route duplicate ?
// router.post('/', async (req, res) => {
//   const product = new Product(req.body);
//   try {
//     await product.save();
//     res.status(201).json(product);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

module.exports = router;