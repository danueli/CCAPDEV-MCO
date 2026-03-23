const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');

// get cart of a user based on their username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).send('User not found');

    let cart = await Cart.findOne({ userId: user._id }).populate('items.productId').lean();
    if (!cart) {
      cart = { userId: user._id, items: [], totalPrice: 0 };
    }

    res.render('cart', { cart, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// posts cart item to the cart of a user based on their username
router.post('/add/:username', async (req, res) => {
  try {
    const { productId } = req.body;
    let quantity = parseInt(req.body.quantity, 10);
    if (isNaN(quantity) || quantity < 1) quantity = 1;

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).send('User not found');

    const product = await Product.findById(productId);
    if (!product) return res.status(404).send('Product not found');

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [], totalPrice: 0 });
    }

    const existing = cart.items.find(i => i.productId.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    // Recalculate total for safety and accuracy
    cart.totalPrice = 0;
    let totalItems = 0;
    for (const item of cart.items) {
      const itemProduct = await Product.findById(item.productId);
      if (!itemProduct) continue;
      item.quantity = Math.max(1, item.quantity);
      cart.totalPrice += itemProduct.price * item.quantity;
      totalItems += item.quantity;
    }

    await cart.save();
    const payload = {
      success: true,
      message: 'Item added to cart',
      cartTotal: cart.totalPrice,
      cartCount: totalItems,
      cartUrl: `/cart/${req.params.username}`
    };
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json(payload);
    }

    // Non-AJAX fallback supports normal form POST
    res.redirect(`/cart/${req.params.username}`);
  } catch (err) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.status(500).send(err.message);
  }
});

//  remove item from cart
router.post('/remove/:username', async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).send('User not found');

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return res.redirect(`/cart/${req.params.username}`);

    const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.redirect(`/cart/${req.params.username}`);
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate total price to avoid negative rounding/errors
    cart.totalPrice = 0;
    for (const item of cart.items) {
      const itemProduct = await Product.findById(item.productId);
      if (!itemProduct) continue;
      cart.totalPrice += itemProduct.price * item.quantity;
    }

    await cart.save();
    res.redirect(`/cart/${req.params.username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// update quantity in cart
router.post('/update/:username', async (req, res) => {
  try {
    const { productId, delta } = req.body;
    const change = parseInt(delta, 10);
    if (isNaN(change) || change === 0) {
      return res.redirect(`/cart/${req.params.username}`);
    }

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).send('User not found');

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return res.redirect(`/cart/${req.params.username}`);

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.redirect(`/cart/${req.params.username}`);

    item.quantity = Math.max(1, item.quantity + change);

    // remove if set to 0 just in case
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    }

    cart.totalPrice = 0;
    for (const cartItem of cart.items) {
      const itemProduct = await Product.findById(cartItem.productId);
      if (!itemProduct) continue;
      cart.totalPrice += itemProduct.price * cartItem.quantity;
    }

    await cart.save();

    const payload = { success: true, message: 'Cart updated', cartTotal: cart.totalPrice };
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json(payload);
    }

    res.redirect(`/cart/${req.params.username}`);
  } catch (err) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.status(500).send(err.message);
  }
});

module.exports = router;
