	module.exports = function(next){
		var iframe = document.createElement('iframe');
		var html = '<body>Foo</body>';
		//iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);  // Baidu Failed
		iframe.src = '../src/suites/loading/loadhtml.html';
		iframe.onload = function(){
			next();
		};
		iframe.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(iframe);
		console.log('loadHtml working...');
	};
