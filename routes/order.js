const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

const THIRTY_MINUTES = 30 * 60 * 1000;
const ONE_HOUR       = 60 * 60 * 1000;

// Background logic update order statuses based on time elapsed since order date
setInterval(async () => {
  try {
    const now = Date.now();

    // Update Order status to Shipped (After 30 minutes)
    await Order.updateMany(
      { status: 'Pending', date: { $lte: new Date(now - THIRTY_MINUTES) } },
      { $set: { status: 'Shipped' } }
    );

    // Update Order status to Delivered (After 1 hour)
    await Order.updateMany(
      { status: 'Shipped', date: { $lte: new Date(now - ONE_HOUR) } },
      { $set: { status: 'Delivered' } }
    );

  } catch (err) {
    console.error('Order status update error:', err.message);
  }
}, 60 * 1000); // runs every minute

// GET /checkout/:username — show checkout page with cart items and user details
router.get('/checkout/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).send('User not found');

    const cart = await Cart.findOne({ userId: user._id }).lean();
    if (!cart || cart.items.length === 0) return res.redirect(`/cart/${req.params.username}`);

    const cartItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          itemTotal: product.price * item.quantity,
        };
      })
    );

    const total = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

    res.render('checkout', {
      user,
      cartItems,
      total,
      username: req.params.username,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /checkout/:username — save order to DB and clear cart
router.post('/checkout/:username', async (req, res) => {
  try {
    const { address } = req.body;

    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).send('User not found');

    const cart = await Cart.findOne({ userId: user._id }).lean();
    if (!cart || cart.items.length === 0) return res.redirect(`/cart/${req.params.username}`);

    let totalPrice = 0;
    const orderItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId).lean();
        totalPrice += product.price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
        };
      })
    );

    const newOrder = new Order({
      userId: user._id,
      items: orderItems,
      totalPrice,
      address,
      status: 'Pending',
    });
    await newOrder.save();

    // Clear cart after order is saved
    await Cart.findOneAndUpdate(
      { userId: user._id },
      { items: [], totalPrice: 0 }
    );

    res.redirect(`/main/${req.params.username}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET /orders/:username — view all orders of a user
router.get('/orders/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return res.status(404).send('User not found');

    const orders = await Order.find({ userId: user._id }).lean();

    // Populate product info for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findById(item.productId).lean();
            return {
              ...item,
              name: product?.name || 'Unknown',
              price: product?.price || 0,
            };
          })
        );
        return { ...order, items };
      })
    );

    res.render('orders', { orders: populatedOrders, username: req.params.username });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST /orders/:id/delete — delete an order
router.post('/orders/:id/delete', async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Verify order belongs to this user
    if (order.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Only allow deletion of Pending orders
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, error: 'Can only delete pending orders' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;