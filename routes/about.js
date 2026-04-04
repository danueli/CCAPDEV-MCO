const express = require('express');
const router = express.Router();

// About Us route
router.get('/about', (req, res) => {
  res.render('about', { username: req.query.username });
});

module.exports = router;