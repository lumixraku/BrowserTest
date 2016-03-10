//算一天数据的平均值

var dailyRecord = require('./models/dailyRecord.js');
var mongodb = require('./models/db');

module.exports = task;
// var devicesArr =['galaxy','huawei'];
devicesArr = ['huawei'];
var task = {
	setDailyRecord: function(date){
		//读取数据
		mongodb.get('recordsTest', function(err, collection){
			if(err){
				//mongodb.close();
				console.log('数据读取失败：'+err);
			}

			var curDate = new Date(date),
				curDateStr = curDate.getFullYear() + "-" + (curDate.getMonth()+1) + "-" + (curDate.getDate() > 9 ? curDate.getDate() : '0' + curDate.getDate() );

			var dailyRecordObj = {
				'devices':{}
			};
			devicesArr.forEach(function(device,index){
				//collection.find({'day': curDateStr, 'ua': { $regex: device, $options: 'i' }}).toArray(function(err, items){
				collection.find({'day': curDateStr}).toArray(function(err, items){
					//mongodb.close();
					var resultObj = {},
						dateRange = [],
						suite, suitePeriodInfo, suiteBrowser, suitePeriod, periodItem;
						suiteItems = {
							'base': {},
							'loading': {},
							'cache': {},
							'rendering': {}
						};
					for(var i=0,l=items.length; i<l; i++){//拿到的是该时间的所有用例
						suite = items[i];
						suitePeriodInfo = suite.periodInfo;
						suiteBrowser = suite.browser;
						console.log(suiteBrowser);
						for(var period in suitePeriodInfo){
							periodItem = suitePeriodInfo[period];
							if(suiteItems[period][suiteBrowser]){
								suiteItems[period][suiteBrowser].elapsed.push(periodItem.elapsed);
							}else{
								suiteItems[period][suiteBrowser] = {
									'elapsed': [],
									'cases': {}
								}
								suiteItems[period][suiteBrowser].elapsed = [periodItem.elapsed];
							}
							suiteItems[period][suiteBrowser].cases = updateCaseObj(suiteItems[period][suiteBrowser].cases, periodItem.suites);
						}
					}

					dailyRecordObj = getDailyReport(suiteItems);
					dailyRecordObj.day = curDateStr;
					dailyRecordObj.device = device;
					console.log(dailyRecordObj);
					dailyRecord.update(dailyRecordObj, function(){
						console.log('save successful...');
					});
				});
			});
		});
	},
	setAllRecord: function(){
		//读取数据
		mongodb.get('recordsTest', function(err, collection){
			if(err){
				console.log('数据读取失败: '+err);
				return;
			}
			collection.distinct('day', function(err, days){
				if(err){
					console.log('数据读取失败，请稍后重试！');
				}
				days.forEach(function(ele, index){
					task.setDailyRecord(ele);
				});
			});
		});
	}
}

function arrayToObj(array){
	var obj = {};
	for(var i=0,l=array.length; i<l; i++){
		obj[array[i].name] = array[i].elapsed;
	}
	return obj;
}

function updateCaseObj(original, cases){
	var elapsed;
	for(var key in cases){
		elapsed = cases[key];
		if(key in original){
			original[key].push(elapsed);
		}else{
			original[key] = [elapsed];
		}
	}
	return original;
}

function getAverageTime(array){
	// console.log('getAverageTime=================');
	// console.log(array);
	var percent = 0.1,
		delLen = Math.floor(array.length * percent),
		lastDelLen = delLen * -1,
		num = 0;
	array.sort(function(a, b) {//从小到大排序
		return a - b;
	});
	if(delLen !== 0){
		array = array.splice(0, delLen);
		array = array.splice(lastDelLen, delLen);
	}

	for(var i=0,l=array.length; i<l; i++){
		num += array[i];
	}
	return (num/array.length).toFixed(2);
}

function getDailyReport(original){
	var period, browser, suite;

	for(var key in original){//遍历阶段
		period = original[key];
		for(var browserKey in period){//遍历browser
			browser = period[browserKey];
			browser.elapsed = getAverageTime(browser.elapsed);
			for(var suiteName in browser.cases){//遍历每个用例
				suite = browser.cases[suiteName];
				browser.cases[suiteName] = getAverageTime(suite);
			}
		}
	}

	return original;
}

task.setAllRecord();
