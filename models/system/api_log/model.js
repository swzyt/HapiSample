
module.exports = function (sequelize, DataTypes) {
  const SystemApiLog = sequelize.define('SystemApiLog', {
    api_log_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: ""
    },
    req_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: ""
    },
    req_start: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: ""
    },
    res_end: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: ""
    },
    req_res_span_time: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      comment: ""
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: ""
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: ""
    },
    request: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: ""
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: ""
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: ""
    },
  }, {
      tableName: 'system_api_logs',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {

        }
      }
    });

  return SystemApiLog;
};
