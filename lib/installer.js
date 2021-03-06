module.exports = function () {
  var fs = require('fs');
  var os = require('os');
  var url = require('url');
  var http = require('http');
  var AdmZip = require('adm-zip')

  // Download the Selenium Standalone jar and the ChromeDriver binary to
  // ./selenium/
  // Thanks to http://www.hacksparrow.com/using-node-js-to-download-files.html
  // for the outline of this code.
  var SELENIUM_URL =
    'http://selenium.googlecode.com/files/selenium-server-standalone-2.35.0.jar';
  var CHROMEDRIVER_URL_MAC =
    'https://chromedriver.googlecode.com/files/chromedriver_mac32_2.2.zip';
  var CHROMEDRIVER_URL_LINUX32 =
    'https://chromedriver.googlecode.com/files/chromedriver_linux32_2.2.zip';
  var CHROMEDRIVER_URL_LINUX64 =
    'https://chromedriver.googlecode.com/files/chromedriver_linux64_2.2.zip';
  var CHROMEDRIVER_URL_WINDOWS =
    'https://chromedriver.googlecode.com/files/chromedriver_win32_2.2.zip';

  var DOWNLOAD_DIR = './selenium/';
  var START_SCRIPT_FILENAME = DOWNLOAD_DIR + 'start';
  var chromedriver_url = '';
  var start_script = 'java -jar selenium/selenium-server-standalone-2.35.0.jar';


  if (!fs.existsSync(DOWNLOAD_DIR) || !fs.statSync(DOWNLOAD_DIR).isDirectory()) {
    fs.mkdirSync(DOWNLOAD_DIR);
  }

  console.log(
    'When finished, start the Selenium Standalone Server with ./selenium/start \n');

    // Function to download file using HTTP.get
    var download_file_httpget = function(file_url, callback) {
      console.log('downloading ' + file_url + '...');
      var options = {
        host: url.parse(file_url).host,
        port: 80,
        path: url.parse(file_url).pathname
      };

      var file_name = url.parse(file_url).pathname.split('/').pop();
      var file_path = DOWNLOAD_DIR + file_name;
      var file = fs.createWriteStream(file_path);

      http.get(options, function(res) {
        res.on('data', function(data) {
          file.write(data);
        }).on('end', function() {
          file.end(function() {
            console.log(file_name + ' downloaded to ' + file_path);
            if (callback) {
              callback(file_path);
            }
          });
        });
      });
    };

    download_file_httpget(SELENIUM_URL);

    if (!(process.argv[2] == '--nocd')) {
      if (os.type() == 'Darwin') {
        chromedriver_url = CHROMEDRIVER_URL_MAC;
      } else if (os.type() == 'Linux') {
        if (os.arch() == 'x64') {
          chromedriver_url = CHROMEDRIVER_URL_LINUX64;
        } else {
          chromedriver_url = CHROMEDRIVER_URL_LINUX32;
        }
      } else if (os.type() == 'Windows_NT') {
        chromedriver_url = CHROMEDRIVER_URL_WINDOWS;
      }

      var chromedriver_zip = chromedriver_url.split('/').pop();
      start_script += ' -Dwebdriver.chrome.driver=./selenium/chromedriver';

      download_file_httpget(chromedriver_url, function(file_name) {
        var zip = new AdmZip(file_name);
        zip.extractAllTo(DOWNLOAD_DIR);
        if (os.type() != 'Windows_NT') {
          fs.chmod(DOWNLOAD_DIR + 'chromedriver', 0755);
        }
      });
    }

    var start_script_file = fs.createWriteStream(START_SCRIPT_FILENAME);
    start_script_file.write(start_script);
    start_script_file.end(function() {
      fs.chmod(START_SCRIPT_FILENAME, 0755);
    });
};

