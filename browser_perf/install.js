var adb = require('adbkit'),
  Promise = require('bluebird'),
  client = adb.createClient();
var packagename = 'com.main.UCMobile'; //内核包名
var apkPaths = ['360.apk', 'baidu.apk', 'cheetah.apk', 'Chrome.apk', 'QQ.apk', 'UC.apk'];
apkPaths = apkPaths.map(function(item) {
  return './apks/' + item;
});
client.listDevices()
  .then(function(devices) {
    console.log('devices: ' + JSON.stringify(devices));
    return Promise.map(devices, function(device) {
      return Promise.reduce(apkPaths, function(pass, path) {
        console.log(pass , path);
        return new Promise(function(resolve, reject) {
          return client.install(device.id, path)
            .then(function() {
              console.log(path +' install successful...');
              resolve(1);
            })
            .catch(function(err) {
              throw new Error(path + ' install failed: ' + err);
              reject();
            });
        });

      }, 0)
      .then(function(){
        return;
      });

    })
  })
  .catch(function(err) {
    console.error('Error: ', err.stack);
    process.exit(1);
  });
