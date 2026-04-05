const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User'); 
const Cart = require('../models/Cart');


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
      canAddProduct: (user.type === 'admin' || user.type === 'manager'),
      isAdmin: (user.type === 'admin')
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/catalog/:username', async (req, res) => {
  try {
    const allProducts = await Product.find().lean();
    const category = req.query.category;

    const products = category
      ? allProducts.filter(product => product.category && product.category.toLowerCase() === category.toLowerCase())
      : allProducts;

    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

    res.render('catalog', {
      products,
      categories,
      selectedCategory: category || 'All',
      username: req.params.username
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/search', async (req, res) => {
  const { q, username } = req.query;
  const products = await Product.find({ name: { $regex: q, $options: 'i' } }).lean();
  res.render('catalog', { products, username, query: q });
});

// Help route
router.get('/help', (req, res) => {
  res.render('help', { username: req.query.username });
});

// Admin dashboard route
const { requireAdmin } = require('../middleware/auth');
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ type: 'customer' }).lean();
    const managers = await User.find({ type: 'manager' }).lean();
    const products = await Product.find().lean();

    res.render('admin', {
      users,
      managers,
      totalUsers: users.length,
      totalManagers: managers.length,
      totalProducts: products.length
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

//  Checkout Logic
router.get('/checkout/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).lean();
        if (!user) return res.status(404).send("User not found");

        const cart = await Cart.findOne({ userId: user._id }).populate('items.productId').lean();
        let cartItems = [];
        let total = 0;

        if (cart && cart.items.length > 0) {
            cartItems = cart.items.map(item => {
                const product = item.productId;
                if (!product) return null;
                const name = product.name;
                const price = product.price || 0;
                const itemTotal = price * item.quantity;
                total += itemTotal;
                return {
                    name,
                    quantity: item.quantity,
                    itemTotal: itemTotal.toFixed(2)
                };
            }).filter(Boolean);
        }

        res.render('checkout', {
            user,
            cartItems,
            total: total.toFixed(2)
        });

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Post Checkout Logic
router.post('/checkout/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found");

        // Get user's cart info
        const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).send("Cart is empty");
        }

        // Clear user's cart
        await Cart.deleteOne({ userId: user._id });

        // Confirmation then redirect to main menu
        res.send(`
            <script>
                alert("Your order has been placed.");
                window.location.href = "/main/${username}";
            </script>
        `);

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;
