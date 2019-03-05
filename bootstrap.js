"use strict";

const settings = require('./settings');

//初始化数据库连接
const db = require('./libs/db.js')(settings.mysql);

module.exports = function () {
    const models = require("./models")(db);
    return {
        db: db,
        models: models,
        settings: settings
    };
};