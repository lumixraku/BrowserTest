var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var router = express.Router();
var Record = require('./models/record.js');
var mongodb = require('./models/db');

var app = module.exports = express();


app.use(express.static(__dirname));

router.use(function(req, res, next){
	console.log('%s %s %s', req.method, req.url, req.path);
	next();
});

router.post('/record', function(req, res){
	var record = new Record(JSON.parse(Object.keys(req.body)[0]));
	record.save(function(err){
		if(err){
			res.send(500, {error: 'record save failed!'});
		}
		res.sendStatus(200);
	});
});

//所有数据//单位是 次数
router.get('/records', function(req, res){
	res.set({
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*'
	});
	//读取数据
	mongodb.get('recordsTest', function(err, collection){
		if(err){
			res.json(200, {text: '数据读取失败，请刷新重试！'});
		}
		var dev = req.query.dev;
		// collection.find({'ua':{$regex:dev,$options:'i'}}).toArray(function(err, items){
		// 	res.status(200).json(items);
		// });

		collection.find({}).toArray(function(err, items){
			res.status(200).json(items);
		});



	});
});

//每天数据   //单位是天
router.get('/dayrecords', function(req, res){
	res.set({
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*'
	});
	//读取数据
	mongodb.get('dailyrecordsTest', function(err, collection){
		if(err){
			res.json(200, {text: '数据读取失败，请刷新重试！'});
		}

		collection.find().toArray(function(err, items){
			res.status(200).json(items);
		});
	});
});

router.get('/test', function(req, res){
	res.set({
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*'
	});
	res.json(200, {text: 'hello world'});
});

//test 304
router.get('/304page', function(req, res){
	var hash = 'pychen';
	fs.readFile('./ajaxTest.html', function (err, html) {
	    if (err) {
	        throw err;
	    }
		res.set({
			'Content-Type': 'text/html',
			'Access-Control-Allow-Origin': '*'
		});

		if(req.get('if-none-match') == hash){
			res.writeHeader(304);
		}else{
			res.writeHeader(200, {
				'Etag': hash
			});
			res.write(html);
		}
    res.end();
	});
});

//test post data twice
router.post('/testpost', function(req, res){
	console.log(req.body);
	setTimeout(function(){
		res.send(200);
	}, 500);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);


app.listen(8000);
console.log("Express server listening...");