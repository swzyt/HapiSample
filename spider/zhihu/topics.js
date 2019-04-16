//var util_redis = require("../../utils/util_redis")
const asyncRedis = require("async-redis");
const redis_client = asyncRedis.decorate(require("../../libs/cache").client);

redis_client.select(1);

var Crawler = require('crawler');
var restler_client = require('restler');
var _ = require("lodash")
var cheerio = require('cheerio')
var download_img = require("../utils/img_download_helper")

var c = new Crawler({
    //rateLimit: 1000,//爬取url时间间隔
    maxConnections: 100,//最大连接数
    jQuery: 'cheerio'
})

//常用变量
let PAGE_NUMBER = 20,//每页查询数量
    TOPIC_LEVEL_INDEX = 0,//话题层级索引值
    TOPIC_REDIS_KEY = "TOPIC_LIST:LEVEL" + TOPIC_LEVEL_INDEX;//话题redis key，层级区分

//主话题广场处理函数
const handle_main_topic_square = (error, res, done) => {
    if (error) {
        console.log(`${TOPIC_REDIS_KEY} 爬取失败…… error: ${JSON.stringify(error)}`)
        return;
    }
    var $ = res.$;

    //主话题
    let main_topics = $(".zu-main-content .zu-main-content-inner .zm-topic-cat-page ul.zm-topic-cat-main li.zm-topic-cat-item")
    main_topics = main_topics.map(async (index, item) => {
        let obj_topic = { topic_id: parseInt(item.attribs["data-id"]), topic_name: item.children[0].children[0].data, parent_id: 0 }

        await insert_redis_sorted_set(TOPIC_REDIS_KEY, obj_topic)

        return obj_topic;
    })

    console.log(`${TOPIC_REDIS_KEY} 爬取成功，数据条数：${main_topics.length}`)

    //主话题是否存在检测，并写入redis
    getCurrLevelTopicFromRedis();

    done();
}

//遍历当前层级话题列表，获取其下一级子话题
const getChildTopic = (curr_level_topics, curr_level_topic_index, offset) => {
    const curr_topic = JSON.parse(curr_level_topics[curr_level_topic_index])

    console.log(`${TOPIC_REDIS_KEY} id: ${curr_topic.topic_id}, name: ${curr_topic.topic_name} 子话题 ${offset - PAGE_NUMBER + 1}-${offset} 爬取中……`)

    let data = {
        method: 'next',
        params: { topic_id: curr_topic.topic_id, offset: offset, hash_id: "" }
    }

    restler_client.post('https://www.zhihu.com/node/TopicsPlazzaListV2', {
        headers: { "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8' },
        data: object2formdata(data)
    }).on('complete', function (result) {
        if (result instanceof Error) {
            console.log(`${TOPIC_REDIS_KEY} id: ${curr_topic.topic_id}, name: ${curr_topic.topic_name} 子话题 ${offset - PAGE_NUMBER + 1}-${offset} 爬取出错……重试中`)
            getChildTopic(curr_level_topics, curr_level_topic_index, offset)
            return;
        }

        console.log(`${TOPIC_REDIS_KEY} id: ${curr_topic.topic_id}, name: ${curr_topic.topic_name} 子话题 ${offset - PAGE_NUMBER + 1}-${offset} 爬取成功，数据条数：${result.msg.length}`)

        if (result && result.msg.length > 0) {
            result.msg.map(async (item, index) => {
                let $ = cheerio.load(item);

                let obj_topic = {
                    topic_id: parseInt($(".item .blk a").attr('href').replace("/topic/", "")),
                    topic_name: $(".item .blk strong").text(),
                    img_url: $(".item .blk img").attr('src'),
                    parent_id: curr_topic.topic_id,
                }

                let download_result = await download_img([obj_topic.img_url])//下载图片
                //console.log(download_result)
                if (download_result && download_result.length > 0) {
                    obj_topic.local_img_url = download_result[0].filename;
                }

                await insert_redis_sorted_set(TOPIC_REDIS_KEY, obj_topic)

                return obj_topic;
            })

            //翻页
            getChildTopic(curr_level_topics, curr_level_topic_index, offset + PAGE_NUMBER)
        } else if (curr_level_topics.length - 1 > curr_level_topic_index) {
            //翻页无数据后，切换到下一个话题
            getChildTopic(curr_level_topics, curr_level_topic_index + 1, PAGE_NUMBER)
        } else {
            //当前层级话题查询完毕后，切换到下一层级话题
            getCurrLevelTopicFromRedis()
        }
    });
}

//获取当前层级话题数据, 
const getCurrLevelTopicFromRedis = async () => {
    let key_length = await redis_client.zcard(TOPIC_REDIS_KEY);

    console.log(`${TOPIC_REDIS_KEY} Redis length 读取成功…… length: ${key_length}`)

    let result = await redis_client.zrange(TOPIC_REDIS_KEY, 0, key_length);

    if (key_length > 0 && result && result.length > 0) {
        console.log(`${TOPIC_REDIS_KEY} Redis data 读取成功……`)
        console.log(``)
        console.log(`********************************************************************************`)
        console.log(``)

        setLevelTopicIndexAndRedisKey();//话题层级索引+1

        getChildTopic(result, 0, PAGE_NUMBER);
        return;
    }

    console.log(`${TOPIC_REDIS_KEY} Redis data 数据条数为0，终止爬取……`)
}
//话题层级索引累加, 并更新redis key
const setLevelTopicIndexAndRedisKey = () => {
    TOPIC_LEVEL_INDEX++;//话题层级索引值
    TOPIC_REDIS_KEY = "TOPIC_LIST:LEVEL" + TOPIC_LEVEL_INDEX;//话题redis key，层级区分
}

//检测数据是否存在，不存在时写入
const insert_redis_sorted_set = async (redis_key, obj) => {
    let exists_index = await redis_client.zrank(redis_key, JSON.stringify(obj));
    if (!exists_index) {
        //console.log(`${redis_key} id: ${obj.topic_id}, name: ${obj.topic_name} 不存在Redis…… 现在写入`)
        await redis_client.zadd(redis_key, TOPIC_LEVEL_INDEX, JSON.stringify(obj))
    }
    else {
        //console.log(`${redis_key} id: ${obj.topic_id}, name: ${obj.topic_name} 已存在Redis…… index: ${exists_index}`)
    }
}

/**
 * x-www-form-urlencoded 下 data 格式转换为formdata
 * @param {Object} obj 源对象
 * @param {Boolean} is_encodeURI 是否编码后返回，默认true
 */
function object2formdata(obj, is_encodeURI = true) {
    let arr = [];
    Object.keys(obj).forEach((key) => {
        //console.log(key, obj[key], _.isObject(obj[key]))
        if (_.isObject(obj[key])) {
            arr.push(`${key}=${JSON.stringify(obj[key])}`)
        }
        else {
            arr.push(`${key}=${obj[key]}`)
        }
    })
    arr = arr.join('&');
    return is_encodeURI ? encodeURI(arr) : arr;
}

//爬取开始
//爬取话题广场
console.log(`${TOPIC_REDIS_KEY} 爬取中……`)
c.queue([{ uri: 'https://www.zhihu.com/topics', callback: handle_main_topic_square }]);