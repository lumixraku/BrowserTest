module.exports = function() {
  var self,
    stack = [],
    timerId;
  self = {
    destroy: function() {
      timerId && clearTimeout(timerId);
    },
    par: function(callback, isSeq) {
      if (isSeq || !(stack[stack.length - 1] instanceof Array)) stack.push([]);
      stack[stack.length - 1].push(callback);
      return self;
    },
    seq: function(callback) {
      return self.par(callback, true);
    },
    _next: function(err, result) {
      /*jshint loopfunc: true */
      // var browserTest = window.browserTest,
        // curSuiteTimer = browserTest.suiteTimer['suite' + browserTest.curTest];
        curSuiteTimer = suiteTimer['suite' + curTest];
        //不能放在这里  因为第一次执行_next函数的时候   suiteTimer里面还没有任何key
        // curSuiteTimer.end = new Date().getTime();
      if (curSuiteTimer && result == 'done') {
        curSuiteTimer.end = new Date().getTime();
        browserTest.succeededUpdate();
        // DOM.updateResults(1);
        // console.log('suite' + browserTest.curTest + ': ' + JSON.stringify(curSuiteTimer));
        console.log('suite' + curTest + ': ' + JSON.stringify(curSuiteTimer));
      } else if (curSuiteTimer && result == 'failed') {
        curSuiteTimer.end = new Date().getTime();
        browserTest.failedUpdate();
        // DOM.updateResults(0);
        // console.log('suite' + browserTest.curTest + ': failed!');
        // console.log('suite' + browserTest.curTest + ': ' + JSON.stringify(curSuiteTimer));
        console.log('suite' + curTest + ': failed!');
        console.log('suite' + curTest + ': ' + JSON.stringify(curSuiteTimer));
      }

      var errors = [],
        results = [],
        callbacks = stack.shift() || [],
        nbReturn = callbacks.length,
        isSeq = nbReturn == 1;
      for (var i = 0; i < callbacks.length; i++) {
        (function(fct, index) {
          fct(function(error, result) {
            errors[index] = error;
            results[index] = result;
            if (--nbReturn === 0) self._next(isSeq ? errors[0] : errors, isSeq ? results[0] : results);
          }, err, result);
        })(callbacks[i], i);
      }
    },
    run: function() {
      timerId = setTimeout(function() {
        timerId = null;
        self._next();
      }, 0);
    }
  };
  return self;
};
