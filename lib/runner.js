var spawn = require('child_process').spawn;

var selenium = {
  listener: function(data) {
    var output = data.toString().replace(/\n$/, '');
    if (/Started org.openqa.jetty.jetty.servlet.ServletHandler/.test(output)) {
      selenium.process.stdout.removeListener('data', selenium.listener);
      setTimeout(selenium.ready, 500);
    }
  },
  stop: function(callback) {
    selenium.process.kill('SIGINT');
  },
  start: function(callback) {
    selenium.ready = callback();
    selenium.process = spawn('./selenium/start');
    selenium.process.stdout.on('data', selenium.listener);
  }
};

module.exports = selenium;
