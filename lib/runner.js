var runner = function() {
  var spawn = require('child_process').spawn;

  var fs = require('fs');

  var jarFile = 'selenium/selenium-server-standalone-2.35.0.jar';

  var driverArg = '-Dwebdriver.chrome.driver=./selenium/chromedriver';

  var selenium_process = null;

  var ready = function() {};

  var listener = function(data) {
    var output = data.toString().replace(/\n$/, '');
    if (/Started org.openqa.jetty.jetty.Server/.test(output)) {
      console.log("Selenium is ready.");
      selenium_process.stdout.removeListener('data', listener);
      selenium_process.stderr.removeListener('data', listener);
      ready();
    }
    else if (/java.net.BindException/.test(output)) {
      throw new Error(output);
    }
  };

  this.stop = function(callback) {
    selenium_process.on('close', function() {
      console.log("Selenium has closed.");
      if (typeof(callback) == 'function') callback();
    });
    selenium_process.kill();
  },

  this.start = function(callback) {
    ready = callback;
    if (!fs.existsSync(jarFile))
      throw new Error("Please install Selenium. File did not exist: "+jarfile);
    selenium_process = spawn('java', ['-jar', jarFile, driverArg]);
    selenium_process.on('error', function(err) {
      if (err.code == 'ENOENT')
        throw new Error("You need Java to use Selenium");
    });
    selenium_process.stdout.on('data', listener);
    selenium_process.stderr.on('data', listener);
  }
};

module.exports = new runner();
