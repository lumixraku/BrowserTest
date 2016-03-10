//测试server端返回304，浏览器的行为
define('suites/cache/cacheFromServer', [], function(){
	var iframe = document.createElement('iframe');
	iframe.id = 'cacheFromServerSuite';
	var cacheSuite = {
		prep: function(next){
			var random = Math.random()*1e16;
			iframe.src = '/304page?t='+random;
			iframe.onload = function(){
				iframe.onload = function(){
					next();
				};
				document.getElementById('cacheFromServerSuite').contentWindow.window.location.reload();
			};
			iframe.onerror = function(){
				alert('当前用例准备失败，请刷新重试！');
			};
			document.getElementById('cache-area').appendChild(iframe);
			
		},
		test: function(next){
			var iframeWin = document.getElementById('cacheFromServerSuite').contentWindow.window,
				timeoutId;
			iframeWin.testCache304 = false;
			iframe.onload = function(){
				clearTimeout(timeoutId);
				if(iframeWin.testCache304){
					next();
				}else{
					next(null, 'failed');
				}
			};
			iframeWin.location.reload(false);
			timeoutId = setTimeout(function(){
				next(null, 'failed');
			}, 1000);
			console.log('cacheFromServer working...');
		}
	};

	return cacheSuite;
});