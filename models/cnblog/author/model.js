
module.exports = function (sequelize, DataTypes) {
    const CnBlogAuthor = sequelize.define('CnBlogAuthor', {
        blog_author_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: ""
        },
        blogapp: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: ""
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: ""
        },
        uri: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            comment: ""
        },
        avatar: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            comment: ""
        }
    }, {
            tableName: 'cnblogs_authors',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {

                }
            }
        });

    return CnBlogAuthor;
};
