var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;


var MongoClient = require('mongodb').MongoClient;


//client 就是 db
var client, collections = {};

function getCollection(name, callback) {
  if (client) {
    //name是collection的名字
    client.collection(name, function(err, collection) {
      if (err) {
        callback(new Error('get collection failed'));
        return;
      }
      callback(null, collection);
    });
  } else {
    callback(new Error('db not connected'));
  }
}

module.exports.get = function(name, callback) {
  if (client) {
    getCollection(name, callback);
  } else {
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
      if (!err) {
        client = db; //db
        client.on('close', function() {
          client = null;
          collections = {};
        });
        getCollection(name, callback);
      } else {
        //error connecting...
        console.log('db open failed')
      }
    });
  }
}



// exports.get = function(name, callback) {
//   if (client) {
//     getCollection(name, callback);
//   } else {
//     console.log('start to conn');
//     new Db(settings.db,
//       new Server(settings.host, 27017, {}), {
//         w: 0
//       }).open(function(err, db) {
//       console.log('conn callback');
//       if (!err) {
//         client = db; //db
//         client.on('close', function() {
//           client = null;
//           collections = {};
//         });
//         getCollection(name, callback);
//       } else {
//         //error connecting...
//         console.log('db open failed')
//       }
//     });
//   }
// }

