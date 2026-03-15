const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('products', { 
      products, 
      username: req.query.username 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
