const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /login - render login page
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/help', (req, res) => {
  res.render('help');
});

router.get('/about', (req, res) => {
  res.render('about');
});

// POST /login - handle login form submission
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username }).lean();

    // Check if user exists and if password matches the stored hash
    // Combined into one check to avoid leaking whether a username exists
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { error: 'Incorrect username or password.' });
    }

    // Save user data into session after successful login
    req.session.userId   = user._id;
    req.session.username = user.username;
    req.session.role     = user.type;

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
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

module.exports = router;