const express = require('express');
const Cart = require('../models/cart');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Add an item to the cart
router.post('/add', verifyToken, authorizeRoles("user"), async (req, res) => {
  let { productId, quantity } = req.body;
  quantity = parseInt(quantity);  
  let userId = req.user.id;
  // console.log(userId);
  // console.log(req.user.id)
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        // Increment quantity if product exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new product to cart
        cart.items.push({ productId, quantity });
      }
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Get the user's cart
// only admins and user can access this route
// user can only access their own cart
router.get('/', verifyToken, authorizeRoles("user"), async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      // Return an empty cart if none exists
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});


// Remove an item from the cart

router.delete('/remove', verifyToken, authorizeRoles("user"), async (req, res) => {
  const { productId } = req.body; // Ensure the request body contains both userId and productId
  let userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      // Filter out the product to remove it from the cart
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Update quantity of an existing product

router.put('/update', verifyToken, authorizeRoles("user"), async (req, res) => {
  let { productId, quantity } = req.body;
  let userId = req.user.id;
  quantity = parseInt(quantity);

  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity; // Update quantity
        await cart.save();
        res.status(200).json(cart); // Send the updated cart
      } else {
        res.status(404).json({ error: 'Product not found in cart' });
      }
    } else {
      res.status(404).json({ error: 'Cart not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

module.exports = router;
