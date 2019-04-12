
module.exports = function (sequelize, DataTypes) {
    const ZhihuQuestion = sequelize.define('ZhihuQuestion', {
        question_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: "问题id"
        },
        title: {
            type: DataTypes.STRING(1000),
            allowNull: false,
            comment: "问题标题"
        },
        description: {
            type: DataTypes.TEXT(),
            allowNull: false,
            comment: "问题描述"
        },
        answer_count: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            comment: "回答数"
        },
        follow_count: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            comment: "关注数"
        }
    }, {
            tableName: 'zhihu_question',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {
                }
            }
        });

    return ZhihuQuestion;
};
