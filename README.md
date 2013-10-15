# selenium-helper

The installer script is borrowed from `protractor`

## Installer

```javascript
var install = require('selenium-helper').installer;
install();
```

That will download selenium with the chrome webdriver and create the directory and script `selenium/start` which is then used by the runner.

## Runner

The runner expects selenium to have been installed per the above spec. Also remember that Selenium requires Java.

The `#start` method will handle starting selenium and waiting for it to be ready, at which point it calls your callback.
The `#stop` method will send SIGINT to the selenium process.

Example usage:

```javascript
var spawn = require('child_process').spawn;
var selenium = require('selenium-helper').runner;

selenium.start(function() {
  var feature_tests = spawn('cucumber.js', ['-f', 'pretty']);
  feature_tests.stdout.on('data', log);
  feature_tests.on('exit', function(code) {
    selenium.stop();
    process.exit(code);
  });
});
```
