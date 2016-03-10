var jsSpeed = require('../suites/base/jsspeed');
var dom = require('../suites/base/dom');
var querySelector = require('../suites/base/querySelector');

var loadHtml = require('../suites/loading/loadHtml');
var loadImage = require('../suites/loading/loadImage');
var loadScript = require('../suites/loading/loadScript');
var loadCSS = require('../suites/loading/loadCSS');;
var localStorage = require('../suites/cache/localStorage');

var appcache = require('../suites/cache/appcache');
var cacheFromServer = require('../suites/cache/cacheFromServer');
var cssToggle = require('../suites/rendering/csstoggle/index');



module.exports = {
   base: [
     ['Javascript execute speed', jsSpeed],
     ['DOM core', dom],
     ['querySelector speed',querySelector]
   ],
   loading: [
     ['load iframe speed', loadHtml],
     ['load image speed', loadImage],
     ['load script speed', loadScript],
     ['load css speed', loadCSS]
   ],
   cache: [
     ['loadStorage speed',localStorage],
     ['appcache speed', appcache],
     ['304 cache', cacheFromServer]
   ],
   rendering: [
     ['toggle css speed', cssToggle]
   ]
};


//control the execute order of tests in each period
// define('app/config', ['suites/base/jsspeed', 'suites/base/dom','suites/base/querySelector', 'suites/cache/localStorage', 'suites/cache/appcache', 'suites/cache/cacheFromServer', 'suites/loading/loadHtml', 'suites/loading/loadImage', 'suites/loading/loadScript', 'suites/loading/loadCSS/index', 'suites/rendering/csstoggle/index'], function(jsSpeed, dom, querySelector ,localStorage, appcache, cacheFromServer, loadHtml, loadImage, loadScript, loadCSS, cssToggle){
// 	var config = {
// 		base: [
// 			['Javascript execute speed', jsSpeed],
// 			['DOM core', dom],
// 			['querySelector speed',querySelector]
// 		],
// 		loading: [
// 			['load iframe speed', loadHtml],
// 			['load image speed', loadImage],
// 			['load script speed', loadScript],
// 			['load css speed', loadCSS]
// 		],
// 		cache: [
// 			['loadStorage speed',localStorage],
// 			['appcache speed', appcache],
// 			['304 cache', cacheFromServer]
// 		],
// 		rendering: [
// 			['toggle css speed', cssToggle]
// 		]
// 	};
// 	return config;
// });