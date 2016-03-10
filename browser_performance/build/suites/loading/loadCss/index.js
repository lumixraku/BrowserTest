define('suites/loading/loadCSS/index', [], function(){
	return function(next){
		var iframe = document.createElement('iframe'),
			random = Math.random()*1e16;
		var html = '<head><link rel="stylesheet" id="test-css-loading-speed" href="http://test1.dolphin-browser.com/pychen/ua/testCss.css?t='+random+'"></head><body>Foo</body>';
		iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
		iframe.onload = function(){
			next();
		};
		iframe.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(iframe);
		console.log('loadCSS working...');
	};
});