const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /login
router.get('/login', (req, res) => {
    res.render('login');
});

// POST /login
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

// GET /signup (customer)
router.get('/signup', (req, res) => {
    res.render('c_signup');
});

// POST /signup (create new customer)
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

// GET /s_login (seller login page)
router.get('/s_login', (req, res) => {
    res.render('s_login');
});

// GET /s_signup (seller signup page)
router.get('/s_signup', (req, res) => {
    res.render('s_signup');
});

// GET /profile/:username
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).lean();
        if (!user) return res.status(404).send('User not found');
        res.render('profile', { user, username: req.params.username });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST /profile/:username/edit
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

module.exports = router;
