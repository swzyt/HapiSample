
module.exports = function (sequelize, DataTypes) {
  const SystemTask = sequelize.define('SystemTask', {
    task_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "任务id"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "任务名称"
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "任务类型。local(本地)/remote(远程)"
    },
    method: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "远程任务调用。get/post/delete/put"
    },
    path: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      comment: "地址"
    },
    process_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1,
      comment: "任务进程数"
    },
    parallel_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1,
      comment: "任务并行数"
    },
    valid: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      comment: "是否有效"
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "状态 running(执行中) / pause(暂停)"
    },
    start_time: {
      type: DataTypes.DATE(),
      allowNull: true,
      comment: "开始时间"
    },
    end_time: {
      type: DataTypes.DATE(),
      allowNull: true,
      comment: "结束时间"
    },
    cron: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "执行计划"
    },
    description: {
      type: DataTypes.TEXT(),
      allowNull: true,
      comment: "任务描述"
    },
  }, {
      tableName: 'system_tasks',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          SystemTask.hasMany(models.SystemTaskLog, {
            as: "logs",
            foreignKey: 'task_id'
          });
          SystemTask.hasMany(models.SystemTaskProcess, {
            as: "processs",
            foreignKey: 'task_id'
          });
        }
      }
    });

  return SystemTask;
};
