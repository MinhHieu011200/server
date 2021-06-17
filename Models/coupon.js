var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        code: String,
        number: Number,
        promotion: Number,
        describe: String,
        startDate: Date,
        endDate: Date,
        id_payment: {
            type: String,
            ref: 'Payment'
        },
        id_rank: {
            type: String,
            ref: 'Rank'
        },
    }
);

var Coupon = mongoose.model('Coupon', schema, 'coupon');

module.exports = Coupon;