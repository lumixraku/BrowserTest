define('suites/rendering/rendering', function(){
	return function(next){
		assertEqual(true, false, 'test...');
		console.log('rendering working...');
		next();
	};
});