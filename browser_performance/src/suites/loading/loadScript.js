define('suites/loading/loadScript', function(){
	var scriptId = 'loadscriptID';
	var loadscriptSuite = {
		test: function(next){
			var scriptTag = document.createElement('script'),
				random = Math.random()*1e16;
			scriptTag.id = scriptId;
			scriptTag.src = 'http://webapp.statics.dolphin.com/web_statics/scripts/baina.min.js?t=' + random;
			scriptTag.onload = function(){
				next();
			};
			scriptTag.onerror = function(){
				next(null, 'failed');
			};
			document.getElementsByTagName('head')[0].appendChild(scriptTag);
			console.log('loadScript working...');
		},
		clear: function(){
			document.getElementsByTagName('head')[0].removeChild(document.getElementById(scriptId));
		}
	};

	return loadscriptSuite;
});