var mongodb = require('./db');

function Record(obj){
	this.day = obj.day;
	this.ua = obj.ua;
	this.version = obj.version; //测试网页版本
	this.browser = obj.browser; //该测试结果的浏览器
	this.results = obj.all;
	this.periods = obj.periods;
	this.time = obj.time ? obj.time : new Date();
}
module.exports = Record;

Record.prototype.save = function save(callback){
	//存入Mongodb的文档
	var record = {
		day: this.day,
		ua: this.ua,
		version: this.version,
		browser: this.browser,
		results: this.results,
		periodInfo: this.periods,
		time: this.time
	};
	console.log(record);
	console.log('===================');
	mongodb.get('recordsTest', function(err, collection){
		if(err){
			//mongodb.close();
			return callback(err);
		}
		//写入record文档

		collection.insertOne(record, function(err, record){
			//mongodb.close();
			callback(err, record);
		});
	});
};