const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User'); 
const Cart = require('/..models/Cart');


router.get('/', (req, res) => {
  res.redirect('/login');
});

router.get('/main/:username', async (req, res) => {
  try {
    const products = await Product.find().lean();
    const user = await User.findOne({ username: req.params.username }).lean();
    res.render('index', { 
      products, 
      username: req.params.username,
      isManager: user.type === 'manager'
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/catalog/:username', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('catalog', { products, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/search', async (req, res) => {
  const { q, username } = req.query;
  const products = await Product.find({ name: { $regex: q, $options: 'i' } }).lean();
  res.render('catalog', { products, username, query: q });
});

module.exports = router;

router.get('/checkout/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).lean();

        // fetch cart items
        const cartItems = await Cart.find({ username }).lean();

        // get total
        let total = 0;
        const formattedItems = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return {
                name: item.name,
                quantity: item.quantity,
                itemTotal: itemTotal.toFixed(2)
            };
        });

        res.render('checkout', {
            user,
            cartItems: formattedItems,
            total: total.toFixed(2)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});