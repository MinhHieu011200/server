var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        promotion: Number,
        describe: String,
        status: Boolean,
    }
);

var Sale = mongoose.model('Sale', schema, 'sale');

module.exports = Sale;