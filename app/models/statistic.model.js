var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var statisticSchema = new Schema({
  timestamp: Number,
  nodes: {
    up: Number,
    total: Number
  }
});

module.exports = mongoose.model('Statistic', statisticSchema);