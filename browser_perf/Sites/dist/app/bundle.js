/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**************************!*\
  !*** ./src/app/index.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	// http://localhost:8000/Sites/dist/?type=repeat&repeatTime=3&browser=pc
	
	var _ = __webpack_require__(/*! ../lib/lodash.min */ 1);
	var flow = __webpack_require__(/*! ./flow */ 3);
	var tests = __webpack_require__(/*! ./tests */ 4);
	var Timer = __webpack_require__(/*! ./timer */ 18);
	var canvasDrawer = __webpack_require__(/*! ./canvasDrawer */ 19);
	
	
	if (window.applicationCache) {
	  $(applicationCache).on('noupdate', function() {
	    if (!window.browserTest.status) {
	      window.browserTest.start();
	    }
	  }).on('cached', function() {
	    window.browserTest.restart();
	  }).on('error', function(e) {
	    console.log('cache error: ' + e);
	    window.browserTest.restart();
	  });
	}
	
	window.browserTest = {
	  version: 1.0,  //由于测试用例是在不断地变化的  所以需要区分
	  //常量=========================================
	  repeatTimeKey: 'repeatTime',
	  numOfTestHasExecutedKey: 'numOfTestHasExecuted',
	  startTag: 'start',
	  //DOM=========================================
	  resultDom: $('.main-result'),
	  periodsWrapper: $('.main-result .periods'),
	  curScore: $('.cur-score'),
	  stopBtn: $('.stop-btn'),
	  sendBtn: $('.send-btn'),
	  testMsg: $('.test-msg'),
	  //保存测试结果对象 ===============================================
	  status: null, //测试状态的全局开关
	  timer: null, //记录总花费时间
	  // suiteTimer: {}, //记录所有用例的start  end  时间戳
	  period: ['base', 'loading', 'cache', 'rendering'],
	  periodTimer: {}, //每个period以及对应的测试用例所花费的时间
	  suites: {}, //存放所有的测试suiteObj对象  它包括测试用例对象  还有所属的period之类的
	  totalTestsLen: 0, //所有用例总个数
	  totalTests: [], //所有测试用例集合  比如 dom.js  cache.js 所返回的对象都在这里
	  // curTest: 0, //当前执行到第几个测试用例
	  pass: 0, //成功的用例个数
	  fails: 0, //失败的用例个数
	  log: '',
	  //请求发送的数据================================================
	  testResult: {
	    all: {},
	    periods: {}
	  },
	  //其它 =======================================================
	  paramObj: {}, //URL参数对象
	  isRepeat: false, //标志  本次测试是否是循环测试
	  start: function() {
	    var self = this;
	    self.reset();
	    self.timer = new Timer();
	    self.bindEvent();
	    //构造对象 ======================================================
	    //self.period  ['base', 'loading', 'cache', 'rendering'],
	    $.each(self.period, function(index, periodName) {
	      var periodTests = tests[periodName], //得到了periodName阶段所有的测试用例  比如所有base的用例
	        suiteObj;
	      //构造suite object //包括该测试用例所属的periodName  实际的测试函数
	      for (var i = 0, l = periodTests.length; i < l; i++) {
	        suiteObj = {
	          suite: periodTests[i],
	          periodIndex: index,
	          periodName: periodName,
	          pass: true
	        };
	        suiteObj.isLast = (i == periodTests.length - 1);
	        self.suites['suite' + (self.totalTestsLen + i)] = suiteObj;
	      }
	
	      //构造period object
	      self.periodTimer[periodName] = {
	        periodName: periodName,
	        total: periodTests.length,
	        pass: 0,
	        fail: 0,
	        elapsed: 0,
	        suites: {} //用例记录当前period所有用例花费时间
	      };
	      self.totalTests = self.totalTests.concat(periodTests);
	      self.totalTestsLen += periodTests.length;
	    });
	    //获取URL参数到对象中
	    self.getURLParam();
	    self.checkRepeat();
	    self.timer.start();
	    self.progress();
	  },
	  progress: function() {
	    /*jshint loopfunc: true */
	    //初始化，遍历
	    var self = this,
	      flowObj = flow();
	    for (var i = 0; i < self.totalTestsLen; i++) {
	      (function(i) {
	        /*jshint unused:false */
	        var suite = self.totalTests[i][1], //tests中每个用例为一个数组[suitename, suite]
	          mainSuite = suite,clearSuite;
	        //suite有两种形式: 单纯的函数型  suite本身就是一个函数  比如jsspeed
	        //另一种是对象型   这类测试一般包含一些准备工作和清理工作  比如dom.js
	        if (Object.prototype.toString.call(suite) == '[object Object]') {
	          if (suite.prep) {//说明suite有preparation
	            //有些prep函数本身就是异步操作 (比如CacheFromServer  该prep函数有一个next参数 )
	            //判断一个函数的形参个数  可以  函数名.length
	            if (suite.prep.length === 0) {  //表示prep不是异步函数
	              flowObj.seq(function(next, err, result) {
	                try {
	                  suite.prep();
	                  next();
	                } catch (e) {
	                  alert('第' + (i + 1) + '个用例准备失败，请刷新重试！');
	                }
	              });
	            } else {
	              flowObj.seq(suite.prep);
	            }
	          }
	          mainSuite = suite.test;
	          clearSuite = suite.clear;
	        }
	
	        //准备工作完成  正式测试开始=====================================
	        flowObj.seq(function(next, error, result) {
	          //如果suite有preparation，这时suite的preparation已经执行完，开始该用例的计时
	          // self.curTest = i;
	          curTest = i;
	          //self.suiteTimer['suite' + i] = {
	          suiteTimer['suite' + i] = {
	            start: new Date().getTime()
	          };
	          next();
	        }).seq(function(next, err, result) {
	          try {
	            //mainSuite(next);
	            //mainSuite就是一个测试用例中的test()
	            //test()函数也有可能是异步的 比如CacheFromServer  这个异步test将会接受一个next()函数
	            mainSuite.call(suite, next);
	            //非异步的test不会接受任何参数  需要手动调用test()
	            if (mainSuite.length === 0) {
	              next();
	            }
	          } catch (e) {
	            next(null, 'failed');
	          }
	        }).seq(function(next, err, result) {
	          if (result == 'failed') { //如果当前用例失败了，则直接next()
	            next();
	          } else {
	            next(null, 'done');
	          }
	        });
	        if (clearSuite) {
	          flowObj.seq(function(next, err, result) { //用例的clear函数
	            clearSuite();
	            next();
	          });
	        }
	      })(i);
	    }
	
	    flowObj.seq(function(next) {
	      /*jshint unused:false */
	      self.endCount();
	    }).run();
	  },
	  //测试用例跑完了  开始数据统计
	  endCount: function() {
	    var self = this,
	      elapsedTime = self.timer.elapsed() / 1000,
	      item, itemTimer, itemElapsed,
	      now = new Date();
	    self.log += 'Total elapsed time: ' + elapsedTime.toFixed(2) + 's';
	
	    //self.flowObj.destroy();
	
	    //测试结束后进行数据统计
	    self.testResult.day = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
	    self.testResult.ua = window.navigator.userAgent.toLowerCase();
	    self.testResult.version = self.version;
	    self.testResult.all = {
	      total: self.totalTestsLen,
	      pass: self.pass,
	      fail: self.fails,
	      elapsed: self.timer.elapsed()
	    };
	    for (var i in self.suites) {
	      item = self.suites[i];
	      //itemTimer = self.suiteTimer[i];
	      itemTimer = suiteTimer[i];
	      itemElapsed = itemTimer.end - itemTimer.start;
	      //存储该periodTimer下每一个测试suites的花费时间
	      self.periodTimer[item.periodName].suites[item.suite[0]] = itemElapsed;
	      self.periodTimer[item.periodName].elapsed += itemElapsed;
	    }
	    self.testResult.periods = self.periodTimer;
	    //更新每阶段所用的时间
	    $.each(self.period, function(index, val) {
	      $('#period' + index).html(self.periodTimer[val].elapsed);
	    });
	    self.updateCanvasList();
	    //循环重复测试用============================================================
	    //计数加1
	    sessionStorage.setItem(self.numOfTestHasExecutedKey, (parseInt(sessionStorage.getItem(self.numOfTestHasExecutedKey)) + 1));
	    //如果传了参数且参数正确
	    if (self.isRepeat) {
	      self.testResult.browser = self.paramObj.browser;
	      self.sendResult();
	      self.showFinishInfo(parseInt(sessionStorage.getItem(self.numOfTestHasExecutedKey)));
	      self.doTestAgain();
	    } else {
	      self.showReportPanel();
	    }
	  },
	  reset: function() {
	    var self = this;
	    self.periodTimer = {};
	    self.suites = {};
	    self.totalTests = [];
	    self.totalTestsLen = 0;
	    self.timer = null;
	    self.status = null;
	  },
	  restart: function() {
	    window.location.reload();
	  },
	  failedUpdate: function() {
	    var self = this,
	      // curSuite = self.suites['suite' + self.curTest];
	      curSuite = self.suites['suite' + curTest];
	    curSuite.pass = false;
	    self.periodTimer[curSuite.periodName].fail += 1;
	    self.fails += 1;
	  },
	  succeededUpdate: function() {
	    var self = this,
	      curSuite = self.suites['suite' + curTest], //当前测试用例
	      curPeriodDomId = 'period' + curSuite.periodIndex;
	    //curSuite.periodName  当前测试用例所属的periodName  比如base cache...
	    self.periodTimer[curSuite.periodName].pass += 1;
	    self.pass += 1;
	    self.curScore.html(self.pass);
	    if ($('#' + curPeriodDomId).length === 0) {
	      self.periodsWrapper.append('<div id="' + curPeriodDomId + '" class="period zp"></div>');
	    } else {
	      $('#' + curPeriodDomId)[0].className += 'p';
	    }
	    if (curSuite.isLast && self.periodTimer[curSuite.periodName].fail === 0) {
	      $('#' + curPeriodDomId)[0].classList.add('completed');
	    }
	  },
	  updateCanvasList: function(){
	    var self = this;
	    for(var periodName in self.periodTimer){
	      var periodInfo = self.periodTimer[periodName];
	      var percents = [];
	      periodInfo.colors = colors;
	      for(var suite in periodInfo.suites){
	        percents.push(periodInfo.suites[suite]/periodInfo.elapsed);
	      }
	      var tempFun = _.template($('#canvasTemp').html());
	      $('.canvas-list').append($(   tempFun(periodInfo)      ));
	      canvasDrawer(periodName, percents);
	    }
	
	
	  },
	  showReportPanel: function() {
	    $('#report-wrap').show();
	  },
	  bindEvent: function() {
	    var self = this;
	    self.sendBtn.on('click', function() {
	      self.testResult.browser = $('input[name=browser]:checked').val();
	      self.sendResult();
	    });
	    self.stopBtn.on('click', function() {
	      sessionStorage.removeItem(self.repeatTimeKey);
	      sessionStorage.removeItem(self.numOfTestHasExecutedKey);
	      self.stopBtn.removeClass('stop').addClass('success');
	      self.stopBtn.text('设置已清空');
	    });
	  },
	  sendResult: function() {
	    var self = this;
	    $.ajax({
	      type: 'POST',
	      url: '/record',
	      data: JSON.stringify(self.testResult),
	      success: function(data) {
	        /*jshint unused:false */
	        self.testMsg.text('结果保存成功!');
	      },
	      error: function(xhr, type) {
	        /*jshint unused:false */
	        self.testMsg.text('保存失败');
	        console.log('结果保存失败，重试，请勿刷新！');
	        console.log(xhr);
	        console.log(type);
	      }
	    });
	  },
	  //获取网页传递的参数  并验证正确性   只有在不传参  和参数全部正确才返回true  才能开始测试
	  getURLParam: function() {
	    var self = this,
	      arr = [],
	      paramObj = self.paramObj,
	      paramsArr = (window.location.search !== '') ? window.location.search.slice(1).split('&') : [];
	    //参数填充
	    paramsArr.forEach(function(item) {
	      arr = item.split('='); //aaa=bbb  等号缺少值的一方则得到""  如果缺失等号则只有一个元素  arr[1]为undefined
	      paramObj[arr[0]] = arr[1] || '';
	    });
	    //判断是否是循环
	    //所有参数正确才是循环
	    if ('type' in paramObj && paramObj.type !== '' &&
	      'repeatTime' in paramObj && paramObj.repeatTime !== '' &&
	      'browser' in paramObj && paramObj.browser !== ''
	    ) {
	      self.isRepeat = true;
	    }
	  },
	  //当前重复到第几次
	  checkRepeat: function() {
	    var self = this,
	      paramObj = self.paramObj,
	      repeatTimeKey = self.repeatTimeKey;
	
	    //测试开始
	    self.status = self.startTag;
	    $('.total').html('/ ' + self.totalTestsLen);
	    if (sessionStorage.getItem(repeatTimeKey) == null) { //第一次进入需要设置sessionStorage
	      if (self.isRepeat) {
	        sessionStorage.setItem(repeatTimeKey, paramObj.repeatTime);
	      } else {
	        sessionStorage.setItem(repeatTimeKey, 1);
	      }
	      sessionStorage.setItem(self.numOfTestHasExecutedKey, 0);
	    }
	  },
	  showFinishInfo: function(repeatTime) {
	    $('.num-of-test-time').text(repeatTime);
	    $('.finish-info').removeClass('hide').addClass('show');
	  },
	  doTestAgain: function() {
	    var self = this,
	      repeatTimeKey = self.repeatTimeKey,
	      hasExecutedKey = self.numOfTestHasExecutedKey;
	    if (parseInt(sessionStorage.getItem(hasExecutedKey)) < parseInt(sessionStorage.getItem(repeatTimeKey))) {
	      setTimeout(function() {
	        //如果点击过停止测试  那么repeatTime会为null
	        if (sessionStorage.getItem(repeatTimeKey) != null) {
	          self.restart();
	        }
	      }, 5000);
	    } else {
	      //本轮测试完毕
	      self.stopBtn.removeClass('stop').addClass('success').text('测试结束');
	      sessionStorage.removeItem(repeatTimeKey);
	      sessionStorage.removeItem(hasExecutedKey);
	    }
	  }
	};
	
	


