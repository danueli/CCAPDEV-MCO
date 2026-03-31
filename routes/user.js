const express = require('express');
const router = express.Router();
const User = require('../models/User');

//get login page
router.get('/login', (req, res) => {
    res.render('login');
});

// post login page
router.post('/login', async (req, res) => {
    try {
        const { username, password, type } = req.body;
        const user = await User.findOne({ username, password }).lean();

        if (!user) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        // Redirect based on user type
        if (user.type === 'manager') {
            return res.redirect(`/main/${user.username}`);
        } else {
            return res.redirect(`/main/${user.username}`);
        }

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get signup page for customers
router.get('/signup', (req, res) => {
    res.render('c_signup');
});

// (create new customer)
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, username, email, phone, street, city, zip, password } = req.body;

        // Check if username already exists
        const existing = await User.findOne({ username });
        if (existing) {
            return res.render('c_signup', { error: 'Username already taken' });
        }

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            phone,
            street,
            city,
            zip,
            password,
            type: 'customer'
        });

        await newUser.save();
        res.redirect(`/main/${username}`);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// (admin login page)
router.get('/s_login', (req, res) => {
    res.render('s_login');
});

// (admin signup page)
router.get('/s_signup', (req, res) => {
    res.render('s_signup');
});

// (create new admin)
router.post('/s_signup', async (req, res) => {
    try {
        const { firstName, lastName, username, email, phone, password } = req.body;

        // Check if username already exists
        const existing = await User.findOne({ username });
        if (existing) {
            return res.render('s_signup', { error: 'Username already taken' });
        }

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            phone,
            password,
            type: 'admin'
        });

        await newUser.save();
        res.redirect(`/main/${username}`);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

// get profile page
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) return res.status(404).send('User not found');
        res.render('profile', { user, username: req.params.username });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// post edit profile
router.post('/profile/:username/edit', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, street, city, zip } = req.body;
        await User.findOneAndUpdate(
            { username: req.params.username },
            { firstName, lastName, email, phone, street, city, zip }
        );
        res.redirect(`/profile/${req.params.username}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// DELETE /profile/:username — delete user account
router.post('/profile/:username/delete', async (req, res) => {
    try {
        const username = req.params.username;

        // Find user to get ID
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send('User not found');

        // Delete user's cart, orders, and reviews
        const Cart = require('../models/Cart');
        const Order = require('../models/Order');
        const Reviews = require('../models/Reviews');

        await Cart.deleteMany({ userId: user._id });
        await Order.deleteMany({ userId: user._id });
        await Reviews.deleteMany({ userId: user._id });

        // Delete the user
        await User.findByIdAndDelete(user._id);

        res.redirect('/login');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
