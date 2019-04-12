
module.exports = function (sequelize, DataTypes) {
    const ZhihuTopicRelation = sequelize.define('ZhihuTopicRelation', {
        topic_relation_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: "话题关系主键"
        },
        topic_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "话题id"
        },
        topic_parent_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "话题父id"
        }
    }, {
            tableName: 'zhihu_topic_relation',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {
                }
            }
        });

    return ZhihuTopicRelation;
};
