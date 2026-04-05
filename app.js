require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const session = require('express-session'); 
const app = express();

// Env fallback with defaults
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakehub';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me_in_production';
const PORT = parseInt(process.env.PORT, 10) || 3000;

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log(`MongoDB connected`))
  .catch(err => console.log(err));

// view engine setup with custom helpers
const hbs = engine({
  extname: '.hbs',
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    lt: (a, b) => a < b,
    lte: (a, b) => a <= b,
    gt: (a, b) => a > b,
    gte: (a, b) => a >= b,
    and: (...args) => args.slice(0, -1).every(Boolean),
    or: (...args) => args.slice(0, -1).some(Boolean),
    sub: (a, b) => a - b,
    add: (a, b) => a + b,
    mul: (a, b) => a * b,
    repeat: function(count, options) {
      let result = '';
      for (let i = 0; i < count; i++) {
        result += options.fn(this);
      }
      return result;
    },
    formatDate: (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
});

app.engine('hbs', hbs);
app.set('view engine', 'hbs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Auth
const { requireLogin, requireAdmin } = require('./middleware/auth');

// Public routes — no login required
app.use('/',         require('./routes/login'));
app.use('/',         require('./routes/user'));

// Protected routes — must be logged in
app.use('/products', requireLogin, require('./routes/products'));
app.use('/cart',     requireLogin, require('./routes/cart'));
app.use('/',         requireLogin, require('./routes/order'));
app.use('/',         requireLogin, require('./routes/index'));
app.use('/',         requireLogin, require('./routes/about'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});