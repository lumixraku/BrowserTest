define('suites/loading/loadImage', function(){
	return function(next){
		var imageTag = document.createElement('img'),
			random = Math.random()*1e16;
		//imageTag.src = 'http://reader.dolphin-browser.com/images/chbg.jpg?t=' + random;
		imageTag.src = 'http://webapp.statics.dolphin.com/web_statics/images/covers/%E5%A8%B1%E4%B9%90%E5%85%AB%E5%8D%A6.png?t=' + random;
		imageTag.onload = function(){
			next();
		};
		imageTag.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(imageTag);
		console.log('loadImage working...');
	};
});