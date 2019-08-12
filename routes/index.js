var fs = require('fs');
var path = require('path');

module.exports = function (server, models, oauth, db) {

    const ROUTES_FOLDER = path.resolve(__dirname);

    fs
        .readdirSync(ROUTES_FOLDER)
        .filter(function (filename) {
            return fs.statSync(path.join(ROUTES_FOLDER, filename)).isDirectory() && !/^index\.js$/.test(filename);
        })
        .forEach(function (moduleName) {

            var module_folder = path.join(ROUTES_FOLDER, moduleName);
            fs.readdirSync(module_folder)
                .filter(function (filename) {
                    //只能加载文件名routes_***.js的文件
                    return /^routes_.*\.js$/.test(filename);
                })
                .forEach(function (routes_file) {
                    var routes_file = path.join(
                        // '..',
                        module_folder,
                        routes_file
                    );

                    console.log("加载 Router 定义: " + routes_file);
                    require(routes_file)(server, models, oauth, db);
                });
        });

};
