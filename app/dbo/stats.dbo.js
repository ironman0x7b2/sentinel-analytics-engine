var mongoose = require('mongoose'),
    Connection = mongoose.model('Connection');

var getSessionAggregationResult = function (query, cb) {
    Connection.aggregate(query, cb);
};

var get = function (query, cb) {
    Connection.find(query, cb);
};

module.exports = {
    getSessionAggregationResult: getSessionAggregationResult,
    get: get
};