
module.exports = function (sequelize, DataTypes) {
  const ZoneComment = sequelize.define('ZoneComment', {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "评论id"
    },
    comment_content: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      comment: "评论正文"
    },
    comment_approved: {
      type: DataTypes.BOOLEAN(),
      allowNull: false,
      comment: "评论是否被批准"
    },
    comment_parent: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "父评论ID"
    }
  }, {
      tableName: 'zone_comments',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          ZoneComment.belongsTo(models.ZonePost, {
            as: 'zone_post',
            foreignKey: 'comment_post_id'
          });
          ZoneComment.belongsTo(models.ZoneUser, {
            as: 'zone_user',
            foreignKey: 'comment_user_id'
          });
        }
      }
    });

  return ZoneComment;
};
