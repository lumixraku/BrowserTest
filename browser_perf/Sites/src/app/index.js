// http://localhost:8000/Sites/dist/?type=repeat&repeatTime=3&browser=pc

var _ = require('../lib/lodash.min');
var flow = require('./flow');
var tests = require('./tests');
var Timer = require('./timer');
var canvasDrawer = require('./canvasDrawer');


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
        //此时的suite就是一个对象
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
            //非异步的test不会接受任何参数  直接调用test()
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
    }//for循环结束  所有的测试用例的函数都装载到了Flow对象中

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


