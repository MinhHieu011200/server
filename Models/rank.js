var mongoose = require('mongoose');

var schema = new mongoose.Schema(
    {
        rank: String
    }
);

var Rank = mongoose.model('Rank', schema, 'rank');

module.exports = Rank;