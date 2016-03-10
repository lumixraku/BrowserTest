var adb = require('adbkit'),
  Promise = require('bluebird'),
  client = adb.createClient(),
  schedule = require("node-schedule");
var interval = 3 * 60 * 1000, //每个browser执行15分钟
  repeats = 10, //重复试验10次
  host = 'http://192.168.1.109:8000',
  apks = [
    // {
    //   'browser': 'UC',
    //   'pn': 'com.UCMobile',
    //   'activity': 'com.UCMobile.main.UCMobile'
    // },
    // {
    //   'browser': 'Baidu',
    //   'pn': 'com.baidu.browser.apps',
    //   'activity': 'com.baidu.browser.framework.BdBrowserActivity'
    // }, {
    //   'browser': 'QQ',
    //   'pn': 'com.tencent.mtt',
    //   'activity': 'com.tencent.mtt.SplashActivity'
    // }, {
    //   'browser': 'Chrome',
    //   'pn': 'com.android.chrome',
    //   'activity': 'com.google.android.apps.chrome.Main'
    // },
    {
      'browser': 'Firefox',
      'pn': 'org.mozilla.firefox',
      'activity': 'com.activities.MainActivity'
    }
    // ,
    //  {
    //   'browser': '360',
    //   'pn': 'com.qihoo.browser',
    //   'activity': 'com.qihoo.browser.activity.SplashActivity'
    // },
    // {
    //   'browser': 'Cheetah',
    //   'pn': 'com.ijinshan.browser_fast',
    //   'activity': 'com.ijinshan.browser.screen.SplashActivity'
    // }
    // ,
    // {
    //   browser:'default',
    //   pn:'com.android.browser',//com.android.browser  com.google.android.browser
    //   activity:'com.android.browser.BrowserActivity' //com.google.android.browser.BrowserActivity
    // }
  ];

// client.listDevices().then(function(devices){
//  console.log('devices: '+ JSON.stringify(devices));
// })

// schedule.scheduleJob({hour: 20, minute: 17}, function(){
console.log('今天的测试开始时间' + new Date());
client.listDevices()
  .then(function(devices) {
    console.log('devices: ' + JSON.stringify(devices));
    return Promise.map(devices, function(device) {
      return Promise.reduce(apks, function(pass, apk) {
          //启动浏览器并开启测试页面
          var testUrl = host + '/Sites/dist/?type=repeat&repeatTime=' + repeats + "&browser=" + apk.browser;
          //command = 'adb shell am start -a android.intent.action.VIEW -c android.intent.category.LAUNCHER -n '+ appName +' -d ' + testUrl;
          return new Promise(function(resolve, reject) {
              return client.startActivity(device.id, {
                  'action': 'android.intent.action.VIEW',
                  'data': testUrl,
                  'category': 'android.intent.category.LAUNCHER',
                  'component': apk.pn + '/' + apk.activity
                })
                .then(function() {
                  console.log(apk.browser + ' start successful...');
                  resolve();
                })
                .catch(function(err) {
                  throw new Error('start failed: ' + err);
                });

            })
            .then(function() { //给每个浏览器相同的测试时间
              return new Promise(function(resolve, reject) {
                setTimeout(function() {
                  resolve();
                }, interval);
              });
            })
            .then(function() {
              return client.shell(device.id, 'am force-stop ' + apk.pn)
                .then(function() {
                  console.log('kill ' + apk.browser + ' successful...');
                });
            })
        }, 0)
        .then(function() {
          return;
        })
    })
  })
  .then(function() {
    console.log('Run test on all browsers successful');
  })
  .catch(function(err) {
    console.error('Error: ', err.stack);
    process.exit(1);
  });
// });
