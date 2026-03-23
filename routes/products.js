const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Reviews');

// GET /products — show all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean();

    const username = req.query.username;
    let isManager = false;
    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username }).lean();
      isManager = user && user.type === 'manager';
    }

    res.render('products', { 
      products, 
      username,
      isManager
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /products/add-product — show add product form
router.get('/add-product', (req, res) => {
  res.render('add_product', { username: req.query.username });
});

// POST /products/add-product — manager adds product
router.post('/add-product', async (req, res) => {
  try {
    const { name, price, category, stock, description, image, username } = req.body;
    const newProduct = new Product({ name, price, category, stock, description, image });
    await newProduct.save();
    res.redirect(`/main/${username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /products/:id — product detail with reviews
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send('Product not found');

    const reviews = await Review.find({ productId: req.params.id }).lean();

    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = (totalRating / reviews.length).toFixed(1);
    }

    const username = req.query.username;
    let isManager = false;
    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username }).lean();
      isManager = user && user.type === 'manager';
    }

    res.render('product-detail', {
      product,
      reviews,
      avgRating,
      reviewCount: reviews.length,
      username,
      isManager
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /products/:id/review — add review
router.post('/:id/review', async (req, res) => {
  try {
    const { username, reviewerName, rating, comment } = req.body;
    let userId = null;

    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username }).lean();
      if (user) userId = user._id;
    }

    const review = new Review({
      productId: req.params.id,
      userId,
      rating: parseInt(rating, 10),
      comment: `${reviewerName}: ${comment}`
    });
    await review.save();
    res.json({ success: true, message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;