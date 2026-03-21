const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity: {type: Number, required: true, default: 1},
    }],
    totalPrice: {type: Number, default: 0},
    status: {type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending'},
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
 


