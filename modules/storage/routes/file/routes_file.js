var Joi = require('joi');
var Boom = require('boom');

var multiparty = require('multiparty');
var Guid = require('guid');
var fs = require('fs');
var path = require('path');
var mongodb = require("../../libs/mongodb");
var settings = require("../../settings");
const dirUtil = require("../../utils/dir");

var file_options = settings.modules.storage.file_options;
var static_file_path = dirUtil.checkDirExist(path.join(__dirname, file_options.local.dir));

module.exports = function (server, models) {

    const PREFIX = "Storage";

    server.route([
        {
            method: 'GET',
            path: '/storage/files/upload',
            config: {
                auth: false,
                tags: ['api', 'storage'],
                description: '获取上传文件的表单',
                notes: 'My route notes',
                handler: function (request, h) {

                    var form = `
                        <!DOCTYPE HTML><html>
                            <head><meta http-equiv='content-type' content='text/html; charset=utf-8' /></head>
                            <body>
                                <form method='post' action='/storage/files/upload' enctype='multipart/form-data'>
                                    文件1：<input type='file' name='file1' /></br>
                                    文件2.1：<input type='file' name='file2' /></br>
                                    文件2.2：<input type='file' name='file2' /></br>
                                    文件3：<input type='file' name='file3' /></br>
                                    <!--文件2：<input type='file' name='file2' /></br>-->
                                    标题：<input type='input' name='title' placeholder='标题' size='60'/></br>
                                    描述：<input type='input' name='description' placeholder='描述' size='60' /></br>
                                    自定义信息：<input type='input' name='自定义属性' placeholder='自定义属性' size='60' /></br>
                                    <input type='submit' />
                                </form>
                            </body>
                        </html>`;

                    return form;
                }
            }
        }, {
            method: 'POST',
            path: '/storage/files/upload',
            config: {
                auth: false,
                tags: ['api', 'storage'],
                description: '上传文件的处理程序，支持多文件上传',
                notes: '上传文件的处理程序，支持多文件上传',
                payload: {
                    maxBytes: 511209715200,
                    output: 'stream',
                    parse: false
                },
                handler: async function (request, h) {

                    var form = new multiparty.Form();
                    //先设置文件上传临时目录
                    form.uploadDir = static_file_path;

                    return new Promise(async (resolve, reject) => {
                        form.parse(request.payload, async function (err, form_fields, form_files) {
                            if (err) return reject(Boom.badRequest(err));

                            //自定义属性处理
                            Object.keys(form_fields).map((field_key) => {
                                form_fields[field_key] = form_fields[field_key] ? form_fields[field_key].join(',') : '';
                            })

                            //获取待上传的文件列表
                            let valid_files = [];
                            Object.keys(form_files).map(x => {
                                let valid_file = form_files[x]
                                    .filter(y => {
                                        return y.originalFilename && y.path;
                                    })
                                    .map(z => {
                                        return {
                                            new_file_name: Guid.create() + path.extname(z.path),
                                            temp_path: z.path,
                                            //元数据字段名不要改动
                                            filename: z.originalFilename,
                                            contentType: z.headers['content-type'],
                                            metadata: {
                                                filename: z.originalFilename,//旧文件名
                                                extname: path.extname(z.path),//文件扩展名
                                                ...form_fields//自定义属性
                                            }
                                        }
                                    });
                                valid_files = [
                                    ...valid_files,
                                    ...valid_file
                                ]
                            });

                            if (!valid_files || valid_files.length == 0) {
                                return reject(Boom.badRequest("表单内未检测到文件"));
                            }

                            //批量上传文件
                            for (let i = 0; i < valid_files.length; i++) {
                                let item = valid_files[i];

                                //保存在mongodb
                                if (file_options.mongodb.allow) {

                                    let upload_result = await upload_file_to_mongodb(item.temp_path, item.new_file_name, item);

                                    item.mongo_success = !!!(upload_result.err);
                                    item.mongo_result = upload_result.result;
                                }

                                //保存在本地
                                if (file_options.local.allow) {
                                    let upload_result = fs.renameSync(item.temp_path, path.join(static_file_path, item.new_file_name));
                                    item.local_success = !!!upload_result;
                                    item.local_result = upload_result;
                                }
                            }

                            resolve(valid_files);
                        });
                    })

                    function upload_file_to_mongodb(temp_path, new_file_name, options) {
                        return new Promise((resolve, reject) => {
                            mongodb.insertFile(settings.mongodb.dbname, temp_path, new_file_name, options, (err, result) => {
                                resolve({ err, result });
                            })
                        })
                    }
                }
            }
        }, {
            method: 'GET',
            path: '/storage/mongo_files/{file_name}',
            config: {
                auth: false,
                tags: ['api', 'storage'],
                description: '获取mongodb指定标识的文件',
                notes: '获取mongodb指定标识的文件',
                validate: {
                    params: {
                        file_name: Joi.string().required().description('文件名（guid）')
                    }
                },
                handler: function (request, h) {
                    let file_name = `${request.params.file_name}`

                    return new Promise((resolve, reject) => {
                        //读取文件并返回
                        mongodb.downloadFile(settings.mongodb.dbname, file_name, (err, file_attr) => {
                            if (err || !file_attr) return reject(Boom.badRequest("获取文件失败"));

                            let file_path = path.join(__dirname, "../../static/mongo_file/", file_name)

                            var data = fs.readFileSync(file_path)

                            //读取完成后，删除本地文件
                            if (fs.existsSync(file_path)) {
                                fs.unlinkSync(file_path);
                            }

                            return resolve(
                                h.response(data)
                                    .type(file_attr.contentType)
                                    .header('Cache-Control', 'public, max-age=86400, no-transform')
                                    ////指定下载名
                                    .header('filename', file_attr.metadata.filename)
                                    .header('Content-Disposition', 'attachment; filename=' + file_attr.metadata.filename)
                                    .header('Content-Length', file_attr.length)
                                /**
                                 * res.set({
                                    'Content-Type': 'application/octet-stream', //告诉浏览器这是一个二进制文件
                                    'Content-Disposition': 'attachment; filename=' + fileName, //告诉浏览器这是一个需要下载的文件
                                    'Content-Length': stats.size  //文件大小
                                 */
                            );
                        })
                    })

                }
            }
        }, {
            method: 'GET',
            path: '/storage/local_files/{file_name}',
            config: {
                auth: false,
                tags: ['api', 'storage'],
                description: '获取本地指定标识的文件',
                notes: '获取本地指定标识的文件',
                validate: {
                    params: {
                        file_name: Joi.string().required().description('文件名（guid）')
                    }
                },
                handler: function (request, h) {
                    //生成静态文件路径
                    let file_name = path.join(static_file_path, request.params.file_name);

                    return h.file(file_name);
                }
            }
        }
    ])
};