//control the execute order of tests in each period
define('app/config', ['suites/base/jsspeed', 'suites/base/dom','suites/base/querySelector', 'suites/cache/localStorage', 'suites/cache/appcache', 'suites/cache/cacheFromServer', 'suites/loading/loadHtml', 'suites/loading/loadImage', 'suites/loading/loadScript', 'suites/loading/loadCSS/index', 'suites/rendering/csstoggle/index'], function(jsSpeed, dom, querySelector ,localStorage, appcache, cacheFromServer, loadHtml, loadImage, loadScript, loadCSS, cssToggle){
	var config = {
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
	return config;
});