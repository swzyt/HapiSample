var fs = require('fs');
var path = require('path');

module.exports = function (db) {

    const MODELS_FOLDER = __dirname;

    var result = {};

    fs
        .readdirSync(MODELS_FOLDER)
        .filter(function (filename) {
            return fs.statSync(path.join(MODELS_FOLDER, filename)).isDirectory() && !/^index\.js$/.test(filename);
        })
        .forEach(function (prefix_name) {

            var prefix_folder = path.join(MODELS_FOLDER, prefix_name);

            result[prefix_name] = {};

            fs.readdirSync(prefix_folder)
                .filter(function (filename) {
                    return fs.statSync(path.join(prefix_folder, filename)).isDirectory()
                })
                .forEach(function (model_name) {
                    var model_folder = path.join(prefix_folder, model_name);

                    var has_service = false;
                    var has_controller = false;
                    var has_validator = false;

                    //检测 service.js/controller.js/validator.js这三个文件是否存在,如果都存在, 进行模块初始化
                    try {

                        var service_file = path.join(model_folder, "service.js");
                        if (fs.statSync(service_file).isFile()) {
                            has_service = true;
                        }

                        var controller_file = path.join(model_folder, "controller.js");
                        if (fs.statSync(controller_file).isFile())
                            has_controller = true;

                        var validator_file = path.join(model_folder, "validator.js");
                        if (fs.statSync(validator_file).isFile())
                            has_validator = true;

                        if (has_service && has_controller && has_validator) {

                            // var Service = require(path.join("..", service_file));
                            // var Controller = require(path.join("..", controller_file));
                            var Service = require(service_file);
                            var Controller = require(controller_file);

                            var service = new Service(db);
                            var controller = new Controller(service);

                            // var validator = require(path.join("..", validator_file));
                            var validator = require(validator_file);

                            // if (validator.get && validator.get.request) {
                            //     if (validator.get.request.query) {
                            //         validator.get.request.query.check_sign = Joi.string().required().description('签名')
                            //     } else {
                            //         validator.get.request.query = { check_sign: Joi.string().required().description('签名') }
                            //     }
                            // }

                            result[prefix_name][model_name] = {
                                controller: controller,
                                service: service,
                                validator: validator
                            };
                        }

                    } catch (e) {
                        console.log(e.message)

                        if (e.errno != -4058) {
                            console.log(model_name);
                            console.log(e);
                        }
                    }
                });
        });

    return result;
};