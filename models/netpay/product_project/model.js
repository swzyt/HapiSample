
module.exports = function (sequelize, DataTypes) {
  const NetPayProductProject = sequelize.define('NetPayProductProject', {
    product_project_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: ""
    }
  }, {
    tableName: 'netpay_product_projects',
    timestamps: false,//自动添加时间戳createAt，updateAt
    underscored: true,
    classMethods: {
      associate: function (models) {
        NetPayProductProject.belongsTo(models.NetPayProduct, {
          as: "projects",
          foreignKey: 'product_id'
        });
        NetPayProductProject.belongsTo(models.NetPayProject, {
          as: "products",
          foreignKey: 'project_id'
        });
      }
    }
  });

  return NetPayProductProject;
};
