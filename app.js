const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');

const app = express();

// MongoDB connection
// Kindly change the connection string by adding ur username and ps
// Syntax: 'mongodb://<username>:<password>@ac----
mongoose.connect('mongodb://danieldabuit_db_user:1234@ac-75jwuwg-shard-00-00.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-01.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-02.emfl2fn.mongodb.net:27017/bakehubdb?ssl=true&replicaSet=atlas-14b2hv-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// view engine setup
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Start server
app.listen(3000, () => {
  console.log('Running on http://localhost:3000');
});
//importing models
const Cart = require('./models/Cart');
const Product = require('./models/Product');
const User = require('./models/User');
const Reviews = require('./models/Reviews');
/*CART ROUTES*/

// Get Cart 
app.get('/cart/:username', async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send('User not found');
  } else {
    const cart = await Cart.findOne({ userId: user._id }).populate('items.productId'); 
    res.render('cart', { cart });
  }
});

//post Cart add
app.post('/cart/add/:username', async (req, res) => {
  const username = req.params.username;
  const { productId, quantity } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send('User not found');
  }
  let cart = await Cart.findOne({ userId: user._id });
  if (!cart) {
  cart = new Cart({ userId: user._id, items: [{ productId, quantity }] });
}
  else {
    const existingItem = cart.items.find(item => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  }
  cart.total = computeTotal(cart.items, await Product.find({ _id: { $in: cart.items.map(i => i.productId) } }));
  await cart.save();
  res.redirect(`/cart/${username}`);
});

//post Cart remove - removes the item from the cart and updates the total
app.post('/cart/remove/:username', async (req, res) => {
  const username = req.params.username;
  const { productId } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send('User not found');
  } else {
    const cart = await Cart.findOne({ userId: user._id });
    if (cart) {
      cart.items = cart.items.filter(item => !item.productId.equals(productId));
      cart.total = computeTotal(cart.items, await Product.find({ _id: { $in: cart.items.map(i => i.productId) } }));
      await cart.save();
    }
  }
  res.redirect(`/cart/${username}`);
});

//compute total price of the cart
function computeTotal(items, products) {
    return items.reduce((total, item) => {
        const product = products.find(p => p._id.equals(item.productId));
        return total + (product.price * item.quantity);
    }, 0);
}


/*PRODUCTS ROUTES*/ 

//get products list(customer)
app.get('/products', async (req, res) => {
  const products = await Product.find({});
  res.render('products', { products });
});

//get product id and review(customer)
app.get('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  const reviews = await Reviews.find({ productId }).populate('userId');
  res.render('product-details', { product, reviews });
});



  

//get products add(manager)
app.get('/add', (req, res) => {
  res.render('add');
});

//get products edit(manager)
app.get('/edit/:id', async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.render('edit', { product });
});

//post products add(manager)
app.post('/add', async (req, res) => {
  const { name, price, category, stock, description } = req.body;
  await Product.create({ name, price, category, stock, description });
  res.redirect('/products');
});

//post products edit(manager)
app.post('/edit/:id', async (req, res) => {
  const productId = req.params.id;
  const { name, price, category, stock, description } = req.body;
  await Product.findByIdAndUpdate(productId, { name, price, category, stock, description });
  res.redirect('/products');
});