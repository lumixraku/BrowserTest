	module.exports =  function(next){
		var iframe = document.createElement('iframe'),
			random = Math.random()*1e16;
		var html = '<head><link rel="stylesheet" id="test-css-loading-speed" href="http://localhost:8000/Sites/dist/css/testCss.css?t='+random+'"></head><body>Foo</body>';
		// iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
		iframe.src = '../src/suites/loading/loadCss/csshtml.html';
		iframe.onload = function(){
			next();
		};
		iframe.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(iframe);
		console.log('loadCSS working...');
	};