/***/ },
/* 1 */
/*!*******************************!*\
  !*** ./src/lib/lodash.min.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * lodash 3.10.1 (Custom Build) lodash.com/license | Underscore.js 1.8.3 underscorejs.org/LICENSE
	 * Build: `lodash modern -o ./lodash.js`
	 */
	;(function(){function n(n,t){if(n!==t){var r=null===n,e=n===w,u=n===n,o=null===t,i=t===w,f=t===t;if(n>t&&!o||!u||r&&!i&&f||e&&f)return 1;if(n<t&&!r||!f||o&&!e&&u||i&&u)return-1}return 0}function t(n,t,r){for(var e=n.length,u=r?e:-1;r?u--:++u<e;)if(t(n[u],u,n))return u;return-1}function r(n,t,r){if(t!==t)return p(n,r);r-=1;for(var e=n.length;++r<e;)if(n[r]===t)return r;return-1}function e(n){return typeof n=="function"||false}function u(n){return null==n?"":n+""}function o(n,t){for(var r=-1,e=n.length;++r<e&&-1<t.indexOf(n.charAt(r)););
	return r}function i(n,t){for(var r=n.length;r--&&-1<t.indexOf(n.charAt(r)););return r}function f(t,r){return n(t.a,r.a)||t.b-r.b}function a(n){return Nn[n]}function c(n){return Tn[n]}function l(n,t,r){return t?n=Bn[n]:r&&(n=Dn[n]),"\\"+n}function s(n){return"\\"+Dn[n]}function p(n,t,r){var e=n.length;for(t+=r?0:-1;r?t--:++t<e;){var u=n[t];if(u!==u)return t}return-1}function h(n){return!!n&&typeof n=="object"}function _(n){return 160>=n&&9<=n&&13>=n||32==n||160==n||5760==n||6158==n||8192<=n&&(8202>=n||8232==n||8233==n||8239==n||8287==n||12288==n||65279==n);
	}function v(n,t){for(var r=-1,e=n.length,u=-1,o=[];++r<e;)n[r]===t&&(n[r]=z,o[++u]=r);return o}function g(n){for(var t=-1,r=n.length;++t<r&&_(n.charCodeAt(t)););return t}function y(n){for(var t=n.length;t--&&_(n.charCodeAt(t)););return t}function d(n){return Ln[n]}function m(_){function Nn(n){if(h(n)&&!(Oo(n)||n instanceof zn)){if(n instanceof Ln)return n;if(nu.call(n,"__chain__")&&nu.call(n,"__wrapped__"))return Mr(n)}return new Ln(n)}function Tn(){}function Ln(n,t,r){this.__wrapped__=n,this.__actions__=r||[],
	this.__chain__=!!t}function zn(n){this.__wrapped__=n,this.__actions__=[],this.__dir__=1,this.__filtered__=false,this.__iteratees__=[],this.__takeCount__=Ru,this.__views__=[]}function Bn(){this.__data__={}}function Dn(n){var t=n?n.length:0;for(this.data={hash:gu(null),set:new lu};t--;)this.push(n[t])}function Mn(n,t){var r=n.data;return(typeof t=="string"||ge(t)?r.set.has(t):r.hash[t])?0:-1}function qn(n,t){var r=-1,e=n.length;for(t||(t=Be(e));++r<e;)t[r]=n[r];return t}function Pn(n,t){for(var r=-1,e=n.length;++r<e&&false!==t(n[r],r,n););
	return n}function Kn(n,t){for(var r=-1,e=n.length;++r<e;)if(!t(n[r],r,n))return false;return true}function Vn(n,t){for(var r=-1,e=n.length,u=-1,o=[];++r<e;){var i=n[r];t(i,r,n)&&(o[++u]=i)}return o}function Gn(n,t){for(var r=-1,e=n.length,u=Be(e);++r<e;)u[r]=t(n[r],r,n);return u}function Jn(n,t){for(var r=-1,e=t.length,u=n.length;++r<e;)n[u+r]=t[r];return n}function Xn(n,t,r,e){var u=-1,o=n.length;for(e&&o&&(r=n[++u]);++u<o;)r=t(r,n[u],u,n);return r}function Hn(n,t){for(var r=-1,e=n.length;++r<e;)if(t(n[r],r,n))return true;
	return false}function Qn(n,t,r,e){return n!==w&&nu.call(e,r)?n:t}function nt(n,t,r){for(var e=-1,u=zo(t),o=u.length;++e<o;){var i=u[e],f=n[i],a=r(f,t[i],i,n,t);(a===a?a===f:f!==f)&&(f!==w||i in n)||(n[i]=a)}return n}function tt(n,t){return null==t?n:et(t,zo(t),n)}function rt(n,t){for(var r=-1,e=null==n,u=!e&&Er(n),o=u?n.length:0,i=t.length,f=Be(i);++r<i;){var a=t[r];f[r]=u?Cr(a,o)?n[a]:w:e?w:n[a]}return f}function et(n,t,r){r||(r={});for(var e=-1,u=t.length;++e<u;){var o=t[e];r[o]=n[o]}return r}function ut(n,t,r){
	var e=typeof n;return"function"==e?t===w?n:Bt(n,t,r):null==n?Fe:"object"==e?bt(n):t===w?ze(n):xt(n,t)}function ot(n,t,r,e,u,o,i){var f;if(r&&(f=u?r(n,e,u):r(n)),f!==w)return f;if(!ge(n))return n;if(e=Oo(n)){if(f=kr(n),!t)return qn(n,f)}else{var a=ru.call(n),c=a==K;if(a!=Z&&a!=B&&(!c||u))return Fn[a]?Rr(n,a,t):u?n:{};if(f=Ir(c?{}:n),!t)return tt(f,n)}for(o||(o=[]),i||(i=[]),u=o.length;u--;)if(o[u]==n)return i[u];return o.push(n),i.push(f),(e?Pn:_t)(n,function(e,u){f[u]=ot(e,t,r,u,n,o,i)}),f}function it(n,t,r){
	if(typeof n!="function")throw new Ge(L);return su(function(){n.apply(w,r)},t)}function ft(n,t){var e=n?n.length:0,u=[];if(!e)return u;var o=-1,i=xr(),f=i===r,a=f&&t.length>=F&&gu&&lu?new Dn(t):null,c=t.length;a&&(i=Mn,f=false,t=a);n:for(;++o<e;)if(a=n[o],f&&a===a){for(var l=c;l--;)if(t[l]===a)continue n;u.push(a)}else 0>i(t,a,0)&&u.push(a);return u}function at(n,t){var r=true;return Su(n,function(n,e,u){return r=!!t(n,e,u)}),r}function ct(n,t,r,e){var u=e,o=u;return Su(n,function(n,i,f){i=+t(n,i,f),(r(i,u)||i===e&&i===o)&&(u=i,
	o=n)}),o}function lt(n,t){var r=[];return Su(n,function(n,e,u){t(n,e,u)&&r.push(n)}),r}function st(n,t,r,e){var u;return r(n,function(n,r,o){return t(n,r,o)?(u=e?r:n,false):void 0}),u}function pt(n,t,r,e){e||(e=[]);for(var u=-1,o=n.length;++u<o;){var i=n[u];h(i)&&Er(i)&&(r||Oo(i)||pe(i))?t?pt(i,t,r,e):Jn(e,i):r||(e[e.length]=i)}return e}function ht(n,t){Nu(n,t,Re)}function _t(n,t){return Nu(n,t,zo)}function vt(n,t){return Tu(n,t,zo)}function gt(n,t){for(var r=-1,e=t.length,u=-1,o=[];++r<e;){var i=t[r];
	ve(n[i])&&(o[++u]=i)}return o}function yt(n,t,r){if(null!=n){r!==w&&r in Br(n)&&(t=[r]),r=0;for(var e=t.length;null!=n&&r<e;)n=n[t[r++]];return r&&r==e?n:w}}function dt(n,t,r,e,u,o){if(n===t)n=true;else if(null==n||null==t||!ge(n)&&!h(t))n=n!==n&&t!==t;else n:{var i=dt,f=Oo(n),a=Oo(t),c=D,l=D;f||(c=ru.call(n),c==B?c=Z:c!=Z&&(f=xe(n))),a||(l=ru.call(t),l==B?l=Z:l!=Z&&xe(t));var s=c==Z,a=l==Z,l=c==l;if(!l||f||s){if(!e&&(c=s&&nu.call(n,"__wrapped__"),a=a&&nu.call(t,"__wrapped__"),c||a)){n=i(c?n.value():n,a?t.value():t,r,e,u,o);
	break n}if(l){for(u||(u=[]),o||(o=[]),c=u.length;c--;)if(u[c]==n){n=o[c]==t;break n}u.push(n),o.push(t),n=(f?yr:mr)(n,t,i,r,e,u,o),u.pop(),o.pop()}else n=false}else n=dr(n,t,c)}return n}function mt(n,t,r){var e=t.length,u=e,o=!r;if(null==n)return!u;for(n=Br(n);e--;){var i=t[e];if(o&&i[2]?i[1]!==n[i[0]]:!(i[0]in n))return false}for(;++e<u;){var i=t[e],f=i[0],a=n[f],c=i[1];if(o&&i[2]){if(a===w&&!(f in n))return false}else if(i=r?r(a,c,f):w,i===w?!dt(c,a,r,true):!i)return false}return true}function wt(n,t){var r=-1,e=Er(n)?Be(n.length):[];
	return Su(n,function(n,u,o){e[++r]=t(n,u,o)}),e}function bt(n){var t=Ar(n);if(1==t.length&&t[0][2]){var r=t[0][0],e=t[0][1];return function(n){return null==n?false:n[r]===e&&(e!==w||r in Br(n))}}return function(n){return mt(n,t)}}function xt(n,t){var r=Oo(n),e=Wr(n)&&t===t&&!ge(t),u=n+"";return n=Dr(n),function(o){if(null==o)return false;var i=u;if(o=Br(o),!(!r&&e||i in o)){if(o=1==n.length?o:yt(o,Et(n,0,-1)),null==o)return false;i=Zr(n),o=Br(o)}return o[i]===t?t!==w||i in o:dt(t,o[i],w,true)}}function At(n,t,r,e,u){
	if(!ge(n))return n;var o=Er(t)&&(Oo(t)||xe(t)),i=o?w:zo(t);return Pn(i||t,function(f,a){if(i&&(a=f,f=t[a]),h(f)){e||(e=[]),u||(u=[]);n:{for(var c=a,l=e,s=u,p=l.length,_=t[c];p--;)if(l[p]==_){n[c]=s[p];break n}var p=n[c],v=r?r(p,_,c,n,t):w,g=v===w;g&&(v=_,Er(_)&&(Oo(_)||xe(_))?v=Oo(p)?p:Er(p)?qn(p):[]:me(_)||pe(_)?v=pe(p)?ke(p):me(p)?p:{}:g=false),l.push(_),s.push(v),g?n[c]=At(v,_,r,l,s):(v===v?v!==p:p===p)&&(n[c]=v)}}else c=n[a],l=r?r(c,f,a,n,t):w,(s=l===w)&&(l=f),l===w&&(!o||a in n)||!s&&(l===l?l===c:c!==c)||(n[a]=l);
	}),n}function jt(n){return function(t){return null==t?w:t[n]}}function kt(n){var t=n+"";return n=Dr(n),function(r){return yt(r,n,t)}}function It(n,t){for(var r=n?t.length:0;r--;){var e=t[r];if(e!=u&&Cr(e)){var u=e;pu.call(n,e,1)}}}function Rt(n,t){return n+yu(ku()*(t-n+1))}function Ot(n,t,r,e,u){return u(n,function(n,u,o){r=e?(e=false,n):t(r,n,u,o)}),r}function Et(n,t,r){var e=-1,u=n.length;for(t=null==t?0:+t||0,0>t&&(t=-t>u?0:u+t),r=r===w||r>u?u:+r||0,0>r&&(r+=u),u=t>r?0:r-t>>>0,t>>>=0,r=Be(u);++e<u;)r[e]=n[e+t];
	return r}function Ct(n,t){var r;return Su(n,function(n,e,u){return r=t(n,e,u),!r}),!!r}function Ut(n,t){var r=n.length;for(n.sort(t);r--;)n[r]=n[r].c;return n}function Wt(t,r,e){var u=wr(),o=-1;return r=Gn(r,function(n){return u(n)}),t=wt(t,function(n){return{a:Gn(r,function(t){return t(n)}),b:++o,c:n}}),Ut(t,function(t,r){var u;n:{for(var o=-1,i=t.a,f=r.a,a=i.length,c=e.length;++o<a;)if(u=n(i[o],f[o])){if(o>=c)break n;o=e[o],u*="asc"===o||true===o?1:-1;break n}u=t.b-r.b}return u})}function $t(n,t){
	var r=0;return Su(n,function(n,e,u){r+=+t(n,e,u)||0}),r}function St(n,t){var e=-1,u=xr(),o=n.length,i=u===r,f=i&&o>=F,a=f&&gu&&lu?new Dn(void 0):null,c=[];a?(u=Mn,i=false):(f=false,a=t?[]:c);n:for(;++e<o;){var l=n[e],s=t?t(l,e,n):l;if(i&&l===l){for(var p=a.length;p--;)if(a[p]===s)continue n;t&&a.push(s),c.push(l)}else 0>u(a,s,0)&&((t||f)&&a.push(s),c.push(l))}return c}function Ft(n,t){for(var r=-1,e=t.length,u=Be(e);++r<e;)u[r]=n[t[r]];return u}function Nt(n,t,r,e){for(var u=n.length,o=e?u:-1;(e?o--:++o<u)&&t(n[o],o,n););
	return r?Et(n,e?0:o,e?o+1:u):Et(n,e?o+1:0,e?u:o)}function Tt(n,t){var r=n;r instanceof zn&&(r=r.value());for(var e=-1,u=t.length;++e<u;)var o=t[e],r=o.func.apply(o.thisArg,Jn([r],o.args));return r}function Lt(n,t,r){var e=0,u=n?n.length:e;if(typeof t=="number"&&t===t&&u<=Eu){for(;e<u;){var o=e+u>>>1,i=n[o];(r?i<=t:i<t)&&null!==i?e=o+1:u=o}return u}return zt(n,t,Fe,r)}function zt(n,t,r,e){t=r(t);for(var u=0,o=n?n.length:0,i=t!==t,f=null===t,a=t===w;u<o;){var c=yu((u+o)/2),l=r(n[c]),s=l!==w,p=l===l;
	(i?p||e:f?p&&s&&(e||null!=l):a?p&&(e||s):null==l?0:e?l<=t:l<t)?u=c+1:o=c}return xu(o,Ou)}function Bt(n,t,r){if(typeof n!="function")return Fe;if(t===w)return n;switch(r){case 1:return function(r){return n.call(t,r)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,o){return n.call(t,r,e,u,o)};case 5:return function(r,e,u,o,i){return n.call(t,r,e,u,o,i)}}return function(){return n.apply(t,arguments)}}function Dt(n){var t=new ou(n.byteLength);return new hu(t).set(new hu(n)),
	t}function Mt(n,t,r){for(var e=r.length,u=-1,o=bu(n.length-e,0),i=-1,f=t.length,a=Be(f+o);++i<f;)a[i]=t[i];for(;++u<e;)a[r[u]]=n[u];for(;o--;)a[i++]=n[u++];return a}function qt(n,t,r){for(var e=-1,u=r.length,o=-1,i=bu(n.length-u,0),f=-1,a=t.length,c=Be(i+a);++o<i;)c[o]=n[o];for(i=o;++f<a;)c[i+f]=t[f];for(;++e<u;)c[i+r[e]]=n[o++];return c}function Pt(n,t){return function(r,e,u){var o=t?t():{};if(e=wr(e,u,3),Oo(r)){u=-1;for(var i=r.length;++u<i;){var f=r[u];n(o,f,e(f,u,r),r)}}else Su(r,function(t,r,u){
	n(o,t,e(t,r,u),u)});return o}}function Kt(n){return le(function(t,r){var e=-1,u=null==t?0:r.length,o=2<u?r[u-2]:w,i=2<u?r[2]:w,f=1<u?r[u-1]:w;for(typeof o=="function"?(o=Bt(o,f,5),u-=2):(o=typeof f=="function"?f:w,u-=o?1:0),i&&Ur(r[0],r[1],i)&&(o=3>u?w:o,u=1);++e<u;)(i=r[e])&&n(t,i,o);return t})}function Vt(n,t){return function(r,e){var u=r?Bu(r):0;if(!Sr(u))return n(r,e);for(var o=t?u:-1,i=Br(r);(t?o--:++o<u)&&false!==e(i[o],o,i););return r}}function Zt(n){return function(t,r,e){var u=Br(t);e=e(t);for(var o=e.length,i=n?o:-1;n?i--:++i<o;){
	var f=e[i];if(false===r(u[f],f,u))break}return t}}function Yt(n,t){function r(){return(this&&this!==Zn&&this instanceof r?e:n).apply(t,arguments)}var e=Jt(n);return r}function Gt(n){return function(t){var r=-1;t=$e(Ce(t));for(var e=t.length,u="";++r<e;)u=n(u,t[r],r);return u}}function Jt(n){return function(){var t=arguments;switch(t.length){case 0:return new n;case 1:return new n(t[0]);case 2:return new n(t[0],t[1]);case 3:return new n(t[0],t[1],t[2]);case 4:return new n(t[0],t[1],t[2],t[3]);case 5:
	return new n(t[0],t[1],t[2],t[3],t[4]);case 6:return new n(t[0],t[1],t[2],t[3],t[4],t[5]);case 7:return new n(t[0],t[1],t[2],t[3],t[4],t[5],t[6])}var r=$u(n.prototype),t=n.apply(r,t);return ge(t)?t:r}}function Xt(n){function t(r,e,u){return u&&Ur(r,e,u)&&(e=w),r=gr(r,n,w,w,w,w,w,e),r.placeholder=t.placeholder,r}return t}function Ht(n,t){return le(function(r){var e=r[0];return null==e?e:(r.push(t),n.apply(w,r))})}function Qt(n,t){return function(r,e,u){if(u&&Ur(r,e,u)&&(e=w),e=wr(e,u,3),1==e.length){
	u=r=Oo(r)?r:zr(r);for(var o=e,i=-1,f=u.length,a=t,c=a;++i<f;){var l=u[i],s=+o(l);n(s,a)&&(a=s,c=l)}if(u=c,!r.length||u!==t)return u}return ct(r,e,n,t)}}function nr(n,r){return function(e,u,o){return u=wr(u,o,3),Oo(e)?(u=t(e,u,r),-1<u?e[u]:w):st(e,u,n)}}function tr(n){return function(r,e,u){return r&&r.length?(e=wr(e,u,3),t(r,e,n)):-1}}function rr(n){return function(t,r,e){return r=wr(r,e,3),st(t,r,n,true)}}function er(n){return function(){for(var t,r=arguments.length,e=n?r:-1,u=0,o=Be(r);n?e--:++e<r;){
	var i=o[u++]=arguments[e];if(typeof i!="function")throw new Ge(L);!t&&Ln.prototype.thru&&"wrapper"==br(i)&&(t=new Ln([],true))}for(e=t?-1:r;++e<r;){var i=o[e],u=br(i),f="wrapper"==u?zu(i):w;t=f&&$r(f[0])&&f[1]==(E|k|R|C)&&!f[4].length&&1==f[9]?t[br(f[0])].apply(t,f[3]):1==i.length&&$r(i)?t[u]():t.thru(i)}return function(){var n=arguments,e=n[0];if(t&&1==n.length&&Oo(e)&&e.length>=F)return t.plant(e).value();for(var u=0,n=r?o[u].apply(this,n):e;++u<r;)n=o[u].call(this,n);return n}}}function ur(n,t){
	return function(r,e,u){return typeof e=="function"&&u===w&&Oo(r)?n(r,e):t(r,Bt(e,u,3))}}function or(n){return function(t,r,e){return(typeof r!="function"||e!==w)&&(r=Bt(r,e,3)),n(t,r,Re)}}function ir(n){return function(t,r,e){return(typeof r!="function"||e!==w)&&(r=Bt(r,e,3)),n(t,r)}}function fr(n){return function(t,r,e){var u={};return r=wr(r,e,3),_t(t,function(t,e,o){o=r(t,e,o),e=n?o:e,t=n?t:o,u[e]=t}),u}}function ar(n){return function(t,r,e){return t=u(t),(n?t:"")+pr(t,r,e)+(n?"":t)}}function cr(n){
	var t=le(function(r,e){var u=v(e,t.placeholder);return gr(r,n,w,e,u)});return t}function lr(n,t){return function(r,e,u,o){var i=3>arguments.length;return typeof e=="function"&&o===w&&Oo(r)?n(r,e,u,i):Ot(r,wr(e,o,4),u,i,t)}}function sr(n,t,r,e,u,o,i,f,a,c){function l(){for(var m=arguments.length,b=m,j=Be(m);b--;)j[b]=arguments[b];if(e&&(j=Mt(j,e,u)),o&&(j=qt(j,o,i)),_||y){var b=l.placeholder,k=v(j,b),m=m-k.length;if(m<c){var I=f?qn(f):w,m=bu(c-m,0),E=_?k:w,k=_?w:k,C=_?j:w,j=_?w:j;return t|=_?R:O,t&=~(_?O:R),
	g||(t&=~(x|A)),j=[n,t,r,C,E,j,k,I,a,m],I=sr.apply(w,j),$r(n)&&Du(I,j),I.placeholder=b,I}}if(b=p?r:this,I=h?b[n]:n,f)for(m=j.length,E=xu(f.length,m),k=qn(j);E--;)C=f[E],j[E]=Cr(C,m)?k[C]:w;return s&&a<j.length&&(j.length=a),this&&this!==Zn&&this instanceof l&&(I=d||Jt(n)),I.apply(b,j)}var s=t&E,p=t&x,h=t&A,_=t&k,g=t&j,y=t&I,d=h?w:Jt(n);return l}function pr(n,t,r){return n=n.length,t=+t,n<t&&mu(t)?(t-=n,r=null==r?" ":r+"",Ue(r,vu(t/r.length)).slice(0,t)):""}function hr(n,t,r,e){function u(){for(var t=-1,f=arguments.length,a=-1,c=e.length,l=Be(c+f);++a<c;)l[a]=e[a];
	for(;f--;)l[a++]=arguments[++t];return(this&&this!==Zn&&this instanceof u?i:n).apply(o?r:this,l)}var o=t&x,i=Jt(n);return u}function _r(n){var t=Pe[n];return function(n,r){return(r=r===w?0:+r||0)?(r=au(10,r),t(n*r)/r):t(n)}}function vr(n){return function(t,r,e,u){var o=wr(e);return null==e&&o===ut?Lt(t,r,n):zt(t,r,o(e,u,1),n)}}function gr(n,t,r,e,u,o,i,f){var a=t&A;if(!a&&typeof n!="function")throw new Ge(L);var c=e?e.length:0;if(c||(t&=~(R|O),e=u=w),c-=u?u.length:0,t&O){var l=e,s=u;e=u=w}var p=a?w:zu(n);
	return r=[n,t,r,e,u,l,s,o,i,f],p&&(e=r[1],t=p[1],f=e|t,u=t==E&&e==k||t==E&&e==C&&r[7].length<=p[8]||t==(E|C)&&e==k,(f<E||u)&&(t&x&&(r[2]=p[2],f|=e&x?0:j),(e=p[3])&&(u=r[3],r[3]=u?Mt(u,e,p[4]):qn(e),r[4]=u?v(r[3],z):qn(p[4])),(e=p[5])&&(u=r[5],r[5]=u?qt(u,e,p[6]):qn(e),r[6]=u?v(r[5],z):qn(p[6])),(e=p[7])&&(r[7]=qn(e)),t&E&&(r[8]=null==r[8]?p[8]:xu(r[8],p[8])),null==r[9]&&(r[9]=p[9]),r[0]=p[0],r[1]=f),t=r[1],f=r[9]),r[9]=null==f?a?0:n.length:bu(f-c,0)||0,(p?Lu:Du)(t==x?Yt(r[0],r[2]):t!=R&&t!=(x|R)||r[4].length?sr.apply(w,r):hr.apply(w,r),r);
	}function yr(n,t,r,e,u,o,i){var f=-1,a=n.length,c=t.length;if(a!=c&&(!u||c<=a))return false;for(;++f<a;){var l=n[f],c=t[f],s=e?e(u?c:l,u?l:c,f):w;if(s!==w){if(s)continue;return false}if(u){if(!Hn(t,function(n){return l===n||r(l,n,e,u,o,i)}))return false}else if(l!==c&&!r(l,c,e,u,o,i))return false}return true}function dr(n,t,r){switch(r){case M:case q:return+n==+t;case P:return n.name==t.name&&n.message==t.message;case V:return n!=+n?t!=+t:n==+t;case Y:case G:return n==t+""}return false}function mr(n,t,r,e,u,o,i){var f=zo(n),a=f.length,c=zo(t).length;
	if(a!=c&&!u)return false;for(c=a;c--;){var l=f[c];if(!(u?l in t:nu.call(t,l)))return false}for(var s=u;++c<a;){var l=f[c],p=n[l],h=t[l],_=e?e(u?h:p,u?p:h,l):w;if(_===w?!r(p,h,e,u,o,i):!_)return false;s||(s="constructor"==l)}return s||(r=n.constructor,e=t.constructor,!(r!=e&&"constructor"in n&&"constructor"in t)||typeof r=="function"&&r instanceof r&&typeof e=="function"&&e instanceof e)?true:false}function wr(n,t,r){var e=Nn.callback||Se,e=e===Se?ut:e;return r?e(n,t,r):e}function br(n){for(var t=n.name+"",r=Wu[t],e=r?r.length:0;e--;){
	var u=r[e],o=u.func;if(null==o||o==n)return u.name}return t}function xr(n,t,e){var u=Nn.indexOf||Vr,u=u===Vr?r:u;return n?u(n,t,e):u}function Ar(n){n=Oe(n);for(var t=n.length;t--;){var r=n[t][1];n[t][2]=r===r&&!ge(r)}return n}function jr(n,t){var r=null==n?w:n[t];return ye(r)?r:w}function kr(n){var t=n.length,r=new n.constructor(t);return t&&"string"==typeof n[0]&&nu.call(n,"index")&&(r.index=n.index,r.input=n.input),r}function Ir(n){return n=n.constructor,typeof n=="function"&&n instanceof n||(n=Ve),
	new n}function Rr(n,t,r){var e=n.constructor;switch(t){case J:return Dt(n);case M:case q:return new e(+n);case X:case H:case Q:case nn:case tn:case rn:case en:case un:case on:return t=n.buffer,new e(r?Dt(t):t,n.byteOffset,n.length);case V:case G:return new e(n);case Y:var u=new e(n.source,kn.exec(n));u.lastIndex=n.lastIndex}return u}function Or(n,t,r){return null==n||Wr(t,n)||(t=Dr(t),n=1==t.length?n:yt(n,Et(t,0,-1)),t=Zr(t)),t=null==n?n:n[t],null==t?w:t.apply(n,r)}function Er(n){return null!=n&&Sr(Bu(n));
	}function Cr(n,t){return n=typeof n=="number"||On.test(n)?+n:-1,t=null==t?Cu:t,-1<n&&0==n%1&&n<t}function Ur(n,t,r){if(!ge(r))return false;var e=typeof t;return("number"==e?Er(r)&&Cr(t,r.length):"string"==e&&t in r)?(t=r[t],n===n?n===t:t!==t):false}function Wr(n,t){var r=typeof n;return"string"==r&&dn.test(n)||"number"==r?true:Oo(n)?false:!yn.test(n)||null!=t&&n in Br(t)}function $r(n){var t=br(n),r=Nn[t];return typeof r=="function"&&t in zn.prototype?n===r?true:(t=zu(r),!!t&&n===t[0]):false}function Sr(n){return typeof n=="number"&&-1<n&&0==n%1&&n<=Cu;
	}function Fr(n,t){return n===w?t:Eo(n,t,Fr)}function Nr(n,t){n=Br(n);for(var r=-1,e=t.length,u={};++r<e;){var o=t[r];o in n&&(u[o]=n[o])}return u}function Tr(n,t){var r={};return ht(n,function(n,e,u){t(n,e,u)&&(r[e]=n)}),r}function Lr(n){for(var t=Re(n),r=t.length,e=r&&n.length,u=!!e&&Sr(e)&&(Oo(n)||pe(n)),o=-1,i=[];++o<r;){var f=t[o];(u&&Cr(f,e)||nu.call(n,f))&&i.push(f)}return i}function zr(n){return null==n?[]:Er(n)?ge(n)?n:Ve(n):Ee(n)}function Br(n){return ge(n)?n:Ve(n)}function Dr(n){if(Oo(n))return n;
	var t=[];return u(n).replace(mn,function(n,r,e,u){t.push(e?u.replace(An,"$1"):r||n)}),t}function Mr(n){return n instanceof zn?n.clone():new Ln(n.__wrapped__,n.__chain__,qn(n.__actions__))}function qr(n,t,r){return n&&n.length?((r?Ur(n,t,r):null==t)&&(t=1),Et(n,0>t?0:t)):[]}function Pr(n,t,r){var e=n?n.length:0;return e?((r?Ur(n,t,r):null==t)&&(t=1),t=e-(+t||0),Et(n,0,0>t?0:t)):[]}function Kr(n){return n?n[0]:w}function Vr(n,t,e){var u=n?n.length:0;if(!u)return-1;if(typeof e=="number")e=0>e?bu(u+e,0):e;else if(e)return e=Lt(n,t),
	e<u&&(t===t?t===n[e]:n[e]!==n[e])?e:-1;return r(n,t,e||0)}function Zr(n){var t=n?n.length:0;return t?n[t-1]:w}function Yr(n){return qr(n,1)}function Gr(n,t,e,u){if(!n||!n.length)return[];null!=t&&typeof t!="boolean"&&(u=e,e=Ur(n,t,u)?w:t,t=false);var o=wr();if((null!=e||o!==ut)&&(e=o(e,u,3)),t&&xr()===r){t=e;var i;e=-1,u=n.length;for(var o=-1,f=[];++e<u;){var a=n[e],c=t?t(a,e,n):a;e&&i===c||(i=c,f[++o]=a)}n=f}else n=St(n,e);return n}function Jr(n){if(!n||!n.length)return[];var t=-1,r=0;n=Vn(n,function(n){
	return Er(n)?(r=bu(n.length,r),true):void 0});for(var e=Be(r);++t<r;)e[t]=Gn(n,jt(t));return e}function Xr(n,t,r){return n&&n.length?(n=Jr(n),null==t?n:(t=Bt(t,r,4),Gn(n,function(n){return Xn(n,t,w,true)}))):[]}function Hr(n,t){var r=-1,e=n?n.length:0,u={};for(!e||t||Oo(n[0])||(t=[]);++r<e;){var o=n[r];t?u[o]=t[r]:o&&(u[o[0]]=o[1])}return u}function Qr(n){return n=Nn(n),n.__chain__=true,n}function ne(n,t,r){return t.call(r,n)}function te(n,t,r){var e=Oo(n)?Kn:at;return r&&Ur(n,t,r)&&(t=w),(typeof t!="function"||r!==w)&&(t=wr(t,r,3)),
	e(n,t)}function re(n,t,r){var e=Oo(n)?Vn:lt;return t=wr(t,r,3),e(n,t)}function ee(n,t,r,e){var u=n?Bu(n):0;return Sr(u)||(n=Ee(n),u=n.length),r=typeof r!="number"||e&&Ur(t,r,e)?0:0>r?bu(u+r,0):r||0,typeof n=="string"||!Oo(n)&&be(n)?r<=u&&-1<n.indexOf(t,r):!!u&&-1<xr(n,t,r)}function ue(n,t,r){var e=Oo(n)?Gn:wt;return t=wr(t,r,3),e(n,t)}function oe(n,t,r){if(r?Ur(n,t,r):null==t){n=zr(n);var e=n.length;return 0<e?n[Rt(0,e-1)]:w}r=-1,n=je(n);var e=n.length,u=e-1;for(t=xu(0>t?0:+t||0,e);++r<t;){var e=Rt(r,u),o=n[e];
	n[e]=n[r],n[r]=o}return n.length=t,n}function ie(n,t,r){var e=Oo(n)?Hn:Ct;return r&&Ur(n,t,r)&&(t=w),(typeof t!="function"||r!==w)&&(t=wr(t,r,3)),e(n,t)}function fe(n,t){var r;if(typeof t!="function"){if(typeof n!="function")throw new Ge(L);var e=n;n=t,t=e}return function(){return 0<--n&&(r=t.apply(this,arguments)),1>=n&&(t=w),r}}function ae(n,t,r){function e(t,r){r&&iu(r),a=p=h=w,t&&(_=ho(),c=n.apply(s,f),p||a||(f=s=w))}function u(){var n=t-(ho()-l);0>=n||n>t?e(h,a):p=su(u,n)}function o(){e(g,p);
	}function i(){if(f=arguments,l=ho(),s=this,h=g&&(p||!y),false===v)var r=y&&!p;else{a||y||(_=l);var e=v-(l-_),i=0>=e||e>v;i?(a&&(a=iu(a)),_=l,c=n.apply(s,f)):a||(a=su(o,e))}return i&&p?p=iu(p):p||t===v||(p=su(u,t)),r&&(i=true,c=n.apply(s,f)),!i||p||a||(f=s=w),c}var f,a,c,l,s,p,h,_=0,v=false,g=true;if(typeof n!="function")throw new Ge(L);if(t=0>t?0:+t||0,true===r)var y=true,g=false;else ge(r)&&(y=!!r.leading,v="maxWait"in r&&bu(+r.maxWait||0,t),g="trailing"in r?!!r.trailing:g);return i.cancel=function(){p&&iu(p),a&&iu(a),
	_=0,a=p=h=w},i}function ce(n,t){function r(){var e=arguments,u=t?t.apply(this,e):e[0],o=r.cache;return o.has(u)?o.get(u):(e=n.apply(this,e),r.cache=o.set(u,e),e)}if(typeof n!="function"||t&&typeof t!="function")throw new Ge(L);return r.cache=new ce.Cache,r}function le(n,t){if(typeof n!="function")throw new Ge(L);return t=bu(t===w?n.length-1:+t||0,0),function(){for(var r=arguments,e=-1,u=bu(r.length-t,0),o=Be(u);++e<u;)o[e]=r[t+e];switch(t){case 0:return n.call(this,o);case 1:return n.call(this,r[0],o);
	case 2:return n.call(this,r[0],r[1],o)}for(u=Be(t+1),e=-1;++e<t;)u[e]=r[e];return u[t]=o,n.apply(this,u)}}function se(n,t){return n>t}function pe(n){return h(n)&&Er(n)&&nu.call(n,"callee")&&!cu.call(n,"callee")}function he(n,t,r,e){return e=(r=typeof r=="function"?Bt(r,e,3):w)?r(n,t):w,e===w?dt(n,t,r):!!e}function _e(n){return h(n)&&typeof n.message=="string"&&ru.call(n)==P}function ve(n){return ge(n)&&ru.call(n)==K}function ge(n){var t=typeof n;return!!n&&("object"==t||"function"==t)}function ye(n){
	return null==n?false:ve(n)?uu.test(Qe.call(n)):h(n)&&Rn.test(n)}function de(n){return typeof n=="number"||h(n)&&ru.call(n)==V}function me(n){var t;if(!h(n)||ru.call(n)!=Z||pe(n)||!(nu.call(n,"constructor")||(t=n.constructor,typeof t!="function"||t instanceof t)))return false;var r;return ht(n,function(n,t){r=t}),r===w||nu.call(n,r)}function we(n){return ge(n)&&ru.call(n)==Y}function be(n){return typeof n=="string"||h(n)&&ru.call(n)==G}function xe(n){return h(n)&&Sr(n.length)&&!!Sn[ru.call(n)]}function Ae(n,t){
	return n<t}function je(n){var t=n?Bu(n):0;return Sr(t)?t?qn(n):[]:Ee(n)}function ke(n){return et(n,Re(n))}function Ie(n){return gt(n,Re(n))}function Re(n){if(null==n)return[];ge(n)||(n=Ve(n));for(var t=n.length,t=t&&Sr(t)&&(Oo(n)||pe(n))&&t||0,r=n.constructor,e=-1,r=typeof r=="function"&&r.prototype===n,u=Be(t),o=0<t;++e<t;)u[e]=e+"";for(var i in n)o&&Cr(i,t)||"constructor"==i&&(r||!nu.call(n,i))||u.push(i);return u}function Oe(n){n=Br(n);for(var t=-1,r=zo(n),e=r.length,u=Be(e);++t<e;){var o=r[t];
	u[t]=[o,n[o]]}return u}function Ee(n){return Ft(n,zo(n))}function Ce(n){return(n=u(n))&&n.replace(En,a).replace(xn,"")}function Ue(n,t){var r="";if(n=u(n),t=+t,1>t||!n||!mu(t))return r;do t%2&&(r+=n),t=yu(t/2),n+=n;while(t);return r}function We(n,t,r){var e=n;return(n=u(n))?(r?Ur(e,t,r):null==t)?n.slice(g(n),y(n)+1):(t+="",n.slice(o(n,t),i(n,t)+1)):n}function $e(n,t,r){return r&&Ur(n,t,r)&&(t=w),n=u(n),n.match(t||Wn)||[]}function Se(n,t,r){return r&&Ur(n,t,r)&&(t=w),h(n)?Ne(n):ut(n,t)}function Fe(n){
	return n}function Ne(n){return bt(ot(n,true))}function Te(n,t,r){if(null==r){var e=ge(t),u=e?zo(t):w;((u=u&&u.length?gt(t,u):w)?u.length:e)||(u=false,r=t,t=n,n=this)}u||(u=gt(t,zo(t)));var o=true,e=-1,i=ve(n),f=u.length;false===r?o=false:ge(r)&&"chain"in r&&(o=r.chain);for(;++e<f;){r=u[e];var a=t[r];n[r]=a,i&&(n.prototype[r]=function(t){return function(){var r=this.__chain__;if(o||r){var e=n(this.__wrapped__);return(e.__actions__=qn(this.__actions__)).push({func:t,args:arguments,thisArg:n}),e.__chain__=r,e}return t.apply(n,Jn([this.value()],arguments));
	}}(a))}return n}function Le(){}function ze(n){return Wr(n)?jt(n):kt(n)}_=_?Yn.defaults(Zn.Object(),_,Yn.pick(Zn,$n)):Zn;var Be=_.Array,De=_.Date,Me=_.Error,qe=_.Function,Pe=_.Math,Ke=_.Number,Ve=_.Object,Ze=_.RegExp,Ye=_.String,Ge=_.TypeError,Je=Be.prototype,Xe=Ve.prototype,He=Ye.prototype,Qe=qe.prototype.toString,nu=Xe.hasOwnProperty,tu=0,ru=Xe.toString,eu=Zn._,uu=Ze("^"+Qe.call(nu).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),ou=_.ArrayBuffer,iu=_.clearTimeout,fu=_.parseFloat,au=Pe.pow,cu=Xe.propertyIsEnumerable,lu=jr(_,"Set"),su=_.setTimeout,pu=Je.splice,hu=_.Uint8Array,_u=jr(_,"WeakMap"),vu=Pe.ceil,gu=jr(Ve,"create"),yu=Pe.floor,du=jr(Be,"isArray"),mu=_.isFinite,wu=jr(Ve,"keys"),bu=Pe.max,xu=Pe.min,Au=jr(De,"now"),ju=_.parseInt,ku=Pe.random,Iu=Ke.NEGATIVE_INFINITY,Ru=Ke.POSITIVE_INFINITY,Ou=4294967294,Eu=2147483647,Cu=9007199254740991,Uu=_u&&new _u,Wu={};
	Nn.support={},Nn.templateSettings={escape:_n,evaluate:vn,interpolate:gn,variable:"",imports:{_:Nn}};var $u=function(){function n(){}return function(t){if(ge(t)){n.prototype=t;var r=new n;n.prototype=w}return r||{}}}(),Su=Vt(_t),Fu=Vt(vt,true),Nu=Zt(),Tu=Zt(true),Lu=Uu?function(n,t){return Uu.set(n,t),n}:Fe,zu=Uu?function(n){return Uu.get(n)}:Le,Bu=jt("length"),Du=function(){var n=0,t=0;return function(r,e){var u=ho(),o=S-(u-t);if(t=u,0<o){if(++n>=$)return r}else n=0;return Lu(r,e)}}(),Mu=le(function(n,t){
	return h(n)&&Er(n)?ft(n,pt(t,false,true)):[]}),qu=tr(),Pu=tr(true),Ku=le(function(n){for(var t=n.length,e=t,u=Be(l),o=xr(),i=o===r,f=[];e--;){var a=n[e]=Er(a=n[e])?a:[];u[e]=i&&120<=a.length&&gu&&lu?new Dn(e&&a):null}var i=n[0],c=-1,l=i?i.length:0,s=u[0];n:for(;++c<l;)if(a=i[c],0>(s?Mn(s,a):o(f,a,0))){for(e=t;--e;){var p=u[e];if(0>(p?Mn(p,a):o(n[e],a,0)))continue n}s&&s.push(a),f.push(a)}return f}),Vu=le(function(t,r){r=pt(r);var e=rt(t,r);return It(t,r.sort(n)),e}),Zu=vr(),Yu=vr(true),Gu=le(function(n){return St(pt(n,false,true));
	}),Ju=le(function(n,t){return Er(n)?ft(n,t):[]}),Xu=le(Jr),Hu=le(function(n){var t=n.length,r=2<t?n[t-2]:w,e=1<t?n[t-1]:w;return 2<t&&typeof r=="function"?t-=2:(r=1<t&&typeof e=="function"?(--t,e):w,e=w),n.length=t,Xr(n,r,e)}),Qu=le(function(n){return n=pt(n),this.thru(function(t){t=Oo(t)?t:[Br(t)];for(var r=n,e=-1,u=t.length,o=-1,i=r.length,f=Be(u+i);++e<u;)f[e]=t[e];for(;++o<i;)f[e++]=r[o];return f})}),no=le(function(n,t){return rt(n,pt(t))}),to=Pt(function(n,t,r){nu.call(n,r)?++n[r]:n[r]=1}),ro=nr(Su),eo=nr(Fu,true),uo=ur(Pn,Su),oo=ur(function(n,t){
	for(var r=n.length;r--&&false!==t(n[r],r,n););return n},Fu),io=Pt(function(n,t,r){nu.call(n,r)?n[r].push(t):n[r]=[t]}),fo=Pt(function(n,t,r){n[r]=t}),ao=le(function(n,t,r){var e=-1,u=typeof t=="function",o=Wr(t),i=Er(n)?Be(n.length):[];return Su(n,function(n){var f=u?t:o&&null!=n?n[t]:w;i[++e]=f?f.apply(n,r):Or(n,t,r)}),i}),co=Pt(function(n,t,r){n[r?0:1].push(t)},function(){return[[],[]]}),lo=lr(Xn,Su),so=lr(function(n,t,r,e){var u=n.length;for(e&&u&&(r=n[--u]);u--;)r=t(r,n[u],u,n);return r},Fu),po=le(function(n,t){
	if(null==n)return[];var r=t[2];return r&&Ur(t[0],t[1],r)&&(t.length=1),Wt(n,pt(t),[])}),ho=Au||function(){return(new De).getTime()},_o=le(function(n,t,r){var e=x;if(r.length)var u=v(r,_o.placeholder),e=e|R;return gr(n,e,t,r,u)}),vo=le(function(n,t){t=t.length?pt(t):Ie(n);for(var r=-1,e=t.length;++r<e;){var u=t[r];n[u]=gr(n[u],x,n)}return n}),go=le(function(n,t,r){var e=x|A;if(r.length)var u=v(r,go.placeholder),e=e|R;return gr(t,e,n,r,u)}),yo=Xt(k),mo=Xt(I),wo=le(function(n,t){return it(n,1,t)}),bo=le(function(n,t,r){
	return it(n,t,r)}),xo=er(),Ao=er(true),jo=le(function(n,t){if(t=pt(t),typeof n!="function"||!Kn(t,e))throw new Ge(L);var r=t.length;return le(function(e){for(var u=xu(e.length,r);u--;)e[u]=t[u](e[u]);return n.apply(this,e)})}),ko=cr(R),Io=cr(O),Ro=le(function(n,t){return gr(n,C,w,w,w,pt(t))}),Oo=du||function(n){return h(n)&&Sr(n.length)&&ru.call(n)==D},Eo=Kt(At),Co=Kt(function(n,t,r){return r?nt(n,t,r):tt(n,t)}),Uo=Ht(Co,function(n,t){return n===w?t:n}),Wo=Ht(Eo,Fr),$o=rr(_t),So=rr(vt),Fo=or(Nu),No=or(Tu),To=ir(_t),Lo=ir(vt),zo=wu?function(n){
	var t=null==n?w:n.constructor;return typeof t=="function"&&t.prototype===n||typeof n!="function"&&Er(n)?Lr(n):ge(n)?wu(n):[]}:Lr,Bo=fr(true),Do=fr(),Mo=le(function(n,t){if(null==n)return{};if("function"!=typeof t[0])return t=Gn(pt(t),Ye),Nr(n,ft(Re(n),t));var r=Bt(t[0],t[1],3);return Tr(n,function(n,t,e){return!r(n,t,e)})}),qo=le(function(n,t){return null==n?{}:"function"==typeof t[0]?Tr(n,Bt(t[0],t[1],3)):Nr(n,pt(t))}),Po=Gt(function(n,t,r){return t=t.toLowerCase(),n+(r?t.charAt(0).toUpperCase()+t.slice(1):t);
	}),Ko=Gt(function(n,t,r){return n+(r?"-":"")+t.toLowerCase()}),Vo=ar(),Zo=ar(true),Yo=Gt(function(n,t,r){return n+(r?"_":"")+t.toLowerCase()}),Go=Gt(function(n,t,r){return n+(r?" ":"")+(t.charAt(0).toUpperCase()+t.slice(1))}),Jo=le(function(n,t){try{return n.apply(w,t)}catch(r){return _e(r)?r:new Me(r)}}),Xo=le(function(n,t){return function(r){return Or(r,n,t)}}),Ho=le(function(n,t){return function(r){return Or(n,r,t)}}),Qo=_r("ceil"),ni=_r("floor"),ti=Qt(se,Iu),ri=Qt(Ae,Ru),ei=_r("round");return Nn.prototype=Tn.prototype,
	Ln.prototype=$u(Tn.prototype),Ln.prototype.constructor=Ln,zn.prototype=$u(Tn.prototype),zn.prototype.constructor=zn,Bn.prototype["delete"]=function(n){return this.has(n)&&delete this.__data__[n]},Bn.prototype.get=function(n){return"__proto__"==n?w:this.__data__[n]},Bn.prototype.has=function(n){return"__proto__"!=n&&nu.call(this.__data__,n)},Bn.prototype.set=function(n,t){return"__proto__"!=n&&(this.__data__[n]=t),this},Dn.prototype.push=function(n){var t=this.data;typeof n=="string"||ge(n)?t.set.add(n):t.hash[n]=true;
	},ce.Cache=Bn,Nn.after=function(n,t){if(typeof t!="function"){if(typeof n!="function")throw new Ge(L);var r=n;n=t,t=r}return n=mu(n=+n)?n:0,function(){return 1>--n?t.apply(this,arguments):void 0}},Nn.ary=function(n,t,r){return r&&Ur(n,t,r)&&(t=w),t=n&&null==t?n.length:bu(+t||0,0),gr(n,E,w,w,w,w,t)},Nn.assign=Co,Nn.at=no,Nn.before=fe,Nn.bind=_o,Nn.bindAll=vo,Nn.bindKey=go,Nn.callback=Se,Nn.chain=Qr,Nn.chunk=function(n,t,r){t=(r?Ur(n,t,r):null==t)?1:bu(yu(t)||1,1),r=0;for(var e=n?n.length:0,u=-1,o=Be(vu(e/t));r<e;)o[++u]=Et(n,r,r+=t);
	return o},Nn.compact=function(n){for(var t=-1,r=n?n.length:0,e=-1,u=[];++t<r;){var o=n[t];o&&(u[++e]=o)}return u},Nn.constant=function(n){return function(){return n}},Nn.countBy=to,Nn.create=function(n,t,r){var e=$u(n);return r&&Ur(n,t,r)&&(t=w),t?tt(e,t):e},Nn.curry=yo,Nn.curryRight=mo,Nn.debounce=ae,Nn.defaults=Uo,Nn.defaultsDeep=Wo,Nn.defer=wo,Nn.delay=bo,Nn.difference=Mu,Nn.drop=qr,Nn.dropRight=Pr,Nn.dropRightWhile=function(n,t,r){return n&&n.length?Nt(n,wr(t,r,3),true,true):[]},Nn.dropWhile=function(n,t,r){
	return n&&n.length?Nt(n,wr(t,r,3),true):[]},Nn.fill=function(n,t,r,e){var u=n?n.length:0;if(!u)return[];for(r&&typeof r!="number"&&Ur(n,t,r)&&(r=0,e=u),u=n.length,r=null==r?0:+r||0,0>r&&(r=-r>u?0:u+r),e=e===w||e>u?u:+e||0,0>e&&(e+=u),u=r>e?0:e>>>0,r>>>=0;r<u;)n[r++]=t;return n},Nn.filter=re,Nn.flatten=function(n,t,r){var e=n?n.length:0;return r&&Ur(n,t,r)&&(t=false),e?pt(n,t):[]},Nn.flattenDeep=function(n){return n&&n.length?pt(n,true):[]},Nn.flow=xo,Nn.flowRight=Ao,Nn.forEach=uo,Nn.forEachRight=oo,Nn.forIn=Fo,
	Nn.forInRight=No,Nn.forOwn=To,Nn.forOwnRight=Lo,Nn.functions=Ie,Nn.groupBy=io,Nn.indexBy=fo,Nn.initial=function(n){return Pr(n,1)},Nn.intersection=Ku,Nn.invert=function(n,t,r){r&&Ur(n,t,r)&&(t=w),r=-1;for(var e=zo(n),u=e.length,o={};++r<u;){var i=e[r],f=n[i];t?nu.call(o,f)?o[f].push(i):o[f]=[i]:o[f]=i}return o},Nn.invoke=ao,Nn.keys=zo,Nn.keysIn=Re,Nn.map=ue,Nn.mapKeys=Bo,Nn.mapValues=Do,Nn.matches=Ne,Nn.matchesProperty=function(n,t){return xt(n,ot(t,true))},Nn.memoize=ce,Nn.merge=Eo,Nn.method=Xo,Nn.methodOf=Ho,
	Nn.mixin=Te,Nn.modArgs=jo,Nn.negate=function(n){if(typeof n!="function")throw new Ge(L);return function(){return!n.apply(this,arguments)}},Nn.omit=Mo,Nn.once=function(n){return fe(2,n)},Nn.pairs=Oe,Nn.partial=ko,Nn.partialRight=Io,Nn.partition=co,Nn.pick=qo,Nn.pluck=function(n,t){return ue(n,ze(t))},Nn.property=ze,Nn.propertyOf=function(n){return function(t){return yt(n,Dr(t),t+"")}},Nn.pull=function(){var n=arguments,t=n[0];if(!t||!t.length)return t;for(var r=0,e=xr(),u=n.length;++r<u;)for(var o=0,i=n[r];-1<(o=e(t,i,o));)pu.call(t,o,1);
	return t},Nn.pullAt=Vu,Nn.range=function(n,t,r){r&&Ur(n,t,r)&&(t=r=w),n=+n||0,r=null==r?1:+r||0,null==t?(t=n,n=0):t=+t||0;var e=-1;t=bu(vu((t-n)/(r||1)),0);for(var u=Be(t);++e<t;)u[e]=n,n+=r;return u},Nn.rearg=Ro,Nn.reject=function(n,t,r){var e=Oo(n)?Vn:lt;return t=wr(t,r,3),e(n,function(n,r,e){return!t(n,r,e)})},Nn.remove=function(n,t,r){var e=[];if(!n||!n.length)return e;var u=-1,o=[],i=n.length;for(t=wr(t,r,3);++u<i;)r=n[u],t(r,u,n)&&(e.push(r),o.push(u));return It(n,o),e},Nn.rest=Yr,Nn.restParam=le,
	Nn.set=function(n,t,r){if(null==n)return n;var e=t+"";t=null!=n[e]||Wr(t,n)?[e]:Dr(t);for(var e=-1,u=t.length,o=u-1,i=n;null!=i&&++e<u;){var f=t[e];ge(i)&&(e==o?i[f]=r:null==i[f]&&(i[f]=Cr(t[e+1])?[]:{})),i=i[f]}return n},Nn.shuffle=function(n){return oe(n,Ru)},Nn.slice=function(n,t,r){var e=n?n.length:0;return e?(r&&typeof r!="number"&&Ur(n,t,r)&&(t=0,r=e),Et(n,t,r)):[]},Nn.sortBy=function(n,t,r){if(null==n)return[];r&&Ur(n,t,r)&&(t=w);var e=-1;return t=wr(t,r,3),n=wt(n,function(n,r,u){return{a:t(n,r,u),
	b:++e,c:n}}),Ut(n,f)},Nn.sortByAll=po,Nn.sortByOrder=function(n,t,r,e){return null==n?[]:(e&&Ur(t,r,e)&&(r=w),Oo(t)||(t=null==t?[]:[t]),Oo(r)||(r=null==r?[]:[r]),Wt(n,t,r))},Nn.spread=function(n){if(typeof n!="function")throw new Ge(L);return function(t){return n.apply(this,t)}},Nn.take=function(n,t,r){return n&&n.length?((r?Ur(n,t,r):null==t)&&(t=1),Et(n,0,0>t?0:t)):[]},Nn.takeRight=function(n,t,r){var e=n?n.length:0;return e?((r?Ur(n,t,r):null==t)&&(t=1),t=e-(+t||0),Et(n,0>t?0:t)):[]},Nn.takeRightWhile=function(n,t,r){
	return n&&n.length?Nt(n,wr(t,r,3),false,true):[]},Nn.takeWhile=function(n,t,r){return n&&n.length?Nt(n,wr(t,r,3)):[]},Nn.tap=function(n,t,r){return t.call(r,n),n},Nn.throttle=function(n,t,r){var e=true,u=true;if(typeof n!="function")throw new Ge(L);return false===r?e=false:ge(r)&&(e="leading"in r?!!r.leading:e,u="trailing"in r?!!r.trailing:u),ae(n,t,{leading:e,maxWait:+t,trailing:u})},Nn.thru=ne,Nn.times=function(n,t,r){if(n=yu(n),1>n||!mu(n))return[];var e=-1,u=Be(xu(n,4294967295));for(t=Bt(t,r,1);++e<n;)4294967295>e?u[e]=t(e):t(e);
	return u},Nn.toArray=je,Nn.toPlainObject=ke,Nn.transform=function(n,t,r,e){var u=Oo(n)||xe(n);return t=wr(t,e,4),null==r&&(u||ge(n)?(e=n.constructor,r=u?Oo(n)?new e:[]:$u(ve(e)?e.prototype:w)):r={}),(u?Pn:_t)(n,function(n,e,u){return t(r,n,e,u)}),r},Nn.union=Gu,Nn.uniq=Gr,Nn.unzip=Jr,Nn.unzipWith=Xr,Nn.values=Ee,Nn.valuesIn=function(n){return Ft(n,Re(n))},Nn.where=function(n,t){return re(n,bt(t))},Nn.without=Ju,Nn.wrap=function(n,t){return t=null==t?Fe:t,gr(t,R,w,[n],[])},Nn.xor=function(){for(var n=-1,t=arguments.length;++n<t;){
	var r=arguments[n];if(Er(r))var e=e?Jn(ft(e,r),ft(r,e)):r}return e?St(e):[]},Nn.zip=Xu,Nn.zipObject=Hr,Nn.zipWith=Hu,Nn.backflow=Ao,Nn.collect=ue,Nn.compose=Ao,Nn.each=uo,Nn.eachRight=oo,Nn.extend=Co,Nn.iteratee=Se,Nn.methods=Ie,Nn.object=Hr,Nn.select=re,Nn.tail=Yr,Nn.unique=Gr,Te(Nn,Nn),Nn.add=function(n,t){return(+n||0)+(+t||0)},Nn.attempt=Jo,Nn.camelCase=Po,Nn.capitalize=function(n){return(n=u(n))&&n.charAt(0).toUpperCase()+n.slice(1)},Nn.ceil=Qo,Nn.clone=function(n,t,r,e){return t&&typeof t!="boolean"&&Ur(n,t,r)?t=false:typeof t=="function"&&(e=r,
	r=t,t=false),typeof r=="function"?ot(n,t,Bt(r,e,3)):ot(n,t)},Nn.cloneDeep=function(n,t,r){return typeof t=="function"?ot(n,true,Bt(t,r,3)):ot(n,true)},Nn.deburr=Ce,Nn.endsWith=function(n,t,r){n=u(n),t+="";var e=n.length;return r=r===w?e:xu(0>r?0:+r||0,e),r-=t.length,0<=r&&n.indexOf(t,r)==r},Nn.escape=function(n){return(n=u(n))&&hn.test(n)?n.replace(sn,c):n},Nn.escapeRegExp=function(n){return(n=u(n))&&bn.test(n)?n.replace(wn,l):n||"(?:)"},Nn.every=te,Nn.find=ro,Nn.findIndex=qu,Nn.findKey=$o,Nn.findLast=eo,
	Nn.findLastIndex=Pu,Nn.findLastKey=So,Nn.findWhere=function(n,t){return ro(n,bt(t))},Nn.first=Kr,Nn.floor=ni,Nn.get=function(n,t,r){return n=null==n?w:yt(n,Dr(t),t+""),n===w?r:n},Nn.gt=se,Nn.gte=function(n,t){return n>=t},Nn.has=function(n,t){if(null==n)return false;var r=nu.call(n,t);if(!r&&!Wr(t)){if(t=Dr(t),n=1==t.length?n:yt(n,Et(t,0,-1)),null==n)return false;t=Zr(t),r=nu.call(n,t)}return r||Sr(n.length)&&Cr(t,n.length)&&(Oo(n)||pe(n))},Nn.identity=Fe,Nn.includes=ee,Nn.indexOf=Vr,Nn.inRange=function(n,t,r){
	return t=+t||0,r===w?(r=t,t=0):r=+r||0,n>=xu(t,r)&&n<bu(t,r)},Nn.isArguments=pe,Nn.isArray=Oo,Nn.isBoolean=function(n){return true===n||false===n||h(n)&&ru.call(n)==M},Nn.isDate=function(n){return h(n)&&ru.call(n)==q},Nn.isElement=function(n){return!!n&&1===n.nodeType&&h(n)&&!me(n)},Nn.isEmpty=function(n){return null==n?true:Er(n)&&(Oo(n)||be(n)||pe(n)||h(n)&&ve(n.splice))?!n.length:!zo(n).length},Nn.isEqual=he,Nn.isError=_e,Nn.isFinite=function(n){return typeof n=="number"&&mu(n)},Nn.isFunction=ve,Nn.isMatch=function(n,t,r,e){
	return r=typeof r=="function"?Bt(r,e,3):w,mt(n,Ar(t),r)},Nn.isNaN=function(n){return de(n)&&n!=+n},Nn.isNative=ye,Nn.isNull=function(n){return null===n},Nn.isNumber=de,Nn.isObject=ge,Nn.isPlainObject=me,Nn.isRegExp=we,Nn.isString=be,Nn.isTypedArray=xe,Nn.isUndefined=function(n){return n===w},Nn.kebabCase=Ko,Nn.last=Zr,Nn.lastIndexOf=function(n,t,r){var e=n?n.length:0;if(!e)return-1;var u=e;if(typeof r=="number")u=(0>r?bu(e+r,0):xu(r||0,e-1))+1;else if(r)return u=Lt(n,t,true)-1,n=n[u],(t===t?t===n:n!==n)?u:-1;
	if(t!==t)return p(n,u,true);for(;u--;)if(n[u]===t)return u;return-1},Nn.lt=Ae,Nn.lte=function(n,t){return n<=t},Nn.max=ti,Nn.min=ri,Nn.noConflict=function(){return Zn._=eu,this},Nn.noop=Le,Nn.now=ho,Nn.pad=function(n,t,r){n=u(n),t=+t;var e=n.length;return e<t&&mu(t)?(e=(t-e)/2,t=yu(e),e=vu(e),r=pr("",e,r),r.slice(0,t)+n+r):n},Nn.padLeft=Vo,Nn.padRight=Zo,Nn.parseInt=function(n,t,r){return(r?Ur(n,t,r):null==t)?t=0:t&&(t=+t),n=We(n),ju(n,t||(In.test(n)?16:10))},Nn.random=function(n,t,r){r&&Ur(n,t,r)&&(t=r=w);
	var e=null==n,u=null==t;return null==r&&(u&&typeof n=="boolean"?(r=n,n=1):typeof t=="boolean"&&(r=t,u=true)),e&&u&&(t=1,u=false),n=+n||0,u?(t=n,n=0):t=+t||0,r||n%1||t%1?(r=ku(),xu(n+r*(t-n+fu("1e-"+((r+"").length-1))),t)):Rt(n,t)},Nn.reduce=lo,Nn.reduceRight=so,Nn.repeat=Ue,Nn.result=function(n,t,r){var e=null==n?w:n[t];return e===w&&(null==n||Wr(t,n)||(t=Dr(t),n=1==t.length?n:yt(n,Et(t,0,-1)),e=null==n?w:n[Zr(t)]),e=e===w?r:e),ve(e)?e.call(n):e},Nn.round=ei,Nn.runInContext=m,Nn.size=function(n){var t=n?Bu(n):0;
	return Sr(t)?t:zo(n).length},Nn.snakeCase=Yo,Nn.some=ie,Nn.sortedIndex=Zu,Nn.sortedLastIndex=Yu,Nn.startCase=Go,Nn.startsWith=function(n,t,r){return n=u(n),r=null==r?0:xu(0>r?0:+r||0,n.length),n.lastIndexOf(t,r)==r},Nn.sum=function(n,t,r){if(r&&Ur(n,t,r)&&(t=w),t=wr(t,r,3),1==t.length){n=Oo(n)?n:zr(n),r=n.length;for(var e=0;r--;)e+=+t(n[r])||0;n=e}else n=$t(n,t);return n},Nn.template=function(n,t,r){var e=Nn.templateSettings;r&&Ur(n,t,r)&&(t=r=w),n=u(n),t=nt(tt({},r||t),e,Qn),r=nt(tt({},t.imports),e.imports,Qn);
	var o,i,f=zo(r),a=Ft(r,f),c=0;r=t.interpolate||Cn;var l="__p+='";r=Ze((t.escape||Cn).source+"|"+r.source+"|"+(r===gn?jn:Cn).source+"|"+(t.evaluate||Cn).source+"|$","g");var p="sourceURL"in t?"//# sourceURL="+t.sourceURL+"\n":"";if(n.replace(r,function(t,r,e,u,f,a){return e||(e=u),l+=n.slice(c,a).replace(Un,s),r&&(o=true,l+="'+__e("+r+")+'"),f&&(i=true,l+="';"+f+";\n__p+='"),e&&(l+="'+((__t=("+e+"))==null?'':__t)+'"),c=a+t.length,t}),l+="';",(t=t.variable)||(l="with(obj){"+l+"}"),l=(i?l.replace(fn,""):l).replace(an,"$1").replace(cn,"$1;"),
	l="function("+(t||"obj")+"){"+(t?"":"obj||(obj={});")+"var __t,__p=''"+(o?",__e=_.escape":"")+(i?",__j=Array.prototype.join;function print(){__p+=__j.call(arguments,'')}":";")+l+"return __p}",t=Jo(function(){return qe(f,p+"return "+l).apply(w,a)}),t.source=l,_e(t))throw t;return t},Nn.trim=We,Nn.trimLeft=function(n,t,r){var e=n;return(n=u(n))?n.slice((r?Ur(e,t,r):null==t)?g(n):o(n,t+"")):n},Nn.trimRight=function(n,t,r){var e=n;return(n=u(n))?(r?Ur(e,t,r):null==t)?n.slice(0,y(n)+1):n.slice(0,i(n,t+"")+1):n;
	},Nn.trunc=function(n,t,r){r&&Ur(n,t,r)&&(t=w);var e=U;if(r=W,null!=t)if(ge(t)){var o="separator"in t?t.separator:o,e="length"in t?+t.length||0:e;r="omission"in t?u(t.omission):r}else e=+t||0;if(n=u(n),e>=n.length)return n;if(e-=r.length,1>e)return r;if(t=n.slice(0,e),null==o)return t+r;if(we(o)){if(n.slice(e).search(o)){var i,f=n.slice(0,e);for(o.global||(o=Ze(o.source,(kn.exec(o)||"")+"g")),o.lastIndex=0;n=o.exec(f);)i=n.index;t=t.slice(0,null==i?e:i)}}else n.indexOf(o,e)!=e&&(o=t.lastIndexOf(o),
	-1<o&&(t=t.slice(0,o)));return t+r},Nn.unescape=function(n){return(n=u(n))&&pn.test(n)?n.replace(ln,d):n},Nn.uniqueId=function(n){var t=++tu;return u(n)+t},Nn.words=$e,Nn.all=te,Nn.any=ie,Nn.contains=ee,Nn.eq=he,Nn.detect=ro,Nn.foldl=lo,Nn.foldr=so,Nn.head=Kr,Nn.include=ee,Nn.inject=lo,Te(Nn,function(){var n={};return _t(Nn,function(t,r){Nn.prototype[r]||(n[r]=t)}),n}(),false),Nn.sample=oe,Nn.prototype.sample=function(n){return this.__chain__||null!=n?this.thru(function(t){return oe(t,n)}):oe(this.value());
	},Nn.VERSION=b,Pn("bind bindKey curry curryRight partial partialRight".split(" "),function(n){Nn[n].placeholder=Nn}),Pn(["drop","take"],function(n,t){zn.prototype[n]=function(r){var e=this.__filtered__;if(e&&!t)return new zn(this);r=null==r?1:bu(yu(r)||0,0);var u=this.clone();return e?u.__takeCount__=xu(u.__takeCount__,r):u.__views__.push({size:r,type:n+(0>u.__dir__?"Right":"")}),u},zn.prototype[n+"Right"]=function(t){return this.reverse()[n](t).reverse()}}),Pn(["filter","map","takeWhile"],function(n,t){
	var r=t+1,e=r!=T;zn.prototype[n]=function(n,t){var u=this.clone();return u.__iteratees__.push({iteratee:wr(n,t,1),type:r}),u.__filtered__=u.__filtered__||e,u}}),Pn(["first","last"],function(n,t){var r="take"+(t?"Right":"");zn.prototype[n]=function(){return this[r](1).value()[0]}}),Pn(["initial","rest"],function(n,t){var r="drop"+(t?"":"Right");zn.prototype[n]=function(){return this.__filtered__?new zn(this):this[r](1)}}),Pn(["pluck","where"],function(n,t){var r=t?"filter":"map",e=t?bt:ze;zn.prototype[n]=function(n){
	return this[r](e(n))}}),zn.prototype.compact=function(){return this.filter(Fe)},zn.prototype.reject=function(n,t){return n=wr(n,t,1),this.filter(function(t){return!n(t)})},zn.prototype.slice=function(n,t){n=null==n?0:+n||0;var r=this;return r.__filtered__&&(0<n||0>t)?new zn(r):(0>n?r=r.takeRight(-n):n&&(r=r.drop(n)),t!==w&&(t=+t||0,r=0>t?r.dropRight(-t):r.take(t-n)),r)},zn.prototype.takeRightWhile=function(n,t){return this.reverse().takeWhile(n,t).reverse()},zn.prototype.toArray=function(){return this.take(Ru);
	},_t(zn.prototype,function(n,t){var r=/^(?:filter|map|reject)|While$/.test(t),e=/^(?:first|last)$/.test(t),u=Nn[e?"take"+("last"==t?"Right":""):t];u&&(Nn.prototype[t]=function(){function t(n){return e&&i?u(n,1)[0]:u.apply(w,Jn([n],o))}var o=e?[1]:arguments,i=this.__chain__,f=this.__wrapped__,a=!!this.__actions__.length,c=f instanceof zn,l=o[0],s=c||Oo(f);return s&&r&&typeof l=="function"&&1!=l.length&&(c=s=false),l={func:ne,args:[t],thisArg:w},a=c&&!a,e&&!i?a?(f=f.clone(),f.__actions__.push(l),n.call(f)):u.call(w,this.value())[0]:!e&&s?(f=a?f:new zn(this),
	f=n.apply(f,o),f.__actions__.push(l),new Ln(f,i)):this.thru(t)})}),Pn("join pop push replace shift sort splice split unshift".split(" "),function(n){var t=(/^(?:replace|split)$/.test(n)?He:Je)[n],r=/^(?:push|sort|unshift)$/.test(n)?"tap":"thru",e=/^(?:join|pop|replace|shift)$/.test(n);Nn.prototype[n]=function(){var n=arguments;return e&&!this.__chain__?t.apply(this.value(),n):this[r](function(r){return t.apply(r,n)})}}),_t(zn.prototype,function(n,t){var r=Nn[t];if(r){var e=r.name+"";(Wu[e]||(Wu[e]=[])).push({
	name:t,func:r})}}),Wu[sr(w,A).name]=[{name:"wrapper",func:w}],zn.prototype.clone=function(){var n=new zn(this.__wrapped__);return n.__actions__=qn(this.__actions__),n.__dir__=this.__dir__,n.__filtered__=this.__filtered__,n.__iteratees__=qn(this.__iteratees__),n.__takeCount__=this.__takeCount__,n.__views__=qn(this.__views__),n},zn.prototype.reverse=function(){if(this.__filtered__){var n=new zn(this);n.__dir__=-1,n.__filtered__=true}else n=this.clone(),n.__dir__*=-1;return n},zn.prototype.value=function(){
	var n,t=this.__wrapped__.value(),r=this.__dir__,e=Oo(t),u=0>r,o=e?t.length:0;n=o;for(var i=this.__views__,f=0,a=-1,c=i.length;++a<c;){var l=i[a],s=l.size;switch(l.type){case"drop":f+=s;break;case"dropRight":n-=s;break;case"take":n=xu(n,f+s);break;case"takeRight":f=bu(f,n-s)}}if(n={start:f,end:n},i=n.start,f=n.end,n=f-i,u=u?f:i-1,i=this.__iteratees__,f=i.length,a=0,c=xu(n,this.__takeCount__),!e||o<F||o==n&&c==n)return Tt(t,this.__actions__);e=[];n:for(;n--&&a<c;){for(u+=r,o=-1,l=t[u];++o<f;){var p=i[o],s=p.type,p=p.iteratee(l);
	if(s==T)l=p;else if(!p){if(s==N)continue n;break n}}e[a++]=l}return e},Nn.prototype.chain=function(){return Qr(this)},Nn.prototype.commit=function(){return new Ln(this.value(),this.__chain__)},Nn.prototype.concat=Qu,Nn.prototype.plant=function(n){for(var t,r=this;r instanceof Tn;){var e=Mr(r);t?u.__wrapped__=e:t=e;var u=e,r=r.__wrapped__}return u.__wrapped__=n,t},Nn.prototype.reverse=function(){function n(n){return n.reverse()}var t=this.__wrapped__;return t instanceof zn?(this.__actions__.length&&(t=new zn(this)),
	t=t.reverse(),t.__actions__.push({func:ne,args:[n],thisArg:w}),new Ln(t,this.__chain__)):this.thru(n)},Nn.prototype.toString=function(){return this.value()+""},Nn.prototype.run=Nn.prototype.toJSON=Nn.prototype.valueOf=Nn.prototype.value=function(){return Tt(this.__wrapped__,this.__actions__)},Nn.prototype.collect=Nn.prototype.map,Nn.prototype.head=Nn.prototype.first,Nn.prototype.select=Nn.prototype.filter,Nn.prototype.tail=Nn.prototype.rest,Nn}var w,b="3.10.1",x=1,A=2,j=4,k=8,I=16,R=32,O=64,E=128,C=256,U=30,W="...",$=150,S=16,F=200,N=1,T=2,L="Expected a function",z="__lodash_placeholder__",B="[object Arguments]",D="[object Array]",M="[object Boolean]",q="[object Date]",P="[object Error]",K="[object Function]",V="[object Number]",Z="[object Object]",Y="[object RegExp]",G="[object String]",J="[object ArrayBuffer]",X="[object Float32Array]",H="[object Float64Array]",Q="[object Int8Array]",nn="[object Int16Array]",tn="[object Int32Array]",rn="[object Uint8Array]",en="[object Uint8ClampedArray]",un="[object Uint16Array]",on="[object Uint32Array]",fn=/\b__p\+='';/g,an=/\b(__p\+=)''\+/g,cn=/(__e\(.*?\)|\b__t\))\+'';/g,ln=/&(?:amp|lt|gt|quot|#39|#96);/g,sn=/[&<>"'`]/g,pn=RegExp(ln.source),hn=RegExp(sn.source),_n=/<%-([\s\S]+?)%>/g,vn=/<%([\s\S]+?)%>/g,gn=/<%=([\s\S]+?)%>/g,yn=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,dn=/^\w*$/,mn=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,wn=/^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,bn=RegExp(wn.source),xn=/[\u0300-\u036f\ufe20-\ufe23]/g,An=/\\(\\)?/g,jn=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,kn=/\w*$/,In=/^0[xX]/,Rn=/^\[object .+?Constructor\]$/,On=/^\d+$/,En=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,Cn=/($^)/,Un=/['\n\r\u2028\u2029\\]/g,Wn=RegExp("[A-Z\\xc0-\\xd6\\xd8-\\xde]+(?=[A-Z\\xc0-\\xd6\\xd8-\\xde][a-z\\xdf-\\xf6\\xf8-\\xff]+)|[A-Z\\xc0-\\xd6\\xd8-\\xde]?[a-z\\xdf-\\xf6\\xf8-\\xff]+|[A-Z\\xc0-\\xd6\\xd8-\\xde]+|[0-9]+","g"),$n="Array ArrayBuffer Date Error Float32Array Float64Array Function Int8Array Int16Array Int32Array Math Number Object RegExp Set String _ clearTimeout isFinite parseFloat parseInt setTimeout TypeError Uint8Array Uint8ClampedArray Uint16Array Uint32Array WeakMap".split(" "),Sn={};
	Sn[X]=Sn[H]=Sn[Q]=Sn[nn]=Sn[tn]=Sn[rn]=Sn[en]=Sn[un]=Sn[on]=true,Sn[B]=Sn[D]=Sn[J]=Sn[M]=Sn[q]=Sn[P]=Sn[K]=Sn["[object Map]"]=Sn[V]=Sn[Z]=Sn[Y]=Sn["[object Set]"]=Sn[G]=Sn["[object WeakMap]"]=false;var Fn={};Fn[B]=Fn[D]=Fn[J]=Fn[M]=Fn[q]=Fn[X]=Fn[H]=Fn[Q]=Fn[nn]=Fn[tn]=Fn[V]=Fn[Z]=Fn[Y]=Fn[G]=Fn[rn]=Fn[en]=Fn[un]=Fn[on]=true,Fn[P]=Fn[K]=Fn["[object Map]"]=Fn["[object Set]"]=Fn["[object WeakMap]"]=false;var Nn={"\xc0":"A","\xc1":"A","\xc2":"A","\xc3":"A","\xc4":"A","\xc5":"A","\xe0":"a","\xe1":"a","\xe2":"a",
	"\xe3":"a","\xe4":"a","\xe5":"a","\xc7":"C","\xe7":"c","\xd0":"D","\xf0":"d","\xc8":"E","\xc9":"E","\xca":"E","\xcb":"E","\xe8":"e","\xe9":"e","\xea":"e","\xeb":"e","\xcc":"I","\xcd":"I","\xce":"I","\xcf":"I","\xec":"i","\xed":"i","\xee":"i","\xef":"i","\xd1":"N","\xf1":"n","\xd2":"O","\xd3":"O","\xd4":"O","\xd5":"O","\xd6":"O","\xd8":"O","\xf2":"o","\xf3":"o","\xf4":"o","\xf5":"o","\xf6":"o","\xf8":"o","\xd9":"U","\xda":"U","\xdb":"U","\xdc":"U","\xf9":"u","\xfa":"u","\xfb":"u","\xfc":"u","\xdd":"Y",
	"\xfd":"y","\xff":"y","\xc6":"Ae","\xe6":"ae","\xde":"Th","\xfe":"th","\xdf":"ss"},Tn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},Ln={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},zn={"function":true,object:true},Bn={0:"x30",1:"x31",2:"x32",3:"x33",4:"x34",5:"x35",6:"x36",7:"x37",8:"x38",9:"x39",A:"x41",B:"x42",C:"x43",D:"x44",E:"x45",F:"x46",a:"x61",b:"x62",c:"x63",d:"x64",e:"x65",f:"x66",n:"x6e",r:"x72",t:"x74",u:"x75",v:"x76",x:"x78"},Dn={"\\":"\\",
	"'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Mn=zn[typeof exports]&&exports&&!exports.nodeType&&exports,qn=zn[typeof module]&&module&&!module.nodeType&&module,Pn=zn[typeof self]&&self&&self.Object&&self,Kn=zn[typeof window]&&window&&window.Object&&window,Vn=qn&&qn.exports===Mn&&Mn,Zn=Mn&&qn&&typeof global=="object"&&global&&global.Object&&global||Kn!==(this&&this.window)&&Kn||Pn||this,Yn=m(); true?(Zn._=Yn, !(__WEBPACK_AMD_DEFINE_RESULT__ = function(){
	return Yn}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))):Mn&&qn?Vn?(qn.exports=Yn)._=Yn:Mn._=Yn:Zn._=Yn}).call(this);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! (webpack)/buildin/module.js */ 2)(module), (function() { return this; }())))

