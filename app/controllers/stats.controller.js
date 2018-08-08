var statsDbo = require('../dbo/stats.dbo'),
    staticsDbo = require('../dbo/statics.dbo'),
    nodeDbo = require('../dbo/node.dbo');

var request = require('request');

/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/all?interval=day Request for total sessions in a day( start time to end time)

 * @apiName GetDailySessionsCount
 * @apiGroup Sessions
 * @apiParam {String} interval 
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
                "_id": "2018/03/14",
                "sessionsCount": 8
            }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting daily session count',
                errors: err
        }
 */

exports.getDailySessionCount = function (req, res) {
    var aggregationQuery = [];

    // query for date number format to date format(1234567 to 2018-03-14T14:11:46.968Z)
    var query = {
        "$project": {
            "date": {
                "$add": [
                    new Date(1970 - 1 - 1), {
                        "$multiply": ["$start_time", 1000]
                    }
                ]
            }
        }
    };

    // query for group the data by date wise
    var query1 = {
        "$group": {
            "_id": {
                "$dateToString": {
                    "format": "%Y/%m/%d",
                    "date": "$date"
                }
            },
            "sessionsCount": {
                "$sum": 1
            }
        }
    };

    // query for sort the session count
    var query2 = {
        "$sort": {
            "_id": 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (err, result) {
        if (err) {
            console.log('Error while getting sessions count', err);

            res.status(400).json({
                status: false,
                message: 'Error while getting daily session count',
                errors: err
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/active?filter=lastday&format=count Request for present active session count
 * @apiName GetActiveSessionCount
 * @apiGroup Sessions
 * @apiParam {String} filter lastday of the count.
 * @apiParam {String} format format of the result.
 *
 * @apiSuccess {String} success Status of the response.
 * @apiSuccess {Number} count Active sessions count.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "count": 27
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting active sessions',
                errors: err
        }
 */

exports.getActiveSessionCount = function (req, res) {
    request('https://api.sentinelgroup.io/stats/sessions/active?filter=lastday&format=count',
     function (error, response, body) {
        if (error) {
            console.log('Error while getting active sessions', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting active sessions',
                errors: error
            });
        } else {

            if (typeof(body)=='string') {
                body = JSON.parse(body);
            }

            res.status(200).json(body);
        }
    });
};


/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/average?interval=day&format=count
 Request for Average session count
 * @apiName GetAverageSessionCount
 * @apiGroup Sessions
 * @apiParam {String} interval
 * @apiParam {String} format
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
                "averageSessions": 60.337374239990304
            }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting average session count',
                errors: err
        }
 */

exports.getAverageSessionsCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        '$group': {
            '_id': null,
            'olddate': {
                '$min': "$start_time"
            },
            'newdate': {
                '$max': "$start_time"
            },
            "SUM": {
                '$sum': 1
            }
        }
    };

    var query1 = {
        '$project': {
            '_id': 0,
            'averageSessions': {
                '$divide': [
                    "$SUM", {
                        '$divide': [{
                            "$subtract": ["$newdate", "$olddate"]
                        }, 24 * 60 * 60]
                    }
                ]
            }
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting average session count', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting average session count',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/nodes/all Request for total nodes count
 * @apiName GetTotalNodes
 * @apiGroup Statastics
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
    "success": true,
    "results": [
        {
            "_id": "2018/04/13",
            "nodesCount": 10
        }
        ]
    }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting total number of nodes',
                errors: err
        }
 */

exports.getTotalNodeCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        '$project': {
            'total': {
                '$add': [
                    new Date(1970 - 1 - 1), {
                        '$multiply': ['$timestamp', 1000]
                    }
                ]
            },
            'nodes': '$nodes.total'
        }
    };

    var query1 = {
        '$group': {
            '_id': {
                '$dateToString': {
                    'format': '%Y/%m/%d',
                    'date': '$total'
                }
            },
            'nodesCount': {
                '$sum': '$nodes'
            }
        }
    };

    var query2 = {
        '$sort': {
            '_id': 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    staticsDbo.getStatisticAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting total number of nodes', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting total number of nodes',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};



/**
 * @api {get} https://api.sentinelgroup.io/stats/nodes/active?interval=day Active nodes per day( only up )
 * @apiName GetTotalActiveNodes
 * @apiGroup Node
 * @apiParam {String} day
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
    "success": true,
    "results": [
        {
            "_id": "2018/04/13",
            "nodesCount": 16
        }]
    }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting active nodes',
                errors: err
        }
 */
exports.getDailyActiveNodeCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        '$project': {
            'total': {
                '$add': [
                    new Date(1970 - 1 - 1), {
                        '$multiply': ['$timestamp', 1000]
                    }
                ]
            },
            'nodes': '$nodes.up'
        }
    };

    var query1 = {
        '$group': {
            '_id': {
                '$dateToString': {
                    'format': '%d/%m/%Y',
                    'date': '$total'
                }
            },
            'nodesCount': {
                '$sum': '$nodes'
            }
        }
    };

    var query2 = {
        '$sort': {
            '_id': 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    staticsDbo.getStatisticAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting active nodes', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting active nodes',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/nodes/active?interval=day&format=count Average nodes which are active in a day
 * @apiName GetAverageNodes
 * @apiGroup Node
 * @apiParam {String} interval
 * @apiParam {String} format
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
                  "average": 1.1670445433958152
            }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting average nodes',
                errors: err
        }
 */

exports.getAverageNodesCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        '$group': {
            '_id': null,
            'olddate': {
                '$min': "$joined_on"
            },
            'newdate': {
                '$max': "$joined_on"
            },
            "SUM": {
                '$sum': 1
            }
        }
    };

    var query1 = {
        '$project': {
            '_id': 0,
            'average': {
                '$divide': [
                    "$SUM", {
                        '$divide': [{
                            "$subtract": ["$newdate", "$olddate"]
                        }, 24 * 60 * 60]
                    }
                ]
            }
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);

    nodeDbo.getNodeAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting nodes', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting average nodes',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};


