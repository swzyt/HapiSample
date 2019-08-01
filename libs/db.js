var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var cache = require('./cache.js');

//定义存放所有数据模块文件的根目录
var MODULES_FOLDER = path.resolve(__dirname, '../models');

module.exports = function (settings) {

    var sequelize = new Sequelize(settings.database, settings.username, settings.password, settings.options);

    var db = {
        cache: cache,
        sequelize: sequelize,
        Sequelize: Sequelize,
    };

    fs
        .readdirSync(MODULES_FOLDER)
        .filter(function (filename) {
            return fs.statSync(path.join(MODULES_FOLDER, filename)).isDirectory();
        })
        .forEach(function (moduleName) {

            var module_folder = path.join(MODULES_FOLDER, moduleName);

            //读取单个模块下的文件
            fs.readdirSync(module_folder)
                .filter(function (filename) {
                    return fs.statSync(path.join(module_folder, filename)).isDirectory();
                })
                .forEach(function (moduleDirectory) {
                    //读取单个model目录下的文件
                    var model_folder = path.join(module_folder, moduleDirectory);
                    fs.readdirSync(model_folder)
                        .filter(function (filename) {
                            //只能加载文件名model.js的文件
                            return /^model\.js$/.test(filename);
                        })
                        .forEach(function (modelFilename) {
                            var modelPath = path.join(
                                // '..',
                                module_folder,
                                moduleDirectory,
                                modelFilename
                            );
                            console.log("加载 model 定义: " + moduleDirectory);
                            var model = sequelize.import(modelPath);
                            db[model.name] = model;
                        });
                })
        });

    //初始化表关联
    Object.keys(db).forEach(function (modelName) {
        if (db[modelName] && db[modelName].options && db[modelName].options.classMethods && db[modelName].options.classMethods.associate) {
            //if ('associate' in db[modelName]) {
            //db[modelName].associate(db);
            db[modelName].options.classMethods.associate(db)
        }
    });

    return db;
};