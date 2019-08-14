var Joi = require('joi');
var Boom = require('boom');

var multiparty = require('multiparty');
var Guid = require('guid');
var fs = require('fs');
var path = require('path');
var mongodb = require("../../libs/mongodb")
var settings = require("../../settings")

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
                handler: function (request, h) {

                    var form = new multiparty.Form();

                    var file_count = 0, upload_result = [];

                    /**
                     * 检测客户端上传的文件是否全部保存至mongodb
                     * @param {*} resolve 
                     */
                    function check_upload_result(resolve) {
                        if (file_count == upload_result.length)
                            return resolve(upload_result)
                    }

                    return new Promise((resolve, reject) => {
                        form.parse(request.payload, function (err, form_fields, form_files) {
                            if (err) return reject(h.error(Boom.badRequest(err)));

                            if (Object.keys(form_files).length == 0) return reject(h.error(Boom.badRequest("表单内未检测到文件")))

                            //计算有效文件总数量
                            Object.keys(form_files).map((files_key, files_index) => {
                                //file_count += form_files[files_key].length
                                file_count += form_files[files_key].filter((file_item, files_index) => {
                                    return file_item.originalFilename && file_item.originalFilename.length > 0
                                }).length
                            })

                            //遍历上传文件
                            Object.keys(form_files).map((files_key, files_index) => {

                                form_files[files_key].forEach((file_item, file_index) => {
                                    //有效文件
                                    if (file_item.originalFilename) {
                                        //生成新的文件名
                                        var new_filename = Guid.create() + path.extname(file_item.path);

                                        //其他属性设置
                                        let options = {
                                            filename: new_filename,
                                            contentType: file_item.headers['content-type'],
                                            metadata: {
                                                filename: file_item.originalFilename,//保存旧文件名
                                                extname: path.extname(file_item.path),//文件扩展名
                                            }
                                        };
                                        Object.keys(form_fields).map((field_key) => {
                                            options.metadata[field_key] = form_fields[field_key] ? form_fields[field_key].join(',') : '';
                                        })

                                        //此处保存至mongodb
                                        mongodb.insertFile(settings.mongodb.dbname, file_item.path, new_filename, options, (err, result) => {
                                            //保存失败
                                            if (err) {
                                                //upload_result.push(err)

                                                return check_upload_result(resolve);
                                            }
                                            //保存成功
                                            else {
                                                upload_result.push(options)

                                                return check_upload_result(resolve);
                                            }
                                        })

                                    }
                                    //无效文件
                                    else {
                                        //upload_result.push({ msg: "此处无有效文件" })

                                        return check_upload_result(resolve);
                                    }
                                })

                            });
                        });
                    })
                }
            }
        }, {
            method: 'GET',
            path: '/storage/files/{file_name}',
            config: {
                auth: false,
                tags: ['api', 'storage'],
                description: '获取指定标识的文件',
                notes: 'My route notes',
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
                                //.header('filename', file_attr.metadata.filename)
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
        }
    ])
};