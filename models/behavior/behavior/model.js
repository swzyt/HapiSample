
module.exports = function (sequelize, DataTypes) {
  const Behavior = sequelize.define('Behavior', {
    behavior_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "行为标识"
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "行为动作类型"
    },
    ip_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ip地址"
    },
    app_name: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "系统标识，如szvkh"
    },
    product_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "产品类型，可根据产品设计的表来区分，如travel(旅游)、房间（room）、product(产品)"
    },
    product_id: {
      type: DataTypes.STRING(36),
      allowNull: true,
      comment: "产品标识"
    },
    product_name: {
      type: DataTypes.STRING(180),
      allowNull: true,
      comment: "产品名称"
    },
    module_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "模块标识，如Activty、Product、PersonalCenter"
    },
    module_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "模块名称"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "描述"
    },
    path_url: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "url地址"
    },
    path_params: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "url参数"
    },
    path_full_name: {
      type: DataTypes.STRING(220),
      allowNull: true,
      comment: "路径全名称"
    },
    source_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "来源标识"
    },
    source_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "来源名称"
    },
    device_model: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "设备型号"
    },
    network_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "网络类型"
    },
    spans: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "时长",
      defaultValue: 0
    },
    lat: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "纬度"
    },
    lng: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "经度"
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "国家"
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "省"
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "市"
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "区"
    },
    street: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "街道"
    },
    business_circle: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "商圈"
    },
    operator_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "操作类型"
    },
    operator_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "操作标识"
    },
    business_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "业态"
    },
    business_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "业态名称"
    },
    SESSION_ID: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "全局会话ID"
    },
    city_id: {
      type: DataTypes.STRING(100),
      comment: '城市'
    },
    create_user_type: {
      type: DataTypes.STRING(100),
      comment: '创建者类型'
    },
    create_user_id: {
      type: DataTypes.STRING(100),
      comment: '创建者标识'
    },
    create_user_name: {
      type: DataTypes.STRING(100),
      comment: '创建者显示名'
    },
    update_user_type: {
      type: DataTypes.STRING(100),
      comment: '修改者类型'
    },
    update_user_id: {
      type: DataTypes.STRING(100),
      comment: '修改者'
    },
    update_user_name: {
      type: DataTypes.STRING(100),
      comment: '修改者显示名'
    }
  }, {
      tableName: 'behaviors',
      timestamps: true,
      underscored: true,
      classMethods: {
        associate: function (models) {
        }
      }
    });

  return Behavior;
};
