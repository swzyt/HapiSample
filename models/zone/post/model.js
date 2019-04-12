
module.exports = function (sequelize, DataTypes) {
  const ZonePost = sequelize.define('ZonePost', {
    post_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "文章id"
    },
    post_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "标题"
    },
    post_content: {
      type: DataTypes.TEXT(),
      allowNull: false,
      comment: "正文"
    },
    /* post_tags: {
      type: DataTypes.ARRAY(),
      allowNull: true,
      comment: "标签"
    }, */
    post_status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "文章状态（publish等）"
    },
    comment_status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "评论状态（open/closed）"
    },
    post_password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "文章密码"
    },
    comment_count: {
      type: DataTypes.INTEGER(),
      allowNull: false,
      comment: "评论总数",
      defaultValue: 0,
    }
  }, {
      tableName: 'zone_posts',
      timestamps: true,//自动添加时间戳createAt，updateAt
      underscored: true,
      classMethods: {
        associate: function (models) {
          ZonePost.belongsTo(models.ZoneUser, {
            as: 'zone_user',
            foreignKey: 'post_user_id'
          });
        }
      }
    });

  return ZonePost;
};
