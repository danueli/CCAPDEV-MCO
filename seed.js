require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Reviews = require('./models/Reviews')
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI)
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
    await Order.deleteMany({});

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
    { firstName: 'Juan',  lastName: 'Dela Cruz',username: 'juandelacruz', email: 'juan.dela.cruz@example.com',phone: '09760156942',street: '123 Main St', city: 'Manila', zip: '1000', password: 'password123', type: 'customer' },
    { firstName: 'Justin', lastName: 'Beiber', username: 'justinbeiber', email: 'justin.beiber@example.com',   phone: '09123456789',street: '456 Oak Ave', city: 'Cebu', zip: '6000', password: 'password234', type: 'customer' },
    { firstName: 'Titus', lastName: 'Rodriguez', username: 'titusrodriguez',     email: 'titus.rodriguez@example.com',    phone: '09123456789',street: '789 Pine Rd', city: 'Davao', zip: '8000', password: 'password567', type: 'customer' },
    { firstName: 'Mang',   lastName: 'Inasal', username: 'manginasal',    email: 'mang.inasal@example.com',     phone: '09123456789',street: '321 Elm St', city: 'Baguio', zip: '2000', password: 'password678', type: 'customer' },
    { firstName: 'Kent',  lastName: 'Lopez', username: 'kentlopez',  email: 'kent.lopez@example.com',phone: '09123456781',  street: '654 Maple Dr', city: 'Cagayan de Oro', zip: '9000', password: 'password910', type: 'customer' },
    { firstName: 'Admin', lastName: 'Baker', username: 'adminbaker', email: 'admin@bakehub.com', phone: '09000000000', street: '1 Baker St', city: 'Manila', zip: '1000', password: 'admin123', type: 'admin' },
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

    // Seed Reviews
    const reviews = await Reviews.insertMany([
        { productId: products[0]._id, userId: users[0]._id, rating: 5, comment: 'Amazing chocolate cake, very moist!' },
        { productId: products[1]._id, userId: users[1]._id, rating: 4, comment: 'Croissant was very buttery and fresh.' },
        { productId: products[2]._id, userId: users[2]._id, rating: 5, comment: 'Best blueberry muffin I have ever had!' },
        { productId: products[3]._id, userId: users[3]._id, rating: 3, comment: 'Cookie was good but a bit too sweet.' },
        { productId: products[4]._id, userId: users[4]._id, rating: 5, comment: 'Red velvet cupcake was absolutely perfect.' },
    ]);
    console.log('Reviews seeded:', reviews.length);

    // Seed Orders with user addresses
    const orders = await Order.insertMany([
       { userId: users[0]._id, items: cartOne, totalPrice: computeTotal(cartOne, products), status: 'Pending', address: `${users[0].street}, ${users[0].city}, ${users[0].zip}`},
       { userId: users[1]._id, items: cartTwo, totalPrice: computeTotal(cartTwo, products), status: 'Pending', address: `${users[1].street}, ${users[1].city}, ${users[1].zip}`},
       { userId: users[2]._id, items: cartThree, totalPrice: computeTotal(cartThree, products), status: 'Pending', address: `${users[2].street}, ${users[2].city}, ${users[2].zip}`},
       { userId: users[3]._id, items: cartFour, totalPrice: computeTotal(cartFour, products), status: 'Pending', address: `${users[3].street}, ${users[3].city}, ${users[3].zip}`},
       { userId: users[4]._id, items: cartFive, totalPrice: computeTotal(cartFive, products), status: 'Pending', address: `${users[4].street}, ${users[4].city}, ${users[4].zip}`},
    ]);

    console.log('Orders seeded:', orders.length);
    

    console.log('Database seeding completed ');
    console.log(` ${products.length} products`);
    console.log(` ${users.length} users (5 customers + 1 admin)`);
    console.log(` ${carts.length} shopping carts`);
    console.log(` ${reviews.length} reviews`);
    console.log(` ${orders.length} orders`);


    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
}

seedDB();