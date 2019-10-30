var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Guid = require('guid');
var Service = function (db) {
    this.db = db;
    this.include = [{
        model: this.db.NetPayProductProject,
        as: 'projects',
        include: [{
            association: this.db.NetPayProductProject.belongsTo(this.db.NetPayProject, { foreignKey: 'project_id', as: 'project' }),
            required: false,
        }]
    },{
        model: this.db.NetPayDiscount,
        as: 'discount',
    }];
    this.attributes = ['product_id', 'name', 'product_type', 'logo_url', 'banner_imgs', 'poster_bg_url', 'begin_valid_time', 'end_valid_time', 'unit_name', 'description', 'valid', 'base_price', 'mark_price', 'installation_fee', 'optical_modem_deposit', 'operator_cost', 'owner_sharing', 'created_at', 'updated_at', 'discount_id'];
};
//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        distinct: true,
        attributes: this.attributes,
        include: _.cloneDeep(this.include),
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.NetPayProduct.findAndCountAll(options)
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        distinct: true,
        where: where,
        attributes: this.attributes,
        include: _.cloneDeep(this.include),
    };

    return this.db.NetPayProduct.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.NetPayProduct.build(data).save().then((result) => {
        if (result) {
            //写入产品关联项目
            var projects_data = [];
            data.projects && (
                projects_data = data.projects.map(function (item) {
                    return {
                        product_id: result.product_id,
                        project_id: item
                    }
                })
            )
            projects_data && self.db.NetPayProductProject.bulkCreate(projects_data);
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    //删除产品关联项目
    this.db.NetPayProductProject.destroy({ where: where })

    return this.db.NetPayProduct.findOne({ where: where }).then(function (item) {
        if (item)
            return item.destroy();
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//更新单个
Service.prototype.update = function (where, data) {
    let self = this;
    return self.db.NetPayProduct.update(data, { where: where }).then(result => {
        if (result) {
            //写入产品关联项目
            self.db.NetPayProductProject.destroy({ where: where }).then(function () {
                var projects_data = [];
                data.projects && (
                    projects_data = data.projects.map(function (item) {
                        return {
                            product_id: where.product_id,
                            project_id: item
                        }
                    })
                )
                projects_data && self.db.NetPayProductProject.bulkCreate(projects_data);
            })
        }
        return result
    });
};

module.exports = Service;

