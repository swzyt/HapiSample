
const _ = require("lodash")
const api = require("./api");
const PAGE_SIZE = 10;

const getComments = async (blog_id, comments_sum) => {
    for (let number = 1; number <= getMaxPageNumber(comments_sum); number++) {
        try {
            let comments_result = await api.getBlogComments(blog_id, number, PAGE_SIZE)

            if (comments_sum == 1 && _.isObject(comments_result.entry)) {
                comments_result.entry = [comments_result.entry]
            }
            // else if (comments_sum > 1) {
            //     console.log(comments_result.entry)
            //     // if (_.isObject(comments_result.entry)) {
            //     //     comments_result.entry = [comments_result.entry]
            //     // }
            // }

            let record_count = comments_result && comments_result.entry ? comments_result.entry.length : 0
            console.log(`获取到 ${record_count} 条记录`);

            if (record_count) {
                let comments_arr = [];
                //解析评论数组
                for (let i = 0; i < comments_result.entry.length; i++) {
                    let item = comments_result.entry[i];

                    comments_arr.push({
                        comment_id: item.id,
                        blog_id: blog_id,
                        title: item.title._ || '',
                        published: item.published,
                        updated: item.updated,

                        author_name: item.author.name,
                        author_uri: item.author.uri,

                        content: item.content._,
                    })
                }

                //创建评论
                let create_comments_result = await createComments(comments_arr);
            }
            else {
                console.log(blog_id + " 评论获取完毕")
            }
        }
        catch (err) {
            console.log("本次异常：" + err)
        }
    }
}

const getMaxPageNumber = (sum) => {

    let remainder = sum % PAGE_SIZE;

    return parseInt(sum / PAGE_SIZE) + (remainder > 0 ? 1 : 0);
}


const createComments = (arr) => {
    return db.CnBlogComment.destroy({
        where: {
            comment_id: {
                $in: arr.map(item => {
                    return item.comment_id
                })
            }
        }
    }).then(function (delete_count) {
        return db.CnBlogComment.bulkCreate(arr).then(created_models => {
            return { delete_count, created_models }
        }).catch(err => {
            console.log("批量创建评论出错：", err)
            return null
        })
    }).catch(err => {
        console.log("批量删除评论出错：", err)
        return null
    });

}

module.exports = function (db) {
    this.db = db;

    return {
        getComments
    }
}