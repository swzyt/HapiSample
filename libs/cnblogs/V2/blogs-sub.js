const { PATTERNKEYS, KEYS } = require("./redis")()
const db = require("../../../bootstrap")().db;

const { getBlogDetail, createBlog, createAuthor } = require("./blogs")(db)
const { getComments } = require("./comments")(db)

//客户端连接redis成功后执行回调
db.cache.client.on("ready", function () {
    //模式订阅-博客
    db.cache.client.psubscribe([PATTERNKEYS.Blogs, PATTERNKEYS.Authors]);
});
//模式订阅-监听订阅成功事件
db.cache.client.on("psubscribe", function (channel, count) {
    console.log("模式订阅成功，频道：" + channel + ", 订阅数：" + count);
});

//模式订阅-监听取消订阅事件
db.cache.client.on("punsubscribe", function (channel, count) {
    console.log("模式订阅取消成功，频道：" + channel + ", 订阅数：" + count);
});

//模式订阅收到消息
db.cache.client.on("pmessage", async function (pattern, channel, message) {
    //console.log(`模式订阅 收到信息， 模式：${pattern}，频道：${channel}，消息：${message}`);
    console.log(`模式订阅 收到信息， 模式：${pattern}，频道：${channel}`);

    //博客
    if (pattern == PATTERNKEYS.Blogs) {
        let blog = JSON.parse(message);
        let blog_detail = await getBlogDetail(blog.blog_id)
        blog.blog_detail = blog_detail;
        await createBlog(blog)
        if (blog.comments > 0)
            await getComments(blog.blog_id, blog.comments)
    }
    //博客作者
    else if (pattern == PATTERNKEYS.Authors) {
        let author = JSON.parse(message);
        await createAuthor(author)
    }
});