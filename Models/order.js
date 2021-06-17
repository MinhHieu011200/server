var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        id_user: {
            type: String,
            ref: 'Users'
        },
        id_payment: {
            type: String,
            ref: 'Payment'
        },
        id_note: {
            type: String,
            ref: 'Note'
        },
        id_momo: {
            type: String,
            ref: 'MoMo'
        },
        id_paypal: {
            type: String,
            ref: 'Paypal'
        },
        id_coupon: {
            type: String,
            ref: 'Coupon'
        },
        address: String,
        total: Number,
        status: String,
        pay: Boolean,
        feeship: Number,
        discount: Number,
        createDate: { type: Date, default: Date.now }
    }
);

var Order = mongoose.model('Order', schema, 'order');

module.exports = Order;