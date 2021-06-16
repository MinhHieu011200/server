var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        transId: String,
        orderId: String,
        refund: Boolean,
    }
);

var MoMo = mongoose.model('MoMo', schema, 'momo');

module.exports = MoMo;