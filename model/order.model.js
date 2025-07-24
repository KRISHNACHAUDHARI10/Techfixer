const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  subtotal: Number,
  total: Number,
  shippingAddress: {
    fname: String,
    lname: String,
    email: String,
    address: String,
    city: String,
    state: String,
    zipcode: String,
    notes: String,
  },
  payment: {
    stripeSessionId: String,
    paymentStatus: String,
  },
  payment_status: {
    type: String,
    default: 'Pending',
  },
  electrician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Electrician',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