/***/ },
/* 2 */
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 3 */
/*!*************************!*\
  !*** ./src/app/flow.js ***!
  \*************************/
/***/ function(module, exports) {

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


/***/ },
/* 4 */
/*!**************************!*\
  !*** ./src/app/tests.js ***!
  \**************************/
/***/ function(module, exports, __webpack_require__) {

	var jsSpeed = __webpack_require__(/*! ../suites/base/jsspeed */ 5);
	var dom = __webpack_require__(/*! ../suites/base/dom */ 6);
	var querySelector = __webpack_require__(/*! ../suites/base/querySelector */ 8);
	
	var loadHtml = __webpack_require__(/*! ../suites/loading/loadHtml */ 10);
	var loadImage = __webpack_require__(/*! ../suites/loading/loadImage */ 11);
	var loadScript = __webpack_require__(/*! ../suites/loading/loadScript */ 12);
	var loadCSS = __webpack_require__(/*! ../suites/loading/loadCSS */ 13);;
	var localStorage = __webpack_require__(/*! ../suites/cache/localStorage */ 14);
	
	var appcache = __webpack_require__(/*! ../suites/cache/appcache */ 15);
	var cacheFromServer = __webpack_require__(/*! ../suites/cache/cacheFromServer */ 16);
	var cssToggle = __webpack_require__(/*! ../suites/rendering/csstoggle/index */ 17);
	
	
	
	module.exports = {
	   base: [
	     ['Javascript execute speed', jsSpeed],
	     ['DOM core', dom],
	     ['querySelector speed',querySelector]
	   ],
	   loading: [
	     ['load iframe speed', loadHtml],
	     ['load image speed', loadImage],
	     ['load script speed', loadScript],
	     ['load css speed', loadCSS]
	   ],
	   cache: [
	     ['loadStorage speed',localStorage],
	     ['appcache speed', appcache],
	     ['304 cache', cacheFromServer]
	   ],
	   rendering: [
	     ['toggle css speed', cssToggle]
	   ]
	};
	
	
	//control the execute order of tests in each period
	// define('app/config', ['suites/base/jsspeed', 'suites/base/dom','suites/base/querySelector', 'suites/cache/localStorage', 'suites/cache/appcache', 'suites/cache/cacheFromServer', 'suites/loading/loadHtml', 'suites/loading/loadImage', 'suites/loading/loadScript', 'suites/loading/loadCSS/index', 'suites/rendering/csstoggle/index'], function(jsSpeed, dom, querySelector ,localStorage, appcache, cacheFromServer, loadHtml, loadImage, loadScript, loadCSS, cssToggle){
	// 	var config = {
	// 		base: [
	// 			['Javascript execute speed', jsSpeed],
	// 			['DOM core', dom],
	// 			['querySelector speed',querySelector]
	// 		],
	// 		loading: [
	// 			['load iframe speed', loadHtml],
	// 			['load image speed', loadImage],
	// 			['load script speed', loadScript],
	// 			['load css speed', loadCSS]
	// 		],
	// 		cache: [
	// 			['loadStorage speed',localStorage],
	// 			['appcache speed', appcache],
	// 			['304 cache', cacheFromServer]
	// 		],
	// 		rendering: [
	// 			['toggle css speed', cssToggle]
	// 		]
	// 	};
	// 	return config;
	// });

/***/ },
/* 5 */
/*!************************************!*\
  !*** ./src/suites/base/jsspeed.js ***!
  \************************************/
