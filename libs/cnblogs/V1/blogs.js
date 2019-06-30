const api = require("./api");

const getBlogs = async (number, size) => {
    try {
        let cnblogs_result = await api.getBlogs(number, size)
        if (cnblogs_result && cnblogs_result.entry) {

            let blog_arr = [], author_arr = [];
            //解析博客数组
            for (let i = 0; i < cnblogs_result.entry.length; i++) {
                let item = cnblogs_result.entry[i];

                let obj = {
                    blog_id: item.id,
                    title: item.title._,
                    summary: item.summary._,
                    published: item.published,
                    updated: item.updated,
                    //author: item.author,
                    author_name: item.author.name,
                    blogapp: item.blogapp,
                    link: item.link.$.href,
                    diggs: item.diggs,
                    views: item.views,
                    comments: item.comments
                }

                blog_arr.push(obj)

                author_arr.push({
                    ...item.author,
                    blogapp: item.blogapp
                })
            }
            //博客作者去重
            author_arr = [...new Set(author_arr)]
            //console.log(JSON.stringify(blog_arr), JSON.stringify(author_arr))

            let create_blog_result = await createBlogs(blog_arr);
            let create_author_result = await createAuthors(author_arr);

            //如果删除数量和本次获取博客数量相同，则表示数据已获取完毕
            if (create_blog_result.delete_count != blog_arr.length) {
                //获取下一页
                getBlogs(number + 1, size)
            }
            else {
                console.log("博客获取完毕，开始获取博客详情及评论")
                updateBlogDetail();
                getBlogComments();
            }
        }
        else {
            console.log('无数据')
        }
    }
    catch (err) {
        console.log("异常：" + err)
    }
}

const updateBlogDetail = async () => {
    let blog_list = await db.CnBlog.findAll({ where: { blog_detail: null } });

    for (let i = 0; i < blog_list.length; i++) {
        let blog_detail = await api.getBlogDetail(blog_list[i].blog_id)
        let update_result = await db.CnBlog.update({ blog_detail: blog_detail }, { where: { blog_id: blog_list[i].blog_id } })
        console.log("更新博文内容：", update_result)
    }
    console.log("博文内容更新完毕")
}

const getBlogComments = async () => {
    let blog_list = await db.CnBlog.findAll({ where: { comments: { $gt: 0 } } });

    for (let i = 0; i < blog_list.length; i++) {
        await require("./comments")(db).getComments(blog_list[i].blog_id, 1, 10)
    }
}

const createBlogs = (arr) => {
    return db.CnBlog.destroy({
        where: {
            blog_id: {
                $in: arr.map(item => {
                    return item.blog_id
                })
            }
        }
    }).then(function (delete_count) {
        return db.CnBlog.bulkCreate(arr).then(created_models => {
            return { delete_count, created_models }
        }).catch(err => {
            console.log("批量创建博客出错：", err)
            return null
        })
    });

}

const createAuthors = (arr) => {
    return db.CnBlogAuthor.destroy({
        where: {
            blogapp: {
                $in: arr.map(item => {
                    return item.blogapp
                })
            }
        }
    }).then(function (delete_count) {
        return db.CnBlogAuthor.bulkCreate(arr).then(created_models => {
            return { delete_count, created_models }
        }).catch(err => {
            console.log("批量创建博客作者出错：", err)
            return null
        })
    });
}

module.exports = function (db) {
    this.db = db;

    return {
        getBlogs
    }
}