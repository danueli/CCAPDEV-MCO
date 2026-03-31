const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Review = require('../models/Reviews');

// --- Multer config: save uploaded images to /public/uploads/ ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public'));
  },
  filename: function (req, file, cb) {
    // e.g. "1714000000000-croissant.jpg" — unique timestamp prefix
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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
      isAdmin
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /products/add-product — show add product form
router.get('/add-product', (req, res) => {
  res.render('add_product', { username: req.query.username });
});

// POST /products/add-product — manager adds product (with image file upload)
router.post('/add-product', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, stock, description, username } = req.body;

    // Build the public-facing image path (served as /uploads/filename.jpg)
    const imagePath = req.file ? req.file.filename : '';

    const newProduct = new Product({ name, price, category, stock, description, image: imagePath });
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
      isAdmin
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

// POST /products/:productId/review/:reviewId/edit — update review
router.post('/:productId/review/:reviewId/edit', async (req, res) => {
  try {
    const { username, rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username }).lean();
      if (!user || review.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized: You can only edit your own reviews' });
      }
    }

    const extractName = comment.split(':')[0].trim();
    review.rating = parseInt(rating, 10);
    review.comment = `${extractName}: ${comment.substring(comment.indexOf(':') + 1).trim()}`;
    await review.save();

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /products/:productId/review/:reviewId/delete — delete review
router.post('/:productId/review/:reviewId/delete', async (req, res) => {
  try {
    const { username } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

    if (username) {
      const User = require('../models/User');
      const user = await User.findOne({ username }).lean();
      if (!user || review.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized: You can only delete your own reviews' });
      }
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /products/:id/edit — show edit product form (manager only)
router.get('/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).send('Product not found');

    const username = req.query.username;
    const User = require('../models/User');
    const user = await User.findOne({ username }).lean();
    
    if (!user || user.type !== 'admin') {
      return res.status(403).send('Unauthorized: Only admins can edit products');
    }

    res.render('edit_product', { product, username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /products/:id/edit — update product
router.post('/:id/edit', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, stock, description, username } = req.body;
    
    const User = require('../models/User');
    const user = await User.findOne({ username }).lean();
    if (!user || user.type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Only admins can edit products' });
    }

    const updateData = { name, price, category, stock, description };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /products/:id/delete — delete product (manager only)
router.post('/:id/delete', async (req, res) => {
  try {
    const { username } = req.body;
    
    const User = require('../models/User');
    const user = await User.findOne({ username }).lean();
    if (!user || user.type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized: Only admins can delete products' });
    }

    // Also remove product from all reviews and carts
    await Review.deleteMany({ productId: req.params.id });
    const Cart = require('../models/Cart');
    await Cart.updateMany(
      { 'items.productId': req.params.id },
      { $pull: { items: { productId: req.params.id } } }
    );

    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;