/***/ function(module, exports) {

	//获取browser javascript 的执行速度
	module.exports = function(){
		/* Convert data (an array of integers) to a Base64 string. */
		var toBase64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		var base64Pad = '=';
	
		function toBase64(data) {
			var result = '';
			var length = data.length;
			var i;
			// Convert every three bytes to 4 ascii characters.
			for (i = 0; i < (length - 2); i += 3) {
				result += toBase64Table[data.charCodeAt(i) >> 2];
				result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i+1) >> 4)];
				result += toBase64Table[((data.charCodeAt(i+1) & 0x0f) << 2) + (data.charCodeAt(i+2) >> 6)];
				result += toBase64Table[data.charCodeAt(i+2) & 0x3f];
			}
	
			// Convert the remaining 1 or 2 bytes, pad out to 4 characters.
			if (length%3) {
				i = length - (length%3);
				result += toBase64Table[data.charCodeAt(i) >> 2];
				if ((length%3) == 2) {
					result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i+1) >> 4)];
					result += toBase64Table[(data.charCodeAt(i+1) & 0x0f) << 2];
					result += base64Pad;
				} else {
					result += toBase64Table[(data.charCodeAt(i) & 0x03) << 4];
					result += base64Pad + base64Pad;
				}
			}
	
			return result;
		}
	
		/* Convert Base64 data to a string */
		var toBinaryTable = [
			-1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
			-1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
			-1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,62, -1,-1,-1,63,
			52,53,54,55, 56,57,58,59, 60,61,-1,-1, -1, 0,-1,-1,
			-1, 0, 1, 2,  3, 4, 5, 6,  7, 8, 9,10, 11,12,13,14,
			15,16,17,18, 19,20,21,22, 23,24,25,-1, -1,-1,-1,-1,
			-1,26,27,28, 29,30,31,32, 33,34,35,36, 37,38,39,40,
			41,42,43,44, 45,46,47,48, 49,50,51,-1, -1,-1,-1,-1
		];
	
		function base64ToString(data) {
			var result = '';
			var leftbits = 0; // number of bits decoded, but yet to be appended
			var leftdata = 0; // bits decoded, but yet to be appended
	
			// Convert one by one.
			for (var i = 0; i < data.length; i++) {
				var c = toBinaryTable[data.charCodeAt(i) & 0x7f];
				var padding = (data.charCodeAt(i) == base64Pad.charCodeAt(0));
				// Skip illegal characters and whitespace
				if (c == -1) continue;
	
				// Collect data into leftdata, update bitcount
				leftdata = (leftdata << 6) | c;
				leftbits += 6;
	
				// If we have 8 or more bits, append 8 bits to the result
				if (leftbits >= 8) {
					leftbits -= 8;
					// Append if not padding.
					if (!padding)
						result += String.fromCharCode((leftdata >> leftbits) & 0xff);
					leftdata &= (1 << leftbits) - 1;
				}
			}
	
			// If there are any bits left, the base64 string was corrupted
			if (leftbits)
				throw {
					msg: 'Corrupted base64 string'
				};
	
			return result;
		}
	
		var str = "";
	
		for ( var i = 0; i < 8192; i++ )
				str += String.fromCharCode( (25 * Math.random()) + 97 );
	
		for ( var j = 8192; j <= 16384; j *= 2 ) {
	
			var base64;
	
			base64 = toBase64(str);
			var encoded = base64ToString(base64);
			if (encoded != str)
				throw "ERROR: bad result: expected " + str + " but got " + encoded;
	
			// Double the string
			str += str;
		}
	
		toBinaryTable = null;
	};


