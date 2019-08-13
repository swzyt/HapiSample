
module.exports = function (sequelize, DataTypes) {
  const SystemTaskProcess = sequelize.define('SystemTaskProcess', {
    task_process_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "任务进程id"
    },
    host: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "主机名"
    },
    process_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "任务运行进程id"
    },
    queue_length: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
      comment: "任务在当前进程中待执行的任务数"
    },
  }, {
      tableName: 'system_task_processs',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          SystemTaskProcess.belongsTo(models.SystemTask, {
            as: "processs",
            foreignKey: 'task_id'
          });
        }
      }
    });

  return SystemTaskProcess;
};
