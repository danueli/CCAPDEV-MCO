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
    await User.deleteMany({});
    await Reviews.deleteMany({});
    
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
    const users = await User.insertMany([
    { firstName: 'Juan',  lastName: 'Dela Cruz', email: 'juan.dela.cruz@example.com',phone: '09760156942',street: '123 Main St', city: 'Manila', zipCode: '1000', password: 'password123', type: 'customer' },
    { firstName: 'Justin', lastName: 'Beiber',    email: 'justin.beiber@example.com',   phone: '09123456789',street: '456 Oak Ave', city: 'Cebu', zipCode: '6000', password: 'password234', type: 'customer' },
    { firstName: 'Titus', lastName: 'Rodriguez',     email: 'titus.rodriguez@example.com',    phone: '09123456789',street: '789 Pine Rd', city: 'Davao', zipCode: '8000', password: 'password567', type: 'customer' },
    { firstName: 'Mang',   lastName: 'Inasal',    email: 'mang.inasal@example.com',     phone: '09123456789',street: '321 Elm St', city: 'Baguio', zipCode: '2000', password: 'password678', type: 'customer' },
    { firstName: 'Kent',  lastName: 'Lopez',  email: 'kent.lopez@example.com',phone: '09123456781',  street: '654 Maple Dr', city: 'Cagayan de Oro', zipCode: '9000', password: 'password910', type: 'customer' },
]);
console.log('Users seeded:', users.length);


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
        //associate each cart with a user and compute total price
    { userId: users[0]._id, items: cartOne,   totalPrice: computeTotal(cartOne, products) },
    { userId: users[1]._id, items: cartTwo,   totalPrice: computeTotal(cartTwo, products) },
    { userId: users[2]._id, items: cartThree, totalPrice: computeTotal(cartThree, products) },
    { userId: users[3]._id, items: cartFour,  totalPrice: computeTotal(cartFour, products) },
    { userId: users[4]._id, items: cartFive,  totalPrice: computeTotal(cartFive, products) },
    ]);
    console.log('Carts seeded:', carts.length);




    mongoose.disconnect();
    console.log('Disconnected.');
}

seedDB();