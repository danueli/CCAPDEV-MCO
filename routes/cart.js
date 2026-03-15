const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /cart/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId').lean();
    res.render('cart', { cart, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /cart/add/:username
router.post('/add/:username', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findOne({ username: req.params.username });
    let cart = await Cart.findOne({ userId: user._id });

    const existing = cart.items.find(i => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    const product = await Product.findById(productId);
    cart.totalPrice += product.price * parseInt(quantity);
    await cart.save();
    res.redirect(`/cart/${req.params.username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /cart/remove/:username
router.post('/remove/:username', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findOne({ username: req.params.username });
    const cart = await Cart.findOne({ userId: user._id });

    const removedItem = cart.items.find(i => i.productId.toString() === productId);
    if (removedItem) {
      const product = await Product.findById(productId);
      cart.totalPrice -= product.price * removedItem.quantity;
    }

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();
    res.redirect(`/cart/${req.params.username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
