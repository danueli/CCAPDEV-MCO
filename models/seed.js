const mongoose = require('mongoose');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Reviews = require('./models/Reviews')

mongoose.connect('mongodb://danieldabuit_db_user:1234@ac-75jwuwg-shard-00-00.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-01.emfl2fn.mongodb.net:27017,ac-75jwuwg-shard-00-02.emfl2fn.mongodb.net:27017/bakehubdb?ssl=true&replicaSet=atlas-14b2hv-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Helper function for Cart total
function computeTotal(items, products) {
    return items.reduce((total, item) => {
        const product = products.find(p => p._id.equals(item.productId));
        return total + (product.price * item.quantity);
    }, 0);
}

  async function seedDB() {
    // Clear existing data
    await Product.deleteMany({});
    await Cart.deleteMany({});

    //Seed Users

    //Seed Products
    const products = await Product.insertMany([
        { name: 'Chocolate Cake',        price: 100, category: 'Cakes',     stock: 10, description: 'Rich, moist, and layered with deep chocolate flavor', image: 'cake.png'},
        { name: 'Croissant',             price: 40,  category: 'Pastries',  stock: 10, description: 'Buttery, flaky, and fresh from the oven', image: 'croissant.png'},
        { name: 'Blueberry Muffin',      price: 50,  category: 'Muffins',   stock: 10, description: 'Soft, fluffy, and packed with sweet blueberries', image: 'muffin.png'},
        { name: 'Chocolate Chip Cookie', price: 80,  category: 'Cookies',   stock: 10, description: 'Delicious and crispy with chunks of chocolate', image: 'Cookie.png'},
        { name: 'Red Velvet Cupcake',    price: 85,  category: 'Cupcakes',  stock: 10, description: 'Velvety smooth with a hint of cocoa and creamy frosting', image: 'cupcake.png'},
    ]);
    console.log('Products seeded:', products.length);

    //Seed User first before Cart

    //Seed Carts
  const cartOne = [
        { productId: products[0]._id, quantity: 1 },
        { productId: products[1]._id, quantity: 2 }
    ];
    const cartTwo = [
        { productId: products[2]._id, quantity: 3 }
    ];
    const cartThree = [
        { productId: products[3]._id, quantity: 1 },
        { productId: products[4]._id, quantity: 1 }
    ];
    const cartFour = [
        { productId: products[0]._id, quantity: 2 },
        { productId: products[4]._id, quantity: 2 }
    ];
    const cartFive = [
        { productId: products[1]._id, quantity: 1 },
        { productId: products[2]._id, quantity: 1 },
        { productId: products[3]._id, quantity: 1 }
    ];

    const carts = await Cart.insertMany([
        { userId: user._id, items: cartOne, totalPrice: computeTotal(cart1Items, products) },
        { userId: user._id, items: cartTwo, totalPrice: computeTotal(cart2Items, products) },
        { userId: user._id, items: cartThree, totalPrice: computeTotal(cart3Items, products) },
        { userId: user._id, items: cartFour, totalPrice: computeTotal(cart4Items, products) },
        { userId: user._id, items: cartFive, totalPrice: computeTotal(cart5Items, products) },
    ]);
    console.log('Carts seeded:', carts.length);

    mongoose.disconnect();
    console.log('Disconnected.');
}

seedDB();