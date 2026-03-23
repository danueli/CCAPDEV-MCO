const express = require('express');
const router = express.Router();
const order = require('../models/Order');
const product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// get order based on username (TO BE VERIFIED)

router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    const order = await Order.findOne({ userId: user._id }).populate('items.productId').lean();
    res.render('order', { order, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


