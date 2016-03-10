var adb = require('adbkit'),
  Promise = require('bluebird'),
  client = adb.createClient();
var packagename = 'com.main.UCMobile'; //内核包名
client.listDevices()
  .then(function(devices) {
    console.log('devices: ' + JSON.stringify(devices));
    return Promise.map(devices, function(device) {
      return new Promise(function(resolve, reject) {
        client.uninstall(device.id, packagename, function(err) {
          if (err) {
            throw new Error(' uninstall failed: ' + err);
            process.exit(1);
          }
          console.log(' uninstall successful...');
          resolve();
        });
      })
    })
  })
  .catch(function(err) {
    console.error('Error: ', err.stack);
    process.exit(1);
  });
