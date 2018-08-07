var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var connectionSchema = new Schema({
  usage: {
    down: Number,
    up: Number
  },
  session_name: String,
  start_time: Number,
  client_addr: String,
  vpn_addr: String,
  end_time: Number,
  server_usage: {
    down: Number,
    up: Number
  }
});

module.exports = mongoose.model('Connection', connectionSchema);