var fs = require("fs");
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var settings = require("../settings");
var dbUrl = settings.mongodb.url;

function connectDb(callback) {
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            console.log('MongoDB数据库连接失败');
            return;
        }
        callback(db);
        //db.close();
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

exports.insertFile = function (dbname, file_temp_path, file_name, options, callback) {
    connectDb(function (db) {
        const DB = db.db(dbname);

        var bucket = new mongodb.GridFSBucket(DB, {
            bucketName: settings.mongodb.tableName_upload_file
        });

        fs.createReadStream(file_temp_path).
            pipe(bucket.openUploadStream(file_name, options)).
            on('error', function (error) {
                callback(error)
            }).
            on('finish', function (result) {
                callback(undefined, result)
            });

    })
}

exports.downloadFile = function (dbname, file_name, callback) {
    let self = this;
    connectDb(function (db) {
        const DB = db.db(dbname);

        self.findOne(settings.mongodb.dbname, `${settings.mongodb.tableName_upload_file}.files`, { filename: file_name }, (err, file_attr) => {
            if (err || !file_attr) return callback("获取文件失败");

            var bucket = new mongodb.GridFSBucket(DB, {
                chunkSizeBytes: 1024,
                bucketName: settings.mongodb.tableName_upload_file
            });
            bucket.openDownloadStreamByName(file_name).
                pipe(fs.createWriteStream(`./static/mongo_file/${file_name}`)).
                on('error', function (error) {
                    return callback(error)
                }).
                on('finish', function () {
                    return callback(undefined, file_attr)
                });
        });

    })
}