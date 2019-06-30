
module.exports = function (sequelize, DataTypes) {
  const SystemMenu = sequelize.define('SystemMenu', {
    menu_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "菜单id"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "菜单名称"
    },
    path: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "路由地址"
    },
    component: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "页面地址"
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "图标"
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "描述"
    },
    valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "是否有效"
    },
    is_show: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
      comment: "是否显示在菜单"
    },
    sort: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      defaultValue: 0,
      comment: "排序值"
    },
    target: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '_self',
      comment: "链接打开方式 _blank(新标签页打开)、_self(当前标签页打开)"
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "父级菜单id"
    }
  }, {
      tableName: 'system_menus',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          //菜单表与菜单按钮子表进行外键关联, 指定外键名称, 否则自动生成, 不直观
          SystemMenu.hasMany(models.SystemMenuButton, {
            as: "buttons",
            foreignKey: 'menu_id'
          });
        }
      }
    });

  return SystemMenu;
};
