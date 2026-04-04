const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /login - render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// POST /login - handle login form submission
router.post('/login', async (req, res) => {
  try {
    const { username, password, type } = req.body;

    // Find user by username
    const user = await User.findOne({ username }).lean();

    // Check if user exists
    if (!user) {
      return res.render('login', { error: 'Incorrect username or password.' });
    }

    // Check if password matches
    if (user.password !== password) {
      return res.render('login', { error: 'Incorrect username or password.' });
    }

    // If a type was specified (e.g. from seller login), check it matches
    if (type && user.type !== type) {
      return res.render('login', { error: 'Account type does not match. Please use the correct login page.' });
    }

    // Redirect based on user type
    if (user.type === 'admin') {
      return res.redirect('/admin');
    }

    res.redirect(`/main/${user.username}`);

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET /s_login - render seller login page
router.get('/s_login', (req, res) => {
  res.render('s_login');
});

// GET /logout - log user out and redirect to login
router.get('/logout', (req, res) => {
  res.redirect('/login');
});

module.exports = router;