var MongoClient = require('mongodb').MongoClient;
var dbUrl = require("../settings").mongndb_url;

function connectDb(callback) {
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            console.log('MongoDB数据库连接失败');
            return;
        }
        callback(db);
        db.close();
    })
}

exports.findOne = function (dbname, collectionname, json, callback) {

    connectDb(function (db) {
        const DB = db.db(dbname);
        const collection = DB.collection(collectionname);
        var result = collection.findOne(json, null, callback);
    });
}

exports.find = function (dbname, collectionname, json, callback) {
    connectDb(function (db) {
        const DB = db.db(dbname);
        const collection = DB.collection(collectionname);
        var result = collection.find(json).toArray(callback);
    });
}

exports.insertOne = function (dbname, collectionname, json, callback) {
    connectDb(function (db) {
        const DB = db.db(dbname);
        const collection = DB.collection(collectionname);
        collection.insertOne(json, callback)
    })
}