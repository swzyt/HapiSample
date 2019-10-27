module.exports = function (db) {
    let system_menus = [{
        menu_id: '10',
        name: '收费管理',
        path: '/netpay',
        component: '',
        icon: 'setting',
        description: '收费管理',
        valid: true,
        is_show: true,
        sort: 0,
        target: '',
        parent_id: ''
    }, {
        menu_id: '11',
        name: '项目列表',
        path: '/netpay/projects',
        component: "./NetPat/Project/List",
        icon: 'appstore',
        description: '项目列表',
        valid: true,
        is_show: true,
        sort: 1,
        target: '',
        parent_id: '10'
    },{
        menu_id: '1',
        name: '系统管理',
        path: '/system',
        component: '',
        icon: 'setting',
        description: '系统管理',
        valid: true,
        is_show: true,
        sort: 1,
        target: '',
        parent_id: ''
    }, {
        menu_id: '2',
        name: '应用列表',
        path: '/system/apps',
        component: "./System/App/List",
        icon: 'appstore',
        description: '应用列表',
        valid: true,
        is_show: true,
        sort: 2,
        target: '',
        parent_id: '1'
    }, {
        menu_id: '3',
        name: '菜单列表',
        path: '/system/menus',
        component: "./System/Menu/List",
        icon: 'menu',
        description: '菜单列表',
        valid: true,
        is_show: true,
        sort: 3,
        target: '',
        parent_id: '1'
    }, {
        menu_id: '4',
        name: '按钮列表',
        path: '/system/buttons',
        component: "./System/Button/List",
        icon: 'build',
        description: '按钮列表',
        valid: true,
        is_show: true,
        sort: 4,
        target: '',
        parent_id: '1'
    }, {
        menu_id: '5',
        name: '角色列表',
        path: '/system/roles',
        component: "./System/Role/List",
        icon: 'gold',
        description: '角色列表',
        valid: true,
        is_show: true,
        sort: 5,
        target: '',
        parent_id: '1'
    }, {
        menu_id: '6',
        name: '用户列表',
        path: '/system/users',
        component: "./System/User/List",
        icon: 'user',
        description: '用户列表',
        valid: true,
        is_show: true,
        sort: 6,
        target: '',
        parent_id: '1'
    }];

    let system_buttons = [{
        button_id: '1',
        name: '查询',
        code: 'search',
        description: '查询',
        valid: true
    }, {
        button_id: '2',
        name: '新增',
        code: 'add',
        description: '新增',
        valid: true
    }, {
        button_id: '3',
        name: '编辑',
        code: 'edit',
        description: '编辑',
        valid: true
    }, {
        button_id: '4',
        name: '删除',
        code: 'delete',
        description: '删除',
        valid: true
    }];

    let system_roles = [{
        role_id: '1',
        name: '超级管理员',
        description: '超级管理员',
        valid: true
    }, {
        role_id: '2',
        name: '普通用户',
        description: '普通用户',
        valid: true
    }];

    let system_role_permissions = [{
        role_id: '1',
        permission_type: 'menu',
        permission_id: '1',
        permission_check_type: 'full'
    }, {
        role_id: '1',
        permission_type: 'menu',
        permission_id: '2',
        permission_check_type: 'full'
    }, {
        role_id: '1',
        permission_type: 'menu',
        permission_id: '3',
        permission_check_type: 'full'
    }, {
        role_id: '1',
        permission_type: 'menu',
        permission_id: '4',
        permission_check_type: 'full'
    }, {
        role_id: '1',
        permission_type: 'menu',
        permission_id: '5',
        permission_check_type: 'full'
    }, {
        role_id: '1',
        permission_type: 'menu',
        permission_id: '6',
        permission_check_type: 'full'
    }];

    return Promise.all([
        db.SystemMenu.findAll({}),
        db.SystemButton.findAll({}),
        db.SystemRole.findAll({}),
        db.SystemRolePermission.findAll({}),
    ]).then(results => {
        let exec = [];
        if (results[0].length == 0) {
            exec.push(db.SystemMenu.bulkCreate(system_menus))
        }
        if (results[1].length == 0) {
            exec.push(db.SystemButton.bulkCreate(system_buttons))
        }
        if (results[2].length == 0) {
            exec.push(db.SystemRole.bulkCreate(system_roles))
        }
        if (results[3].length == 0) {
            exec.push(db.SystemRolePermission.bulkCreate(system_role_permissions))
        }
        return Promise.all(exec);
    })
}