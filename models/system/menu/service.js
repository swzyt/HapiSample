var _ = require('lodash');
var moment = require("moment");
var Boom = require('boom');
var Service = function (db) {
    this.db = db;
    this.attributes = ['menu_id', 'name', 'path', 'component', 'icon', 'description', 'valid', 'is_show', 'sort', 'target', 'parent_id', 'created_at', 'updated_at'];

    this.include = [
        {
            //菜单按钮
            model: this.db.SystemMenuButton,
            as: "buttons",
            attributes: ['menu_id', 'button_id'],
            required: false,
            include: [{
                //按钮信息
                attributes: ['name'],
                association: this.db.SystemMenuButton.belongsTo(this.db.SystemButton, { foreignKey: 'button_id', as: 'button' }),
                required: true
            }]
        }
    ]
};

/**
 * 创建、更新或删除单个操作完成后 更新同级菜单sort
 * @param {*} db 
 * @param {*} item 
 */
const update_sort = function (db, item) {
    //若为一级菜单，则一级菜单中sort>=当前菜单sort的(排除当前菜单)，sort均+1/-1
    //若非一级菜单，则同级菜单中sort>=当前菜单sort的(排除当前菜单)，sort均+1/-1
    let where = {
        sort: { $gte: item.sort },
        menu_id: { $ne: item.menu_id }
    };
    if (item.parent_id) {
        where.parent_id = item.parent_id
    }
    else {
        where.parent_id = { $or: [null, ''] }
    }
    let literal_sql = `\`sort\` + 1`
    db.SystemMenu.update({ sort: db.sequelize.literal(literal_sql) }, { where }).then(result => {
        console.log(result);
    }).catch((err) => {
        console.log(err)
    })
}

//普通列表
Service.prototype.list = function (where, page_size, page_number, orderArr) {

    var options = {
        attributes: this.attributes,
        where: where,
        order: orderArr
    };
    //如果分页参数中有一个等于0, 则获取全部数据
    if (page_size > 0 && page_number > 0) {
        options.limit = page_size;
        options.offset = page_size * (page_number - 1);
    }
    return this.db.SystemMenu.findAndCountAll(options)
};
//树列表
Service.prototype.treelist = function (type, where) {

    let options = {
        attributes: this.attributes,
        include: this.include,
        where: {},
        order: [['parent_id', 'asc'], ['sort', 'asc']]
    }
    if (type == "full")
        options.where = where;

    return this.db.SystemMenu.findAll(options).then(menu_list => {
        console.log(menu_list)
        menu_list = JSON.parse(JSON.stringify(menu_list));

        if (type == "full") {
            return menu_list.map(item => {
                return {
                    key: item.menu_id,//此处添加key字段，源于前端table组件显示树列表无此键值，会报错
                    ...item
                }
            })
        }
        else if (type == "simple") {
            return menu_list.map(item => {
                return {
                    key: item.menu_id,//此处添加key字段，源于前端table组件显示树列表无此键值，会报错
                    title: item.name,
                    value: item.menu_id,
                    sort: item.sort,
                    parent_id: item.parent_id
                }
            })
        }
        return []
    }).catch((err) => {
        console.log(err)
    })
};
//获取单项
Service.prototype.get = function (where) {

    var option = {
        where: where,
        attributes: this.attributes
    };

    return this.db.SystemMenu.findOne(option);
};
//创建
Service.prototype.create = function (data) {

    var self = this;

    return self.db.SystemMenu.build(data).save().then((result) => {
        if (result) {
            //更新sort
            update_sort(self.db, result)

            //写入按钮
            var menu_button_data = [];
            data.buttons && (
                menu_button_data = data.buttons.map(function (button_id) {
                    return {
                        menu_id: result.menu_id,
                        button_id
                    }
                })
            )
            self.db.SystemMenuButton.bulkCreate(menu_button_data);
        }

        return result
    });
};
//删除单个
Service.prototype.delete = function (where) {

    //删除按钮
    this.db.SystemMenuButton.destroy({ where: { menu_id: where.menu_id } })

    return this.db.SystemMenu.findOne({ where: where }).then(function (item) {
        if (item) {
            return item.destroy();
        }
        else
            return Boom.notFound("找不到指定标识的数据")
    });
};
//删除批量
Service.prototype.delete_batch = function (where) {
    //删除按钮
    this.db.SystemMenuButton.destroy({ where: where })

    return this.db.SystemMenu.destroy({ where: where })
};
//更新单个
Service.prototype.update = function (where, data) {
    let self = this;
    return self.db.SystemMenu.update(data, { where: where }).then(result => {
        if (result) {
            self.db.SystemMenu.findOne({ where: where }).then(item => {
                //更新sort
                update_sort(self.db, item)

                //写入按钮
                self.db.SystemMenuButton.destroy({ where: { menu_id: item.menu_id } }).then(function () {
                    var menu_button_data = [];
                    data.buttons && (
                        menu_button_data = data.buttons.map(function (button_id) {
                            return {
                                menu_id: item.menu_id,
                                button_id
                            }
                        })
                    )
                    self.db.SystemMenuButton.bulkCreate(menu_button_data);
                })
            })
        }
        return result
    });
};
//更新批量
Service.prototype.update_batch = function (where, data) {
    return this.db.SystemMenu.update(data, { where: where });
};

module.exports = Service;

