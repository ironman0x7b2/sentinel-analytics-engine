var statsController = require('../controllers/stats.controller');

module.exports = function (app) {
    app.route('/api/sessions/daily-stats').get(statsController.getDailySessionCount);

    app.route('/api/sessions/active-count').get(statsController.getActiveSessionCount);

    app.route('/api/sessions/average-count').get(statsController.getAverageSessionsCount);

    app.route('/api/nodes/total-nodes').get(statsController.getTotalNodeCount);

    app.route('/stats/nodes/daily-active').get(statsController.getDailyActiveNodeCount);

    app.route('/stats/nodes/average-nodes').get(statsController.getAverageNodesCount);

    app.route('/stats/nodes/daily-stats').get(statsController.getDailyNodeCount);

    app.route('/stats/nodes/active-count').get(statsController.getActiveNodeCount);

    app.route('/stats/data/daily-stats').get(statsController.getDailyDataCount);

    app.route('/stats/data/total-data').get(statsController.getTotalDataCount);

    app.route('/stats/data/last-data').get(statsController.getLastDataCount);

    app.route('/stats/time/daily-stats').get(statsController.getDailyDurationCount);

    app.route('/stats/time/average-duration').get(statsController.getAverageDuration);

    app.route('/stats/time/average-daily').get(statsController.getDailyAverageDuration);

    app.route('/stats/time/last-average').get(statsController.getLastAverageDuration);

    app.route('/stats/payment/paid-sents-count').get(statsController.getDailyPaidSentsCount);

    app.route('/stats/payment/average-paid-sents').get(statsController.getAveragePaidSentsCount);

    app.route('/stats/payment/total-sents-used').get(statsController.getDailyTotalSentsUsed);
};