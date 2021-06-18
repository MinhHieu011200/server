var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        id_producer: {
            type: String,
            ref: 'Producer'
        },
        id_sale: {
            type: String,
            ref: 'Sale'
        },
        name_product: String,
        price_product: Number,
        image: String,
        describe: String,
        number: Number,
    }
);

var Products = mongoose.model('Products', schema, 'product');

module.exports = Products;