/***/ },
/* 6 */
/*!********************************!*\
  !*** ./src/suites/base/dom.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	var domTemplate = __webpack_require__(/*! ./dom.tpl.html */ 7);
	var domArea;
	var domSuite = {
	  prep: function() {
	    domArea = document.getElementById('base-area');
	  },
	  test: function() {
	    var num = 40,
	      nodeAry = [],
	      itemDiv, queryDom;
	    //InnerHTML
	    for (var i = 0; i < num; i++) {
	      itemDiv = document.createElement('div');
	      itemDiv.className = 'testA' + i;
	      itemDiv.id = 'A' + i;
	      itemDiv.innerHTML = domTemplate;
	      nodeAry.push(itemDiv);
	    }
	
	    //Appending
	    for (var j = 0; j < num; j++) {
	      domArea.appendChild(nodeAry[j]);
	    }
	
	    //Prepending&Insert  means insertBefore
	    //注意这样并不会创建出80个DIV
	    //因为这里是对已经存在元素操作
	    //前面的Appending执行完后是
	    //A0 A1  A2....
	    for (var m = 0; m < num; m++) {
	      var first = domArea.firstChild;
	      domArea.insertBefore(nodeAry[m], first);
	    }
	    //现在倒回来了
	    //A39  A38 ...只是改变了顺序而已
	    //除非是新的元素insertBefore才会添加
	
	    //Querying
	    for (var z = 0; z < num; z++) {
	      queryDom = document.getElementsByClassName('testA' + z);
	      queryDom = document.getElementById('A' + z);
	      queryDom = document.getElementsByClassName('testB' + z); //找不到
	      queryDom = document.getElementById('B' + z); //找不到
	      queryDom = document.querySelector('#A' + z);
	      queryDom = document.querySelector('#B' + z); //找不到
	    }
	
	    //Removing
	    for (var q = 0; q < num; q++) {
	      queryDom = document.getElementsByClassName('testA' + q)[0];
	      domArea.removeChild(queryDom);
	    }
	  }
	};
	module.exports = domSuite;


