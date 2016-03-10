var mongodb = require('./db');

var dailyRecord = {
	update: function(obj, callback){
		var record = {};
		for(var key in obj){
			record[key] = obj[key];
		}
		record.time = obj.time ? obj.time : new Date();

		mongodb.get('dailyrecordsTest', function(err, collection){
			if(err){
				return callback(err);
			}

			//写入record文档
			collection.update(
				{day: record.day},
				record,
				{upsert: true}
			);
			callback('ok');
		});
	}
};
module.exports = dailyRecord;