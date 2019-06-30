var Boom = require('boom');

var Controller = function (service) {
    this.service = service;
};

/**
 * js实现无限层级树形数据结构
 * 调用时，字段名以字符串的形式传参，如treeData(source, 'id', 'parentId', 'children')
 * @param {*} source 
 * @param {*} id 
 * @param {*} parentId
 * @param {*} children
 */
const treeData = function (source, id, parentId, children) {
    let cloneData = JSON.parse(JSON.stringify(source))
    return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => father[id] == child[parentId])
        branchArr.length > 0 ? father[children] = branchArr : ''

        //return father[parentId] == null        // 如果第一层不是parentId=0，请自行修改
        return !father[parentId]        // 如果第一层不是parentId=0，请自行修改
    })
}

//普通列表
Controller.prototype.list = function (request, h) {

    var where = {};
    var order = [];

    //模糊查询
    if (request.query.name) {
        where.name = { $like: `%${request.query.name}%` }
    }
    if (request.query.path) {
        where.path = { $like: `%${request.query.path}%` }
    }
    if (request.query.component) {
        where.component = { $like: `%${request.query.component}%` }
    }
    if (request.query.description) {
        where.description = { $like: `%${request.query.description}%` }
    }
    //数组in查询
    if (request.query.valid) {
        where.valid = {
            $in: request.query.valid.split(",").map(item => {
                return (/^true$/i).test(item);
            })
        }
    }
    if (request.query.is_show) {
        where.is_show = {
            $in: request.query.is_show.split(",").map(item => {
                return (/^true$/i).test(item);
            })
        }
    }
    //=查询
    if (request.query.sort) {
        where.sort = request.query.sort
    }
    //数组between and 查询
    if (request.query.created_at) {
        where.created_at = { $between: request.query.created_at.split(",") }
    }
    if (request.query.updated_at) {
        where.updated_at = { $between: request.query.updated_at.split(",") }
    }

    //排序条件
    if (request.query.sorter) {
        order.push(request.query.sorter.split("|"))
    }
    else {
        order.push(['created_at', 'desc'])
    }

    return this.service.list(where, request.query.page_size, request.query.page_number, order).then(function (list) {
        return h.success({ total: list.count, items: list.rows });
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//树列表
Controller.prototype.menu_treelist_full = function (request, h) {
    /* let where = ' where 1 = 1 ';
    //模糊查询
    if (request.query.name) {
        where += ` and name like '%${request.query.name}%' `
    }
    if (request.query.path) {
        where += ` and path like '%${request.query.path}%' `
    }
    if (request.query.component) {
        where += ` and component like '%${request.query.component}%' `
    }
    if (request.query.description) {
        where += ` and description like '%${request.query.description}%' `
    }
    //数组in查询
    if (request.query.valid) {
        let items = request.query.valid.split(",").map(item => {
            return (/^true$/i).test(item);
        })
        where += ` and valid in(${items.join(',')}) `
    }
    if (request.query.is_show) {
        let items = request.query.is_show.split(",").map(item => {
            return (/^true$/i).test(item);
        })
        where += ` and is_show in(${items.join(',')}) `
    }
    //=查询
    if (request.query.sort) {
        where += ` and sort = ${request.query.sort} `
    }
    //数组between and 查询
    if (request.query.created_at) {
        let items = request.query.created_at.split(",")
        where += ` and created_at between ${items[0]} and ${items[1]} `
    }
    if (request.query.updated_at) {
        let items = request.query.updated_at.split(",")
        where += ` and updated_at between ${items[0]} and ${items[1]} `
    } */

    let where = {};

    //模糊查询
    if (request.query.name) {
        where.name = { $like: `%${request.query.name}%` }
    }
    if (request.query.path) {
        where.path = { $like: `%${request.query.path}%` }
    }
    if (request.query.component) {
        where.component = { $like: `%${request.query.component}%` }
    }
    if (request.query.description) {
        where.description = { $like: `%${request.query.description}%` }
    }
    //数组in查询
    if (request.query.valid) {
        where.valid = {
            $in: request.query.valid.split(",").map(item => {
                return (/^true$/i).test(item);
            })
        }
    }
    if (request.query.is_show) {
        where.is_show = {
            $in: request.query.is_show.split(",").map(item => {
                return (/^true$/i).test(item);
            })
        }
    }
    //=查询
    if (request.query.sort) {
        where.sort = request.query.sort
    }
    //数组between and 查询
    if (request.query.created_at) {
        where.created_at = { $between: request.query.created_at.split(",") }
    }
    if (request.query.updated_at) {
        where.updated_at = { $between: request.query.updated_at.split(",") }
    }

    let child_field = request.query.child_field || 'children';

    return this.service.menu_treelist_full(where).then(function (menu_list) {
        let treedata = treeData(menu_list, 'menu_id', 'parent_id', child_field)

        return h.success(treedata);
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
Controller.prototype.menu_treelist_simple_button = function (request, h) {
    return this.service.menu_treelist_simple_button().then(function (menu_list) {
        let treedata = treeData(menu_list, 'value', 'parent_id', 'children')

        return h.success(treedata);
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
Controller.prototype.menu_treelist_simple_no_button = function (request, h) {
    return this.service.menu_treelist_simple_no_button().then(function (menu_list) {
        let treedata = treeData(menu_list, 'value', 'parent_id', 'children')

        return h.success(treedata);
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//获取单项
Controller.prototype.get = function (request, h) {

    var where = { menu_id: request.params.menu_id };

    return this.service.get(where).then(function (row) {

        if (!row) return h.error(Boom.badRequest("找不到指定标识的数据"));

        var item = row.get();
        return h.success(item);

    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//创建
Controller.prototype.create = function (request, h) {

    if (request.payload && JSON.stringify(request.payload) != "{}") {
        return this.service.create(request.payload).then(function (result) {
            return h.success(result);
        }).catch(function (err) {
            return h.error(Boom.badRequest(err.message, err));
        })
    }
    else {
        return h.error(Boom.badRequest("消息体不能为空"));
    }
};
//删除单个
Controller.prototype.delete = function (request, h) {

    var where = { menu_id: request.params.menu_id };

    return this.service.delete(where).then(function (row) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//删除批量
Controller.prototype.delete_batch = function (request, h) {

    var where = { menu_id: { $in: request.payload.menu_ids } };

    return this.service.delete_batch(where).then(function (row) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//更新单个
Controller.prototype.update = function (request, h) {

    var where = { menu_id: request.params.menu_id };

    return this.service.update(where, request.payload).then(function (result) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};
//更新批量
Controller.prototype.update_batch = function (request, h) {

    var where = { menu_id: request.payload.menu_ids };
    delete request.payload.menu_ids

    return this.service.update_batch(where, request.payload).then(function (result) {
        return h.success();
    }).catch(function (err) {
        return h.error(Boom.badRequest(err.message, err));
    })
};

module.exports = Controller;