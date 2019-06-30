
module.exports = function (sequelize, DataTypes) {
    const CnBlog = sequelize.define('CnBlog', {
        blog_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            comment: ""
        },
        title: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            comment: ""
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: ""
        },
        blog_detail: {
            type: DataTypes.TEXT({ length: 'medium' }),
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
        link: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: ""
        },
        blogapp: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: ""
        },
        diggs: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: ""
        },
        views: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: ""
        },
        comments: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: ""
        },
    }, {
            tableName: 'cnblogs_blogs',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {

                }
            }
        });

    return CnBlog;
};