/***/ },
/* 7 */
/*!**************************************!*\
  !*** ./src/suites/base/dom.tpl.html ***!
  \**************************************/
/***/ function(module, exports) {

	module.exports = "  <div class=\"head\">\r\n   <p><a href=\"http://www.w3.org/\"><img height=48 alt=W3C src=\"http://www.w3.org/Icons/w3c_home\" width=72></a>\r\n\r\n   <h1 id=\"title\">Selectors</h1>\r\n\r\n   <h2>W3C Working Draft 15 December 2005</h2>\r\n\r\n   <dl>\r\n\r\n\t<dt>This version:\r\n\r\n\t<dd><a href=\"http://www.w3.org/TR/2005/WD-css3-selectors-20051215\">\r\n\t\t\t\t http://www.w3.org/TR/2005/WD-css3-selectors-20051215</a>\r\n\r\n\t<dt>Latest version:\r\n\r\n\t<dd><a href=\"http://www.w3.org/TR/css3-selectors\">\r\n\t\t\t\t http://www.w3.org/TR/css3-selectors</a>\r\n\r\n\t<dt>Previous version:\r\n\r\n\t<dd><a href=\"http://www.w3.org/TR/2001/CR-css3-selectors-20011113\">\r\n\t\t\t\t http://www.w3.org/TR/2001/CR-css3-selectors-20011113</a>\r\n\r\n\t<dt><a name=editors-list></a>Editors:\r\n\r\n\t<dd class=\"vcard\"><span class=\"fn\">Daniel Glazman</span> (Invited Expert)</dd>\r\n\r\n\t<dd class=\"vcard\"><a lang=\"tr\" class=\"url fn\" href=\"http://www.tantek.com/\">Tantek &Ccedil;elik</a> (Invited Expert)\r\n\r\n\t<dd class=\"vcard\"><a href=\"mailto:ian@hixie.ch\" class=\"url fn\">Ian Hickson</a> (<span\r\n\tclass=\"company\"><a href=\"http://www.google.com/\">Google</a></span>)\r\n\r\n\t<dd class=\"vcard\"><span class=\"fn\">Peter Linss</span> (former editor, <span class=\"company\"><a\r\n\thref=\"http://www.netscape.com/\">Netscape/AOL</a></span>)\r\n\r\n\t<dd class=\"vcard\"><span class=\"fn\">John Williams</span> (former editor, <span class=\"company\"><a\r\n\thref=\"http://www.quark.com/\">Quark, Inc.</a></span>)\r\n\r\n   </dl>\r\n\r\n   <p class=\"copyright\"><a\r\n   href=\"http://www.w3.org/Consortium/Legal/ipr-notice#Copyright\">\r\n   Copyright</a> &copy; 2005 <a href=\"http://www.w3.org/\"><abbr\r\n   title=\"World Wide Web Consortium\">W3C</abbr></a><sup>&reg;</sup>\r\n   (<a href=\"http://www.csail.mit.edu/\"><abbr title=\"Massachusetts\r\n   Institute of Technology\">MIT</abbr></a>, <a\r\n   href=\"http://www.ercim.org/\"><acronym title=\"European Research\r\n   Consortium for Informatics and Mathematics\">ERCIM</acronym></a>, <a\r\n   href=\"http://www.keio.ac.jp/\">Keio</a>), All Rights Reserved.  W3C\r\n   <a\r\n   href=\"http://www.w3.org/Consortium/Legal/ipr-notice#Legal_Disclaimer\">liability</a>,\r\n   <a\r\n   href=\"http://www.w3.org/Consortium/Legal/ipr-notice#W3C_Trademarks\">trademark</a>,\r\n   <a\r\n   href=\"http://www.w3.org/Consortium/Legal/copyright-documents\">document\r\n   use</a> rules apply.\r\n\r\n   <hr title=\"Separator for header\">\r\n\r\n  </div>\r\n";

/***/ },
/* 8 */
/*!******************************************!*\
  !*** ./src/suites/base/querySelector.js ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	var queryTemplate = __webpack_require__(/*! ./querySelector.tpl.html */ 9);
	//Test for querySelector performance
	var domArea;
	var querySelectorSuite = {
	    prep: function() {
	        var itemDiv;
	        domArea = document.getElementById('base-area');
	        itemDiv = document.createElement('div');
	        itemDiv.className = 'querySelector';
	        itemDiv.innerHTML = queryTemplate;
	        domArea.appendChild(itemDiv);
	
	    },
	    test: function() {
	        var num = 40;
	        for (var p = 0; p < num; p++) {
	            var doc = document.querySelector('.querySelector');
	            var queryDom;
	            //complex descent====================================
	            //console.log('-----------------');
	            queryDom = doc.querySelectorAll("html body div>#complex-multi-rules1 .some-class li[data-bar].some-class");
	            //console.log(queryDom);//ok
	            assertEqual(queryDom.length, 1, 'query failed');
	            // id tag.=============================================
	            queryDom = doc.querySelectorAll("#complex-multi-rules2 acronym");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("[id='complex-multi-rules2'] a");
	            assertEqual(queryDom.length, 1, 'query failed');
	            //  id + selector=========================================
	            //id + tag=============================================
	            queryDom = doc.querySelectorAll("#complex-multi-rules3 source, #complex-multi-rules3 li, #complex-multi-rules3 td");
	            assertEqual(queryDom.length, 11, 'query failed');
	            queryDom = doc.querySelectorAll("[id='complex-multi-rules3'] source, [id='complex-multi-rules3'] li, [id='complex-multi-rules3'] td");
	            assertEqual(queryDom.length, 11, 'query failed');
	            // id + class===========================================
	            queryDom = doc.querySelectorAll("#complex-multi-rules3 .some-class, #complex-multi-rules3 .other-class");
	            assertEqual(queryDom.length, 7, 'query failed');
	            queryDom = doc.querySelectorAll("[id='complex-multi-rules3'] .some-class, [id='complex-multi-rules3'] li, [id='complex-multi-rules3'] .other-class");
	            assertEqual(queryDom.length, 7, 'query failed');
	
	            //serveral Ids=========================================
	            queryDom = doc.querySelectorAll("#complex-multi-rules4 #complex-multi-rules4-sub1 #complex-multi-rules4-sub2 #complex-multi-rules4-sub3");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("#complex-multi-rules4 [id='complex-multi-rules4-sub1'] #complex-multi-rules4-sub2 [id='complex-multi-rules4-sub3']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("[id='complex-multi-rules4'] [id='complex-multi-rules4-sub1'] [id='complex-multi-rules4-sub2'] [id='complex-multi-rules4-sub3']");
	            assertEqual(queryDom.length, 1, 'query failed');
	
	            // Id sandwich: Multiple ids with selectors in between.======================================
	            queryDom = doc.querySelectorAll("#complex-multi-rules5 div #complex-multi-rules5-left ul li.other-class #complex-multi-rules5-right table tr>td");
	            assertEqual(queryDom.length, 2, 'query failed');
	            queryDom = doc.querySelectorAll("div#complex-multi-rules5>div div#complex-multi-rules5-left ul .other-class p img#complex-multi-rules5-image");
	            assertEqual(queryDom.length, 1, 'query failed');
	            // Named form attribute under hierarchy.
	            //根据层次寻找name属性值匹配的元素
	            queryDom = doc.querySelectorAll("input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("form input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] div input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form'] div div input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("form[name='complex-multi-rules6-form']>div>div>input[name='complex-multi-rules6-file-input']");
	            assertEqual(queryDom.length, 1, 'query failed');
	            // Hierarchy of tag and class.======================================
	            queryDom = doc.querySelectorAll("div div a div div p.result-class");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("div div.some-class a.other-class div.another-class div p.result-class");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("div>div>a div div p.result-class");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("div>div.some-class>a.other-class>div.another-class>div>p.result-class");
	            assertEqual(queryDom.length, 1, 'query failed');
	            queryDom = doc.querySelectorAll("div div a div div p.result-class, div div.some-class a div div p.result-class, div div.some-class a.other-class div div p.result-class, div div.some-class a.other-class div.another-class div p.result-class");
	            assertEqual(queryDom.length, 1, 'query failed');
	            // Hierarchy of class =================================
	            queryDom = doc.querySelectorAll('.some-class .some-class');
	            assertEqual(queryDom.length, 2, 'query failed');
	            queryDom = doc.querySelectorAll('.some-class .other-class .another-class .result-class');
	            assertEqual(queryDom.length, 1, 'query failed');
	
	            // tag.class. About 10% of the queries===================================
	            for (var i = 0; i < 5; ++i) {
	                queryDom = doc.querySelectorAll("details.details-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("summary.summary-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("article.article-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	            }
	
	            // Single selector query, 75% of the queries.==============================================================
	            for (var j = 0; j < 5; ++j) {
	                // Tags.
	                queryDom = doc.querySelectorAll("details");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("summary");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("article");
	                assertEqual(queryDom.length, 1, 'query failed');
	                // queryDom = doc.querySelectorAll("head");
	                // assertEqual(queryDom.length, 1, 'query failed');
	                // queryDom = doc.querySelectorAll("body");
	                // assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("form");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("input");
	                assertEqual(queryDom.length, 1, 'query failed');
	
	                // Attributes exists.
	                queryDom = doc.querySelectorAll("[data-foo]");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[data-bar]");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[title]");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[href]");
	                assertEqual(queryDom.length, 2, 'query failed');
	
	                // Attribute = value.
	                queryDom = doc.querySelectorAll("[data-foo=bar]");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[data-bar=baz]");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[title='WebKit Tempalte Framework']");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("[href='http://www.webkit.org/']");
	                assertEqual(queryDom.length, 1, 'query failed');
	
	                // Id.
	                queryDom = doc.querySelectorAll("#complex-multi-rules1");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules2");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules3");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules4");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules5");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules6");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules7");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll("#complex-multi-rules8");
	                assertEqual(queryDom.length, 1, 'query failed');
	
	                // Id with duplicate.
	                queryDom = doc.querySelectorAll("#duplicate-id");
	                assertEqual(queryDom.length, 3, 'query failed');
	
	                // .class.
	                queryDom = doc.querySelectorAll(".details-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll(".summary-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll(".article-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	                queryDom = doc.querySelectorAll(".result-class");
	                assertEqual(queryDom.length, 1, 'query failed');
	            }
	        }
	        //domArea.removeChild(document.querySelector('.querySelector'));
	    },
	    clear: function() {
	        domArea.removeChild(document.querySelector('.querySelector'));
	    }
	};
	module.exports = querySelectorSuite;

/***/ },
/* 9 */
/*!************************************************!*\
  !*** ./src/suites/base/querySelector.tpl.html ***!
  \************************************************/
