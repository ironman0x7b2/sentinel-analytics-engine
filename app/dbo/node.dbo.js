var mongoose = require('mongoose'),
    Node = mongoose.model('Node');


var getNodeAggregationResult = function (query, cb) {
    Node.aggregate(query, cb);
};

var get = function (query, cb) {
    Node.find(query, cb);
};

module.exports = {
    getNodeAggregationResult: getNodeAggregationResult,
    get: get
};