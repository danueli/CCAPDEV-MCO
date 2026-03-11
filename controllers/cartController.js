const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/users/login');

        const cart = await Cart.findOne({ userId: req.session.userId })
            .populate('items.productId')
            .lean();

        res.render('cart', {
            cart: cart || { items: [], totalPrice: 0 }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.addToCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/users/login');

        const { productId, quantity = 1 } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).send('Product not found');

        let cart = await Cart.findOne({ userId: req.session.userId });

        if (!cart) {
            cart = new Cart({ userId: req.session.userId, items: [], totalPrice: 0 });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.items.push({ productId, quantity: parseInt(quantity) });
        }

        await cart.populate('items.productId');
        cart.totalPrice = cart.items.reduce(
            (sum, item) => sum + item.productId.price * item.quantity, 0
        );

        await cart.save();
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.updateCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/users/login');

        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.session.userId });
        if (!cart) return res.redirect('/cart');

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                cart.items = cart.items.filter(
                    item => item.productId.toString() !== productId
                );
            }
        }

        await cart.populate('items.productId');
        cart.totalPrice = cart.items.reduce(
            (sum, item) => sum + item.productId.price * item.quantity, 0
        );

        await cart.save();
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/users/login');

        const { productId } = req.body;
        const cart = await Cart.findOne({ userId: req.session.userId });
        if (!cart) return res.redirect('/cart');

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await cart.populate('items.productId');
        cart.totalPrice = cart.items.reduce(
            (sum, item) => sum + item.productId.price * item.quantity, 0
        );

        await cart.save();
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

exports.clearCart = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/users/login');

        await Cart.findOneAndUpdate(
            { userId: req.session.userId },
            { items: [], totalPrice: 0 }
        );

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};