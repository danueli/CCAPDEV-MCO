const mongoose = require('mongoose');

//Product Information
const productSchema = new mongoose.Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    category: {type: String},
    stock: {type: Number},
    description: {type: String, required: true},
    image: {type: String, required: true},
});

module.exports = mongoose.model('Product', productSchema);