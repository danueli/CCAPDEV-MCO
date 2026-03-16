const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User'); 

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