/**
 * @api {get} https://api.sentinelgroup.io/stats/nodes/new?interval=day How many nodes are hosted in a day
 * @apiName GetDailyNodes
 * @apiGroup Node
 * @apiParam {String} interval
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
                  "_id": null,
                  "nodesCount": 122
            }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting daily nodes stats',
                errors: err
        }
 */

exports.getDailyNodeCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        "$project": {
            "total": {
                "$add": [
                    new Date(1970 - 1 - 1), {
                        "$multiply": ["$created_at", 1000]
                    }
                ]
            }
        }
    };

    var query1 = {
        "$group": {
            "_id": {
                "$dateToString": {
                    "format": "%d/%m/%Y",
                    "date": '$total'
                }
            },
            "nodesCount": {
                "$sum": 1
            }
        }
    };

    var query2 = {
        "$sort": {
            "_id": 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    nodeDbo.getNodeAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting daily nodes', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting daily nodes stats',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/nodes/active?interval=current Active nodes right now

 * @apiName GetActiveNodesCount
 * @apiGroup Node
 * @apiParam {String} interval
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "count": 10
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting active nodes count',
                errors: err
        }
 */

exports.getActiveNodeCount = function (req, res) {
    var query = { "vpn.status": "up" };

    nodeDbo.get(query, function (error, result) {
        if (error) {
            console.log('Error while getting active node count', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting active node count',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};


/**
 * @api {get} https://api.sentinelgroup.io/stats/bandwidth/average?interval=day For a day how much data used  ( in Mega Bytes ) 


 * @apiName GetDailystats
 * @apiGroup Data
 * @apiParam {String} interval
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} stats Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "success": true,
        "stats": [
            {
                "_id": "2018/03/14",
                "dataCount": 0.74755859375
            }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting daily stats',
                errors: err
        }
 */

exports.getDailyDataCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        "$project": {
            "total": {
                "$add": [
                    new Date(1970 - 1 - 1), {
                        "$multiply": ["$start_time", 1000]
                    }
                ]
            },
            "data": "$server_usage.down"
        }
    };

    var query1 = {
        "$group": {
            "_id": {
                "$dateToString": {
                    "format": "%d/%m/%Y",
                    "date": '$total'
                }
            },
            "dataCount": {
                "$sum": "$data"
            }
        }
    };

    var query2 = {
        "$sort": {
            "_id": 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting daily stats', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting daily stats',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/bandwidth/all?format=count Total data used till now(in Mega bytes)

 * @apiName GetTotalDataCount
 * @apiGroup Data
 * @apiParam {String} format
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} stats Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "stats": [
                {
                    "_id": null,
                    "total": 630030.4654884338
                }
            ]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting total data count',
                errors: err
        }
 */

exports.getTotalDataCount = function (req, res) {
    var aggregationQuery = [{
        "$group": {
            "_id": null,
            "total": {
                "$sum": "$server_usage.down"
            }
        }
    }];

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting total data count', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting total data count',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};


/**
 * @api {get} https://api.sentinelgroup.io/stats/bandwidth?filter=lastday&format=count Data used in last 24 hours

 * @apiName GetLast24hourData
 * @apiGroup Data
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} stats Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "stats": [
                {
                    "_id": null,
                    "total": 1200.538016319275
                }
            ]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting bandwidth',
                errors: err
        }
 */

exports.getLastDataCount = function (req, res) {
    var aggregationQuery = [];

    var query = {
        '$match': {
            'start_time': {
                '$gte': (Date.now() / 1000) - (24 * 60 * 60)
            }
        }
    };

    var query1 = {
        '$group': {
            '_id': null,
            'total': {
                '$sum': '$server_usage.down'
            }
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting last data', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting last data',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};



/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/duration?interval=day Total duration of usage in a day ( in minutes )


 * @apiName GetTotalUsageDataInADay
 * @apiGroup Time
 * @apiParam {String} interval
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} stats Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
    "success": true,
    "units":"minutes",
    "stats": [
        {
            "_id": "2018/03/14",
            "durationCount": 53.53333333333333
        }]
    }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting time daily stats',
                errors: err
        }
 */
exports.getDailyDurationCount = function (req, res) {
    var aggregationQuery = [];
    var query = {
        "$project": {
            "total": {
                "$add": [
                    new Date(1970 - 1 - 1), {
                        "$multiply": ["$start_time", 1000]
                    }
                ]
            },
            "start": "$start_time",
            "end": {
                "$cond": [{
                    "$eq": ["$end_time", null]
                },
                parseInt(Date.now() / 1000), "$end_time"]
            }
        }
    };

    var query1 = {
        "$group": {
            "_id": {
                "$dateToString": {
                    "format": "%d/%m/%Y",
                    "date": '$total'
                }
            },
            "durationCount": {
                "$sum": {
                    "$subtract": ["$end", "$start"]
                }
            }
        }
    };

    var query2 = {
        "$sort": {
            "_id": 1
        }
    };

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting time daily stats', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting time daily stats',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};



/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/duration?filter=lastday/averagedayinterval
 Average usage of dvpn sessions in a day

 * @apiName GetAverageDVPNSessions
 * @apiGroup Time
 * @apiParam {String} filter
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
             "_id": null,
            "total": 659363251082
        }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting average duration',
                errors: err
        }
 */
exports.getAverageDuration = function (req, res) {
    var aggregationQuery = [];

    var query = {
        "$project": {
            "Sum": {
                "$sum": {
                    "$subtract": [{
                        "$cond": [{
                            "$eq": ["$end_time", null]
                        },
                        parseInt(Date.now() / 1000), "$end_time"]
                    }, "$start_time"]
                }
            }
        }
    };

    var query1 = {
        "$group": {
            "_id": null,
            "average": {
                "$avg": "$Sum"
            }
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while average duration', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting average duration',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};


/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/duration/average?interval=day&format=count  Per day, average duration of dvpn sessions


 * @apiName GetAverageDVPNSessionsPerDay
 * @apiGroup Time
 * @apiParam {String} filter
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "units": "minutes",
            "average": [
                {
                    "_id": null,
                    "average": 133.45653290970424
                }
            ]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting daily average duration',
                errors: err
        }
 */
exports.getDailyAverageDuration = function (req, res) {
    var aggregationQuery = [];
    var query = {
        '$project': {
            'total': {
                '$add': [new Date(1970 - 1 - 1), {
                    '$multiply': ['$start_time', 1000]
                }]
            }, 'Sum': {
                '$sum': {
                    '$subtract': [
                        {
                            '$cond': [
                                { '$eq': ['$end_time', null] },
                                parseInt(Date.now() / 1000),
                                '$end_time']
                        },
                        '$start_time'
                    ]
                }
            }
        }
    };

    var query1 = {
        '$group': {
            '_id': { '$dateToString': { 'format': '%d/%m/%Y', 'date': '$total' } },
            'average': { '$avg': '$Sum' }
        }
    };

    var query2 = {
        '$sort': { '_id': 1 }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting daily average duration', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting daily average duration',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/sessions/duration/average?filter=lastday&format=count  average duration of dvpn sessions in last 24 hours



 * @apiName GetAverageDVPNSessionsLast24hours
 * @apiGroup Time
 * @apiParam {String} filter
 * @apiParam {String} format
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "status": true,
        "results": [
            {
            "_id": "01/05/2018",
            "Average": 1129.1818181818182
        }]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting last average count',
                errors: err
        }
 */

exports.getLastAverageDuration = function (req, res) {
    var aggregationQuery = [];
    var query = {
        '$match': {
            'start_time': {
                '$gte': Date.now() / 1000 - (24 * 60 * 60)
            }
        }
    };

    var query1 = {
        '$project': {
            'Sum': {
                '$sum': {
                    '$subtract': [{
                        '$cond': [{
                            '$eq': ['$end_time', null]
                        },
                        Date.now() / 1000, '$end_time']
                    }, '$start_time']
                }
            }
        }
    };

    var query2 = {
        '$group': {
            '_id': null,
            'average': {
                '$avg': '$Sum'
            }
        }
    };

    statsDbo.getSessionAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting last average count', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting last average count',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/payments/all/day  In a day , total of all paid SENTs



 * @apiName DayTotalPaidSents
 * @apiGroup Payment
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} stats Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "units": "SENT",
            "stats": [
                {
                    "_id": "2018/08/08",
                    "sentsCount": 118.29170512
                }
            ]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting daily paid sent count',
                errors: err
        }
 */

exports.getDailyPaidSentsCount = function (req, res) {
    var aggregationQuery = [];
    var query = {
        '$project': {
            'total': {
                '$add': [
                    new Date(1970 - 1 - 1), {
                        '$multiply': ['$timestamp', 1000]
                    }
                ]
            },
            'amount': '$paid_count'
        }
    };

    var query1 = {
        '$group': {
            '_id': {
                '$dateToString': {
                    'format': '%d/%m/%Y',
                    'date': '$total'
                }
            },
            'sentsCount': {
                '$sum': '$amount'
            }
        }
    };

    var query2 = {
        '$sort': {
            '_id': 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    staticsDbo.getStatisticAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting daily paid sent count', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting daily paid sent count',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};

/**
 * @api {get} https://api.sentinelgroup.io/stats/payments/average/day?format=count  How many SENTs are paid on an average per day

 * @apiName DayAverageSents
 * @apiGroup Payment
 * @apiParam {String} format
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "success": true,
        "units": "SENT",
        "average": [
            {
                "_id": 0,
                "averageCount": 118.29170512
            }
        ]
    }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while average paid sents',
                errors: err
        }
 */

exports.getAveragePaidSentsCount = function (req, res) {
    var aggregationQuery = [];
    var query = {
        '$project': {
            'total': {
                '$add': [
                    new Date(1970 - 1 - 1), {
                        '$multiply': ['$timestamp', 1000]
                    }
                ]
            },
            'amount': {
                '$add': ['$paid_count', '$unpaid_count']
            }
        }
    };

    var query1 = {
        '$group': {
            '_id': {
                '$dateToString': {
                    'format': '%d/%m/%Y',
                    'date': '$total'
                }
            },
            'sentsCount': {
                '$sum': '$amount'
            }
        }
    };

    var query2 = {
        '$sort': {
            '_id': 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    staticsDbo.getStatisticAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while average paid sents', error);

            res.status(400).json({
                status: false,
                message: 'Error while average paid sents',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};



/**
 * @api {get} https://api.sentinelgroup.io/stats/earnings/all?interval=day Total SENTs (both paid and unpaid) in a day

 * @apiName TotalSentsInADay
 * @apiGroup Payment
 * @apiParam {String} interval
 *
 *
 * @apiSuccess {String} status Status of the response.
 * @apiSuccess {Array} results Array of results.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "success": true,
            "units": "SENT",
            "stats": [
                {
                    "_id": "2018/08/08",
                    "sentsCount": 250.40326665000003
                }
            ]
        }
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Error
 *     {
                status: false,
                message: 'Error while getting total sents used',
                errors: err
        }
 */
exports.getDailyTotalSentsUsed = function (req, res) {
    var aggregationQuery = [];
    var query = {
        '$project': {
            'total': {
                '$add': [
                    new Date(1970 - 1 - 1), {
                        '$multiply': ['$timestamp', 1000]
                    }
                ]
            },
            'amount': {
                '$add': ['$paid_count', '$unpaid_count']
            }
        }
    };

    var query1 = {
        '$group': {
            '_id': {
                '$dateToString': {
                    'format': '%d/%m/%Y',
                    'date': '$total'
                }
            },
            'sentsCount': {
                '$sum': '$amount'
            }
        }
    };

    var query2 = {
        '$sort': {
            '_id': 1
        }
    };

    aggregationQuery.push(query);
    aggregationQuery.push(query1);
    aggregationQuery.push(query2);

    staticsDbo.getStatisticAggregationResult(aggregationQuery, function (error, result) {
        if (error) {
            console.log('Error while getting total sents used', error);

            res.status(400).json({
                status: false,
                message: 'Error while getting total sents used',
                errors: error
            });
        } else {
            res.status(200).json({
                status: true,
                results: result
            });
        }
    });
};