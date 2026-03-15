const express = require('express');
const router = express.Router();        // ← this line is missing
const Product = require('../models/Product');

router.get('/catalog/:username', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('catalog', { products, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/main/:username', async (req, res) => {
  try {
    res.render('main', { username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/', (req, res) => {
  res.redirect('/login');
});

module.exports = router;               // ← make sure this is at the bottom