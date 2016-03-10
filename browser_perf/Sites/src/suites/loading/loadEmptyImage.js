
	module.exports = function(next){
		var imageTag = document.createElement('img');
		imageTag.onload = function(){
			next();
		};
		imageTag.onerror = function(){
			next(null, 'failed');
		};
		document.getElementById('loading-area').appendChild(imageTag);
		console.log('loadEmptyImage working...');
	};
