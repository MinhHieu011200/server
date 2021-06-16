var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        producer: String
    }
);

var Producer = mongoose.model('Producer', schema, 'producer');

module.exports = Producer;