/***/ function(module, exports) {

	module.exports = "\r\n    <div>\r\n        <div id=\"complex-multi-rules1\">\r\n            <p>Complex descent.</p>\r\n            <div class=some-class>\r\n                <ul>\r\n                    <li data-foo=\"bar\">one</li>\r\n                    <li>two</li>\r\n                    <li data-bar=\"baz\" class=some-class>three</li>\r\n                </ul>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules2\">\r\n            <p>id + tag.</p>\r\n            <acronym title=\"WebKit Tempalte Framework\">WTF</acronym>\r\n            <a href=\"http://www.apple.com\">Link</a>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules3\">\r\n            <p>Multiple id + tag, sharing the same id.</p>\r\n            <audio>\r\n                <source class=some-class>\r\n                    <source class=some-class>\r\n                        <source class=some-class>\r\n            </audio>\r\n            <ol>\r\n                <li class=other-class>one</li>\r\n                <li class=other-class>two</li>\r\n                <li class=other-class>three</li>\r\n                <li class=other-class>four</li>\r\n            </ol>\r\n            <table>\r\n                <tr>\r\n                    <td>cell</td>\r\n                    <td>cell</td>\r\n                </tr>\r\n                <tr>\r\n                    <td>cell</td>\r\n                    <td>cell</td>\r\n                </tr>\r\n            </table>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules4\">\r\n            <p>Several Ids.</p>\r\n            Foo?\r\n            <div>\r\n                Bar?\r\n                <div id=\"complex-multi-rules4-sub1\">\r\n                    Foo?\r\n                    <div>\r\n                        Bar?\r\n                        <div id=\"complex-multi-rules4-sub2\">\r\n                            Foo?\r\n                            <div>\r\n                                <div id=\"complex-multi-rules4-sub3\">\r\n                                    Foo Bar!\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules5\">\r\n            <p>Id sandwich: Multiple ids with selectors in between.</p>\r\n            <div>\r\n                Padding.\r\n            </div>\r\n            <div>\r\n                <div id=\"complex-multi-rules5-left\">\r\n                    <ul>\r\n                        <li class=other-class>one</li>\r\n                        <li class=other-class>two</li>\r\n                        <li class=other-class>\r\n                            three\r\n                            <div id=\"complex-multi-rules5-right\">\r\n                                <p>complex-multi-rules5-right</p>\r\n                                <table>\r\n                                    <tr>\r\n                                        <td>cell</td>\r\n                                        <td>cell</td>\r\n                                    </tr>\r\n                                </table>\r\n                            </div>\r\n                        </li>\r\n                        <li class=\"other-class\">\r\n                            four\r\n                            <p>Some text.\r\n                                <img id=\"complex-multi-rules5-image\">\r\n                            </p>\r\n                        </li>\r\n                    </ul>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=complex-multi-rules6>\r\n            <p>Named form attribute under hierarchy.</p>\r\n            <form name='complex-multi-rules6-form'>\r\n                <div>\r\n                    <div>\r\n                        <input type=file name=\"complex-multi-rules6-file-input\">\r\n                    </div>\r\n                </div>\r\n            </form>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules7\">\r\n            <p>Hierarchy of tag and class.</p>\r\n            <div class=\"some-class\">\r\n                <a href=\"http://www.webkit.org/\" class=other-class>\r\n                    <div class=\"another-class\">\r\n                        <div>\r\n                            <p class=\"result-class\">FooBar!!!</p>\r\n                        </div>\r\n                    </div>\r\n                </a>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=\"complex-multi-rules8\">\r\n            <p>Commonly used restrictionselector.</p>\r\n            <div class=some-class>\r\n                <div class=some-class>\r\n                    <ul>\r\n                        <li>one</li>\r\n                        <li>two</li>\r\n                        <li>three</li>\r\n                    </ul>\r\n                </div>\r\n            </div>\r\n        </div>\r\n\r\n        <div id=\"tag-and-class\">\r\n            <p>tag.class</p>\r\n            <details open class=\"details-class\">\r\n                <summary class=summary-class>Summary</summary>\r\n                <p>Foo Bar!</p>\r\n            </details>\r\n            <article class=article-class>\r\n                <p>Lorem Ipsum</p>\r\n            </article>\r\n        </div>\r\n\r\n        <div id=\"duplicate-id\">\r\n        </div>\r\n        <div id=\"duplicate-id\">\r\n        </div>\r\n        <div id=\"duplicate-id\">\r\n        </div>\r\n    </div>\r\n";

/***/ },
/* 10 */
/*!****************************************!*\
  !*** ./src/suites/loading/loadHtml.js ***!
  \****************************************/
/***/ function(module, exports) {

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


/***/ },
/* 11 */
/*!*****************************************!*\
  !*** ./src/suites/loading/loadImage.js ***!
  \*****************************************/
/***/ function(module, exports) {

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


/***/ },
/* 12 */
/*!******************************************!*\
  !*** ./src/suites/loading/loadScript.js ***!
  \******************************************/
