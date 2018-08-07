var chalk = require('chalk'),
    mongoose = require('mongoose'),
    init = require('./config/init')(),
    config = require('./config/config');

// Bootstrap db connection
var db = mongoose.connect(config.db.url, config.db.options, function (err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(chalk.red(err));
    }
  });
  
  mongoose.connection.on("open", function(ref) {
    console.log("Connected to mongo server.");
    //return start_up();
  });
  
  mongoose.connection.on('error', function (err) {
      console.error(chalk.red('MongoDB connection error: ' + err));
      process.exit(-1);
    }
  );

var app = require('./config/express')(db);

app.listen(config.port);
module.exports = app;

console.log(chalk.green('Application started'));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.db.url));