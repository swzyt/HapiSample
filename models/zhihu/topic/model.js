
module.exports = function (sequelize, DataTypes) {
    const ZhihuTopic = sequelize.define('ZhihuTopic', {
        topic_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: "话题id"
        },
        name: {
            type: DataTypes.STRING(1000),
            allowNull: false,
            comment: "话题名称"
        },
        description: {
            type: DataTypes.TEXT(),
            allowNull: false,
            comment: "话题描述"
        }
    }, {
            tableName: 'zhihu_topic',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {
                }
            }
        });

    return ZhihuTopic;
};
