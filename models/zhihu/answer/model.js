
module.exports = function (sequelize, DataTypes) {
    const ZhihuAnswer = sequelize.define('ZhihuAnswer', {
        answer_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: "回答id"
        },
        content: {
            type: DataTypes.TEXT(),
            allowNull: false,
            comment: "回答内容"
        },
        vote_up_count: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            comment: "赞同数",
        },
        vote_down_count: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            comment: "反对数",
        }
    }, {
            tableName: 'zhihu_answer',
            timestamps: true,//自动添加时间戳createAt，updateAt
            underscored: true,
            classMethods: {
                associate: function (models) {
                }
            }
        });

    return ZhihuAnswer;
};