/***/ function(module, exports) {

		var scriptId = 'loadscriptID';
		var loadscriptSuite = {
			test: function(next){
				var scriptTag = document.createElement('script'),
					random = Math.random()*1e16;
				scriptTag.id = scriptId;
				scriptTag.src = '../charts/jquery.min.js?t=' + random;
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
	
		module.exports = loadscriptSuite;


/***/ },
/* 13 */
/*!*********************************************!*\
  !*** ./src/suites/loading/loadCSS/index.js ***!
  \*********************************************/
/***/ function(module, exports) {

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


/***/ },
/* 14 */
/*!******************************************!*\
  !*** ./src/suites/cache/localStorage.js ***!
  \******************************************/
/***/ function(module, exports) {

		var data = {"msg":"OK","top":[{"url":"http://video.dolphin.com/channel.html#tab=movie","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9yZW5qaWFueGlhb3R1YW55LmpwZw==","content_id":"e3705863e82d4d5fa455804790fdf550","corner_image":"","title":"人间小团圆 预告片","url":"http://video.dolphin.com/video.html#detail=e3705863e82d4d5fa455804790fdf550","promotion_text":"梁咏琪池中诱惑","chapters":14,"last_chapter":"《人间·小团圆》花絮：制作特辑之情意·结 (中文字幕)","score":7,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/25/renjian.jpg","last_modified":1400039426,"duration":"1:33:00","update_state":true,"category_id":1,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9YemhhbmppbmcuanBn","content_id":"53e0f96e724045258404b1c582c8cb45","corner_image":"","title":"X战警:逆转未来 预告片","url":"http://video.dolphin.com/video.html#detail=53e0f96e724045258404b1c582c8cb45","promotion_text":"范爷拒绝打酱油","chapters":1,"last_chapter":"X战警：逆转未来 预告片","score":7,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/29/Xzhanjing1.jpg","last_modified":1400039426,"duration":"2:10:00","update_state":false,"category_id":1,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9ydWZhbmd5dXl1ZWxpYW5nLmpwZw==","content_id":"a55c59931a74499396f4153fca0387fd","corner_image":"","title":"乳房与月亮","url":"http://video.dolphin.com/video.html#detail=a55c59931a74499396f4153fca0387fd","promotion_text":"爱上乳房没商量","chapters":1,"last_chapter":"乳房与月亮","score":7.3,"default_image":"http://service.55yule.com/resources/pic/content/2014/01/13/rufang.jpg","last_modified":1400039426,"duration":"1:30:00","update_state":true,"category_id":1,"order":3}],"total":3,"name":"电影"},{"url":"http://video.dolphin.com/channel.html#tab=tvplay","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC81LjE0JUU4JUEzJUI4JUU1JUE5JTlBLmpwZw==","content_id":"472dfeb8d9de4cdd80e3e76feb57de2f","corner_image":"","title":"裸婚之后 TV版","url":"http://video.dolphin.com/video.html#detail=472dfeb8d9de4cdd80e3e76feb57de2f","promotion_text":"幸福小夫妻离婚","chapters":21,"last_chapter":"裸婚之后 21","score":7.8,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/08/5.8%E8%A3%B8%E5%A9%9A%E4%B9%8B%E5%90%8E.jpg","last_modified":1400102604,"duration":"","update_state":false,"category_id":2,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC81LjE0JUU4JTk5JThFJUU1JTg4JUJBJUU3JUJBJUEyLmpwZw==","content_id":"9f2e05e173ce457d93fe0ea9ea377541","corner_image":"","title":"虎刺红","url":"http://video.dolphin.com/video.html#detail=9f2e05e173ce457d93fe0ea9ea377541","promotion_text":"杀死金如玉的真凶","chapters":29,"last_chapter":"虎刺红 第29集预告","score":6,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/06/%E8%99%8E%E5%88%BA%E7%BA%A2.jpg","last_modified":1400095970,"duration":"","update_state":false,"category_id":2,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC81LjE0JUU1JUE2JTgyJUU2JTlFJTlDJUU2JTg4JTkxJUU3JTg4JUIxJUU0JUJEJUEwMS5qcGc=","content_id":"5863dce5400c40ce964a0198bf2c4f8f","corner_image":"","title":"如果我爱你TV版","url":"http://video.dolphin.com/video.html#detail=5863dce5400c40ce964a0198bf2c4f8f","promotion_text":"安宁亚当终和好","chapters":29,"last_chapter":"如果我爱你 TV版-第29集","score":6,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/05/5.5%E6%88%91%E5%A6%82%E6%9E%9C%E7%88%B1%E4%BD%A0.jpg","last_modified":1400107037,"duration":"","update_state":false,"category_id":2,"order":3}],"total":3,"name":"电视剧"},{"url":"http://video.dolphin.com/channel.html#tab=tvshow","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9ydW5uaW5nXzEuanBn","content_id":"45a85cbb26fd4a91ab5e3ae3431db106","corner_image":"","title":"Running Man","url":"http://video.dolphin.com/video.html#detail=45a85cbb26fd4a91ab5e3ae3431db106","promotion_text":"2PM与2NE1乱斗","chapters":121,"last_chapter":"2PM和2NE1大比拼","score":8.8,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/14/runningmanN.jpg","last_modified":1400037418,"duration":"","update_state":true,"category_id":3,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC8lRTclQUMlOTElRTUlOTAlQTdfMS5qcGc=","content_id":"ffbbdf6b74d149808e6bf5e83497f17b","corner_image":"","title":"笑霸来了","url":"http://video.dolphin.com/video.html#detail=ffbbdf6b74d149808e6bf5e83497f17b","promotion_text":"新雨神爱喷水","chapters":146,"last_chapter":"别高兴得太早 新雨神爱喷水","score":8.1,"default_image":"http://service.55yule.com/resources/pic/content/2014/02/12/XB.jpg","last_modified":1400037418,"duration":"05:39","update_state":false,"category_id":3,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC8lRTUlOEQlODElRTglQjYlQjMlRTUlQTUlQjMlRTclQTUlOUVfMS5qcGc=","content_id":"cde925cdda5d4ff88e284f054dec101f","corner_image":"","title":"十足女神范 2014","url":"http://video.dolphin.com/video.html#detail=cde925cdda5d4ff88e284f054dec101f","promotion_text":"宁静自曝感情路","chapters":18,"last_chapter":"20140513 女宾似姚晨如孪生","score":7.4,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/23/1391118864.jpg","last_modified":1400106857,"duration":"","update_state":false,"category_id":3,"order":3}],"total":3,"name":"综艺"},{"url":"http://video.dolphin.com/channel.html#tab=comic","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9oei5qcGc=","content_id":"55b0c7be75464c34b7bbf5bef8db1ab2","corner_image":"","title":"海贼王","url":"http://video.dolphin.com/video.html#detail=55b0c7be75464c34b7bbf5bef8db1ab2","promotion_text":"巨人VS路飞","chapters":644,"last_chapter":"航海王第644集","score":9.5,"default_image":"http://service.55yule.com/resources/pic/content/2013/11/26/haizeiwang.jpg","last_modified":1400036869,"duration":"00:24","update_state":false,"category_id":4,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC96bi5qcGc=","content_id":"456112","corner_image":"","title":"【宅男福利】Bad Dog","url":"http://video.dolphin.com/video.html#detail=456112","promotion_text":"看标题你懂的","chapters":1,"last_chapter":"【宅男福利】Bad Dog","score":9.5,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/13/xg.jpg","last_modified":1400036869,"duration":"02:30","update_state":true,"category_id":4,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9xcy5qcGc=","content_id":"3adfbe784f6c40a597c3e765a78dcf66","corner_image":"","title":"秦时明月之诸子百家","url":"http://video.dolphin.com/video.html#detail=3adfbe784f6c40a597c3e765a78dcf66","promotion_text":"地球被腐女占领","chapters":34,"last_chapter":"第34集","score":9.1,"default_image":"http://service.55yule.com/resources/pic/content/2013/12/04/qinshimingyuezhizhuzibaijia.jpg","last_modified":1400036869,"duration":"","update_state":true,"category_id":4,"order":3}],"total":3,"name":"动漫"},{"url":"http://video.dolphin.com/channel.html#tab=hot","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xMi8lRTglODglOEMlRTUlQjAlOTZfJUU1JTg5JUFGJUU2JTlDJUFDLmpwZw==","content_id":"439684","corner_image":"","title":"舌尖上的中国2","url":"http://video.dolphin.com/video.html#detail=439684","promotion_text":"第四集 家常","chapters":1,"last_chapter":"心传","score":9.8,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/19/%E8%88%8C%E5%B0%96_%E5%89%AF%E6%9C%AC.jpg","last_modified":1399880920,"duration":"50:40","update_state":true,"category_id":5,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC90XzIwMTQwNTEyMTMwMDE3XzE4ODEuanBn","content_id":"1eebcb95109a4a9c923f8011cedef719","corner_image":"","title":"“温柔闹钟”","url":"http://video.dolphin.com/video.html#detail=1eebcb95109a4a9c923f8011cedef719","promotion_text":"睡神变学霸","chapters":1,"last_chapter":"30名女生化身“温柔闹钟”让睡神变学霸","score":8.7,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/14/08.jpg","last_modified":1400054148,"duration":"00:27","update_state":true,"category_id":5,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC8yMDE0MDUxMzA4NTUxMTc2N18xLmpwZw==","content_id":"c9a8bf7f4a1c44cd9e28179670cba5f9","corner_image":"","title":"卖萌课表走红","url":"http://video.dolphin.com/video.html#detail=c9a8bf7f4a1c44cd9e28179670cba5f9","promotion_text":"历史名吾皇万岁","chapters":1,"last_chapter":"卖萌课表走红 课名“听天由命”“自求多福”","score":8.5,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/14/15.jpg","last_modified":1400056366,"duration":"01:10","update_state":true,"category_id":5,"order":3}],"total":3,"name":"热点"},{"url":"http://video.dolphin.com/channel.html#tab=comedy","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9zeC5qcGc=","content_id":"495698","corner_image":"","title":"女上男下运动","url":"http://video.dolphin.com/video.html#detail=495698","promotion_text":"放开那骚年我来","chapters":1,"last_chapter":"女上男下的火热运动 放开那个少年让我来","score":9.4,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/13/sn.jpg","last_modified":1400056104,"duration":"01:58","update_state":true,"category_id":6,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC90enMuanBn","content_id":"49588deed1964853b31321c92b82e377","corner_image":"","title":"打屁股提智商","url":"http://video.dolphin.com/video.html#detail=49588deed1964853b31321c92b82e377","promotion_text":"女人提高男人呢","chapters":47,"last_chapter":"东方不败乱入《卷珠帘》","score":9.5,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/13/tg.jpg","last_modified":1400056104,"duration":"06:27","update_state":true,"category_id":6,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC9temhzLmpwZw==","content_id":"824a87d8d9494b78800e94d31c69ef77","corner_image":"","title":"妹子你在喝啥","url":"http://video.dolphin.com/video.html#detail=824a87d8d9494b78800e94d31c69ef77","promotion_text":"有这么渴吗？","chapters":3,"last_chapter":"妹子你在喝什么啊","score":9.7,"default_image":"http://service.55yule.com/resources/pic/content/2014/05/12/mzh.jpg","last_modified":1400056104,"duration":"02:36","update_state":true,"category_id":6,"order":3}],"total":3,"name":"搞笑"},{"url":"http://video.dolphin.com/channel.html#tab=sexy","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNC8yNS80MjVyZW4tMi5qcGc=","content_id":"449043","corner_image":"","title":"人","url":"http://video.dolphin.com/video.html#detail=449043","promotion_text":"欲望的本性","chapters":1,"last_chapter":" ","score":8.9,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/23/ren.jpg","last_modified":1398423537,"duration":"13:26","update_state":true,"category_id":7,"order":1},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNC8yNS80MjUlRTUlQjclQTglRTQlQjklQjMlRTglOTAlOEMlRTUlQTYlQjkxLmpwZw==","content_id":"449030","corner_image":"","title":"巨乳萌妹禁忌诱惑系列","url":"http://video.dolphin.com/video.html#detail=449030","promotion_text":"清纯性感集合体","chapters":1,"last_chapter":" ","score":9.6,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/23/meiren.jpg","last_modified":1398423352,"duration":"04:00","update_state":true,"category_id":7,"order":2},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNC8yNS80MjVjaGFsdWtvdS5qcGc=","content_id":"449040","corner_image":"","title":"岔路口","url":"http://video.dolphin.com/video.html#detail=449040","promotion_text":"跟着诱惑走远","chapters":1,"last_chapter":" ","score":8.9,"default_image":"http://service.55yule.com/resources/pic/content/2014/04/23/%E5%B2%94%E8%B7%AF%E5%8F%A3.jpg","last_modified":1398423929,"duration":"34:35","update_state":true,"category_id":7,"order":3}],"total":3,"name":"福利"}],"banner":[{"url":"","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xNC8lRTUlODclQkElRTglQkQlQThfMS5qcGc=","url":"http://video.dolphin.com/subject.html#id=368","pattern":null,"promotion_text":"","last_modified":1400060020,"order":1},{"promotion_image":"http://image.dolphin.com/image/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wMS8yOC8xMzkwODk5Njg1LmpwZw==/dz0yMDAmcT04MA==","content_id":"65ff3c36864f49469413ebc417919678","corner_image":"","title":"农林","url":"http://video.dolphin.com//video.html#detail=65ff3c36864f49469413ebc417919678","promotion_text":"农林学院小爱情","chapters":8,"last_chapter":"农林08","score":8,"default_image":"http://service.55yule.com/resources/pic/content/2014/01/28/1390899685.jpg","last_modified":1393644332,"duration":"","update_state":false,"category_id":4,"order":8}],"total":2,"name":"首页_banner"},{"url":"","items":[{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xMi8xLmpwZw==","url":"http://video.dolphin.com/channel.html#tab=movie","pattern":4,"promotion_text":"电影","last_modified":1399865415,"order":1},{"promotion_image":"http://image.dolphin.com/image/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wMy8xNy8lRTclODMlQUQlRTclODIlQjkucG5n/dz0wJnE9ODA=","url":"http://video.dolphin.com/channel.html#tab=hot","pattern":2,"promotion_text":"今日热点","last_modified":1395026426,"order":2},{"promotion_image":"http://image.dolphin.com/image/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wMS8yNS8lRTUlOEElQTglRTYlQkMlQUJfMS5wbmc=/dz0wJnE9ODA=","url":"http://video.dolphin.com/channel.html#tab=comic","pattern":2,"promotion_text":"动漫","last_modified":1395026426,"order":3},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xMi8xXzEuanBn","url":"http://video.dolphin.com/channel.html#tab=tvplay","pattern":4,"promotion_text":"电视剧","last_modified":1399865611,"order":4},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xMi8xXzQuanBn","url":"http://video.dolphin.com/channel.html#tab=subject","pattern":5,"promotion_text":"精选专题","last_modified":1399868516,"order":5},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNS8xMi8yLmpwZw==","url":"http://video.dolphin.com/channel.html#tab=tvshow","pattern":4,"promotion_text":"综艺","last_modified":1399867888,"order":6},{"promotion_image":"http://image.dolphin.com/image/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wMy8wMy8lRTYlOTAlOUUlRTclQUMlOTEucG5n/dz0wJnE9ODA=","url":"http://video.dolphin.com/channel.html#tab=comedy","pattern":2,"promotion_text":"搞笑","last_modified":1395026426,"order":7},{"promotion_image":"http://dolphin-video.b0.upaiyun.com/aHR0cDovL3NlcnZpY2UuNTV5dWxlLmNvbS9yZXNvdXJjZXMvcGljL2NvbnRlbnQvMjAxNC8wNC8yNS8xXzguanBn","url":"http://video.dolphin.com/channel.html#tab=sexy","pattern":5,"promotion_text":"午夜福利","last_modified":1398423295,"order":8}],"total":8,"name":"精品分类"}],"result":0};
		module.exports =  function(next){
			var localStorage = window.localStorage;
			var key = 'test-local-storage';
			localStorage.setItem(key, JSON.stringify(data));
			var localData = localStorage.getItem(key);
			assertEqual(typeof(localData), 'string', 'Failed get data from localStorage');
			try{
	      localData = JSON.parse(localData);
	      next();
			}catch(e){
				fail('Failed parse localStorage data');
			}
			assertEqual(localData.msg, 'OK', 'Failed get correct data that set localStorage before');
			console.log('localStorage working...');
		};


/***/ },
/* 15 */
/*!**************************************!*\
  !*** ./src/suites/cache/appcache.js ***!
  \**************************************/
/***/ function(module, exports) {

	module.exports = function(next) {
	  var iframe = document.createElement('iframe');
	  iframe.onload = function() {
	    next();
	  };
	  // iframe.src = 'http://test1.dolphin-browser.com/pychen/ua/test.html';
	  iframe.src = '/Sites/src/suites/cache/cache.html';
	  document.getElementById('cache-area').appendChild(iframe);
	  console.log('appcache working...');
	};


/***/ },
/* 16 */
/*!*********************************************!*\
  !*** ./src/suites/cache/cacheFromServer.js ***!
  \*********************************************/
/***/ function(module, exports) {

	//测试server端返回304，浏览器的行为
	var iframe = document.createElement('iframe');
	iframe.id = 'cacheFromServerSuite';
	var cacheSuite = {
	  prep: function(next) {
	    var random = Math.random() * 1e16;
	    iframe.onload = function() {
	      iframe.onload = function() {
	        next();
	      };
	      document.getElementById('cacheFromServerSuite').contentWindow.window.location.reload();
	    };
	    iframe.src = '/304page?t=' + random;
	    iframe.onerror = function() {
	      alert('当前用例准备失败，请刷新重试！');
	    };
	    document.getElementById('cache-area').appendChild(iframe);
	
	  },
	  test: function(next) {
	    var iframeWin = document.getElementById('cacheFromServerSuite').contentWindow.window,
	      timeoutId;
	    iframeWin.testCache304 = false;
	    iframe.onload = function() {
	      clearTimeout(timeoutId);
	      if (iframeWin.testCache304) {
	        next();
	      } else {
	        next(null, 'failed');
	      }
	    };
	    iframeWin.location.reload(false);
	    timeoutId = setTimeout(function() {
	      next(null, 'failed');
	    }, 1000);
	    console.log('cacheFromServer working...');
	  }
	};
	
	module.exports = cacheSuite;


/***/ },
/* 17 */
/*!*************************************************!*\
  !*** ./src/suites/rendering/csstoggle/index.js ***!
  \*************************************************/
/***/ function(module, exports) {

		var renderingDom, curSuiteDom,
			imageUrl = 'url(data:image/jpg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkZDMDhBNjM0REIwQTExRTNBNDJGQjZBQjM5N0E4MjlCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkZDMDhBNjM1REIwQTExRTNBNDJGQjZBQjM5N0E4MjlCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RkMwOEE2MzJEQjBBMTFFM0E0MkZCNkFCMzk3QTgyOUIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RkMwOEE2MzNEQjBBMTFFM0E0MkZCNkFCMzk3QTgyOUIiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYG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) no-repeat center center';
		var csstoggleSuite = {
			prep: function(next){
				this.test = 'fortest';
				renderingDom = $('#rendering-area');
				renderingDom.append('<div class="csstoggle-wrap" style="width: 20px; height: 20px;"></div>');
				console.log('test99900------------------------------------');
				curSuiteDom = $('.csstoggle-wrap', this.renderingDom)[0];
				curSuiteDom.style.background = imageUrl;
				setTimeout(function(){
					next();
				}, 0);
			},
			test: function(next){
				var num = 101;
				for(var i=0; i<num; i++){
					if(i%2 === 0){
						curSuiteDom.style.background = 'none';
					}else{
						curSuiteDom.style.background = imageUrl;
					}
				}
	
				setTimeout(function(){
					assertEqual(curSuiteDom.style['background-image'], 'none', 'Failed toggle css background property');
					next();
				}, 0);
				console.log('csstoggle working...');
			}
		};
	
		module.exports = csstoggleSuite;


/***/ },
/* 18 */
/*!**************************!*\
  !*** ./src/app/timer.js ***!
  \**************************/
/***/ function(module, exports) {

	function Timer(options) {
	  options = options || {};
	  var now = options.now || function() {
	      return new Date().getTime();
	    },
	    startTime;
	
	  this.start = function() {
	    startTime = now();
	  };
	
	  this.elapsed = function() {
	    return now() - startTime;
	  };
	}
	module.exports = Timer;


/***/ },
/* 19 */
/*!*********************************!*\
  !*** ./src/app/canvasDrawer.js ***!
  \*********************************/
/***/ function(module, exports) {

	var unit = 'rem';
	function process(periodId, percents, canvasWidth, canvasHeight, lineWidth) {
	  var canvasSelector = '.canvas-wrapper.' + periodId +' canvas';
	  var canvasWidth = canvasWidth || 320;
	  var canvasHeight = canvasHeight || 320;
	  var lineWidth = lineWidth || 20;
	  var canvas = document.querySelector(canvasSelector);
	  // var canvasvalue = canvas.getAttribute("value");
	  var context = canvas.getContext('2d');
	  var scale = window.devicePixelRatio;
	  var center = [canvasWidth / 2 * scale, canvasHeight / 2 * scale];
	  canvas.width = canvasWidth * scale;
	  canvas.height = canvasHeight * scale;
	  lineWidth = lineWidth * scale;
	
	  // 画进度(红色)
	  // context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
	  var startAngle = 0;
	  var endAngle = 0;
	  var colorIndex  = 0;
	  while (percent = percents.shift()) {
	    endAngle =  startAngle + percent * 2 * Math.PI
	    context.beginPath();
	    context.arc(center[0], center[1], center[0] - lineWidth, startAngle, endAngle, false);
	    context.lineWidth = lineWidth;
	    context.strokeStyle = colors[(colorIndex++)%colors.length];
	    context.stroke();
	    context.closePath();
	    startAngle = endAngle;
	  }
	
	}
	// process("procanvas", [0.3, 0.4, 0.1, 0.1, 0.1], 320, 320, 12);
	
	module.exports = process;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map