"use strict";

const bootstrap = require('./bootstrap')();
const db = bootstrap.db;
const models = bootstrap.models;
const settings = bootstrap.settings;

const Server = require('./server.js')(settings.server, bootstrap);

require("./routes")(Server, models, Server.oauth, db);

db.sequelize.sync().then(function () {
    Server.start().then(
        console.log('Server running at:', Server.info.uri)
    ).catch(function (err) {
        console.log("API启动出现错误:" + JSON.stringify(err));
    });
}).catch(function (err) {
    console.log("model 同步出现错误:" + JSON.stringify(err));
});