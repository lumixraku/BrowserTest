define('app/flow', [], function(){
return function(){
	var self,
		stack = [],
		timerId;
	self = {
		destroy: function(){
			timerId && clearTimeout(timerId);
		},
		par: function(callback, isSeq){
			if(isSeq || !(stack[stack.length-1] instanceof Array)) stack.push([]);
			stack[stack.length-1].push(callback);
			return self;
		},
		seq: function(callback){
			return self.par(callback, true);
		},
		_next: function(err, result){
			/*jshint loopfunc: true */
			var browserTest = window.browserTest,
				curSuiteTimer = browserTest.suiteTimer['suite'+browserTest.curTest];
			if(curSuiteTimer && result == 'done'){
				curSuiteTimer.end = new Date().getTime();
				browserTest.succeededUpdate();
				console.log('suite'+browserTest.curTest+': '+ JSON.stringify(curSuiteTimer));
			}else if(curSuiteTimer && result == 'failed'){
				curSuiteTimer.end = new Date().getTime();
				browserTest.failedUpdate();
				console.log('suite'+browserTest.curTest+': failed!');
				console.log('suite'+browserTest.curTest+': '+ JSON.stringify(curSuiteTimer));
			}

			var errors = [], results = [], callbacks = stack.shift() || [], nbReturn = callbacks.length, isSeq = nbReturn == 1;
			for(var i = 0; i < callbacks.length; i++){
				(function(fct, index){
					fct(function(error, result){
						errors[index]	= error;
						results[index]	= result;		
						if(--nbReturn === 0)	self._next(isSeq?errors[0]:errors, isSeq?results[0]:results);
					}, err, result);
				})(callbacks[i], i);
			}
		},
		run: function(){
			timerId = setTimeout(function(){ timerId = null; self._next(); }, 0);
		}
	};
	return self;
};
});