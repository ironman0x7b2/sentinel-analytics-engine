var statsController = require('../controllers/stats.controller');

module.exports = function (app) {
    app.route('/stats/sessions/all').get(statsController.getDailySessionCount);

    app.route('/stats/sessions/active').get(statsController.getActiveSessionCount);

    app.route('/stats/sessions/average').get(statsController.getAverageSessionsCount);

    app.route('/stats/nodes/all').get(statsController.getTotalNodeCount);

    app.route('/stats/nodes/active').get(statsController.getDailyActiveNodeCount);

    app.route('/stats/nodes/active').get(statsController.getAverageNodesCount);

    app.route('/stats/nodes/new').get(statsController.getDailyNodeCount);

    app.route('/stats/nodes/active').get(statsController.getActiveNodeCount);

    app.route('/stats/bandwidth/average').get(statsController.getDailyDataCount);

    app.route('/stats/bandwidth/all').get(statsController.getTotalDataCount);

    app.route('/stats/bandwidth').get(statsController.getLastDataCount);

    app.route('/stats/sessions/duration').get(statsController.getDailyDurationCount);

    app.route('/stats/sessions/duration').get(statsController.getAverageDuration);

    app.route('/stats/sessions/duration/average').get(statsController.getDailyAverageDuration);

    app.route('/stats/sessions/duration/average').get(statsController.getLastAverageDuration);

    app.route('/stats/payments/all/day').get(statsController.getDailyPaidSentsCount);

    app.route('/stats/payments/average/day').get(statsController.getAveragePaidSentsCount);

    app.route('/stats/earnings/all').get(statsController.getDailyTotalSentsUsed);
};