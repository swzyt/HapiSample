const api = require("./api");

const getComments = async (blog_id, number, size) => {
    try {
        let comments_result = await api.getBlogComments(blog_id, number, size)
        if (comments_result && comments_result.entry) {

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

            let create_comments_result = await createComments(comments_arr);

            //获取下一页
            getComments(blog_id, number + 1, size)
        }
        else {
            console.log(blog_id + " 评论获取完毕")
        }
    }
    catch (err) {
        console.log("异常：" + err)
    }
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
    });

}

module.exports = function (db) {
    this.db = db;

    return {
        getComments
    }
}