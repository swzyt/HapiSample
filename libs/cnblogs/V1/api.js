//接口整理博客
//https://www.cnblogs.com/wangshuo1/p/5431854.html
const { xml2obj } = require("../../../utils/xml2js")

const restler = require('restler');

var headers = {
    "content-type": "text/xml"
}

const get = (url, options, xml_root_name) => {
    console.log(url)

    return new Promise((resolve, reject) => {
        restler.get(url, options)
            .on("success", function (result) {
                //console.log("请求成功：", result);
            })
            .on("fail", function (result) {
                //console.log("请求失败：", result);
            })
            .on('complete', function (result) {
                if (!result) {
                    console.log("无数据")
                }
                if (result instanceof Error) {
                    console.log("请求出错了：", result)
                    reject(null)
                }

                //解析xml为json
                if (!xml_root_name) {
                    resolve(result)
                }
                else {
                    return xml2obj({ xmlstr: result, options: { rootName: xml_root_name } })
                        .then(result_obj => {
                            if (result_obj && result_obj[xml_root_name])
                                resolve(result_obj[xml_root_name])
                            else
                                resolve(null)
                        }).catch(err => {
                            console.log("解析xml出错了：", err)
                            reject(null)
                        })
                }
            })
    })
}

module.exports = {
    /**
     * 获取首页文章-分页
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getBlogs: function (page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/blog/sitehome/paged/${page_number}/${page_size}`;

        return get(url, { headers }, "feed")
    },
    /**
     * 获取博客内容
     * @param {*} blog_id 
     */
    getBlogDetail: function (blog_id) {
        let url = `http://wcf.open.cnblogs.com/blog/post/body/${blog_id}`;

        return get(url, { headers }, "string")
    },
    /**
     * 获取博客评论
     * @param {*} blog_id 
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getBlogComments: function (blog_id, page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/blog/post/${blog_id}/comments/${page_number}/${page_size}`;

        return get(url, { headers }, "feed")
    },
    /**
     * 个人博客
     * @param {*} user_id 
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getPersonalBlogs: function (user_id, page_number, page_size = 10) {
        //http://wcf.open.cnblogs.com/blog/u/dudu/posts/1/10
        let url = `http://wcf.open.cnblogs.com/blog/u/${user_id}/posts/${page_number}/${page_size}`;

        return url;
    },
    /**
     * 搜索博主
     * @param {*} name 
     */
    searchBloggers: function (name) {
        //http://wcf.open.cnblogs.com/blog/bloggers/search?t=%E8%80%90
        let url = `http://wcf.open.cnblogs.com/blog/bloggers/search?t=${encodeURIComponent(name)}`;

        return url;
    },
    /**
     * 推荐博客排名
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getRecommendBloggers: function (page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/blog/bloggers/recommend/${page_number}/${page_size}`;

        return url;
    },
    /**
     * 48小时阅读排行
     */
    get48HoursTopViewPosts: function () {
        //http://wcf.open.cnblogs.com/blog/48HoursTopViewPosts/20
        let url = `http://wcf.open.cnblogs.com/blog/48HoursTopViewPosts/20`;

        return url;
    },
    /**
     * 10天内推荐排行
     */
    getTenDaysTopDiggPosts: function () {
        //http://wcf.open.cnblogs.com/blog/TenDaysTopDiggPosts/20
        let url = `http://wcf.open.cnblogs.com/blog/TenDaysTopDiggPosts/20`;

        return url;
    },


    /**
     * 新闻最新10条
     */
    getNewsRecently10: function () {
        let url = `http://wcf.open.cnblogs.com/news/recent/10`;

        return url;
    },
    /**
     * 新闻分页接口
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getNews: function (page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/news/recent/paged/${page_number}/${page_size}`;

        return url;
    },
    /**
     * 新闻内容
     * @param {*} news_id 
     */
    getNewsDetail: function (news_id) {
        // (实现方法：
        // http://www.cnblogs.com/dudu/archive/2011/10/27/wcf_web_api.html)
        let url = `http://wcf.open.cnblogs.com/news/item/${news_id}`;

        return url;
    },
    /**
     * 新闻评论
     * @param {*} news_id 
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getNewsComments: function (news_id, page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/news/item/${blog_id}/comments/${page_number}/${page_size}`;

        return url;
    },
    /**
     * 推荐新闻
     * @param {*} page_number 
     * @param {*} page_size 
     */
    getRecommendNews: function (page_number, page_size = 10) {
        let url = `http://wcf.open.cnblogs.com/news/recommend/paged/${page_number}/${page_size}`;

        return url;
    },


    /**
     * 博客类接口文档
     */
    getBlogHelp: function () {
        let url = `http://wcf.open.cnblogs.com/blog/help`;

        return url;
    },
    /**
     * 新闻类接口文档
     */
    getNewsHelp: function () {
        let url = `http://wcf.open.cnblogs.com/news/help`;

        return url;
    },
}