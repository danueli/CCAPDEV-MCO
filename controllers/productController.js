const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().lean();

        if (products.length === 0) {
            return res.render('index', {
                products: [],
                isEmpty: true,
                message: "No pastries available at the moment."
            });
        }

        res.render('index', { products, isEmpty: false });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};