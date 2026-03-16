const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /products — show all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.render('products', { 
      products, 
      username: req.query.username 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /products/:id — product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    res.render('product-detail', { 
      product, 
      username: req.query.username 
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /products/add — manager adds product
router.post('/add', async (req, res) => {
  try {
    const { name, price, category, stock, description, image, username } = req.body;
    const newProduct = new Product({ name, price, category, stock, description, image });
    await newProduct.save();
    res.redirect(`/main/${username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;