	module.exports = function(next){
		var imageTag = document.createElement('img'),
			random = Math.random()*1e16;
		//imageTag.src = 'http://reader.dolphin-browser.com/images/chbg.jpg?t=' + random;
		imageTag.src = 'http://tp3.sinaimg.cn/2371564754/180/5729669765/1?t=' + random;
		imageTag.onload = function(){
			next();
		};
		imageTag.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(imageTag);
		console.log('loadImage working...');
	};
