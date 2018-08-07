var mongoose = require('mongoose'),
    Statistic = mongoose.model('Statistic');

var getStatisticAggregationResult = function (query, cb) {
    Statistic.aggregate(query, cb);
};

var get = function (query, cb) {
    Statistic.find(query, cb);
};

module.exports = {
    getStatisticAggregationResult: getStatisticAggregationResult,
    get: get
};