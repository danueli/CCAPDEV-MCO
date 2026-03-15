const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// get cart of a user based on their usernam
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId').lean();
    res.render('cart', { cart, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// posts cart item to the cart of a user based on their username
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

//  remove item from cart
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
