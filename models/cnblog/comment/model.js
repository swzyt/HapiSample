
module.exports = function (sequelize, DataTypes) {
    const CnBlogComment = sequelize.define('CnBlogComment', {
        comment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            comment: ""
        },
        blog_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: ""
        },
        title: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            comment: ""
        },
        content: {
            type: DataTypes.TEXT(),
            allowNull: true,
            comment: ""
        },
        published: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: ""
        },
        updated: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: ""
        },
        author_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: ""
        },
        author_uri: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: ""
        },
    }, {
            tableName: 'cnblogs_comments',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {

                }
            }
        });

    return CnBlogComment;
};
