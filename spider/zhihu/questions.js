const asyncRedis = require("async-redis");
const redis_client = asyncRedis.decorate(require("../../libs/cache").client);
redis_client.select(1);

var QUESTION_ID = '26656153';

var restler_client = require('restler');
var _ = require("lodash")
var cheerio = require('cheerio')
var request = require('request')
var fs = require('fs')
var Bagpipe = require('bagpipe');
var bagpipe = new Bagpipe(10);
/* bagpipe.on('full', function (length) {
    console.warn('图片下载队列长度为:' + length);
}); */

var QUESTION_REDIS_KEY = "QUESTIONS:Q_ID_" + QUESTION_ID;

var LIMIT = 5, OFFSET = 0;

const getUrl = (data) => {
    let url = `https://www.zhihu.com/api/v4/questions/${QUESTION_ID}/answers`
    return `${url}?${object2formdata(data)}`;
}

const getAnswers = (offset) => {

    let data = {
        'include': "data%5B%2A%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Crelevant_info%2Cquestion%2Cexcerpt%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%2Cis_labeled%2Cis_recognized%2Cpaid_info%3Bdata%5B%2A%5D.mark_infos%5B%2A%5D.url%3Bdata%5B%2A%5D.author.follower_count%2Cbadge%5B%2A%5D.topics",
        'limit': LIMIT,
        'offset': offset,
        'platform': 'desktop',
        'sort_by': 'default'
    }

    restler_client.get(getUrl(data)).on('complete', function (result) {
        if (result instanceof Error) {
            getAnswers(offset)
            return;
        }

        if (result && result.data && result.data.length > 0) {
            let answers = result.data;

            answers.forEach(async (item, index) => {
                //console.log(item)
                //写入redis
                await redis_client.zadd(QUESTION_REDIS_KEY, 0, JSON.stringify(item))
                //处理图片
                let $ = cheerio.load(item.content)
                let answer_img = $("img");
                answer_img.map(async (img_index, img_item) => {
                    if (img_item.attribs && img_item.attribs.src && (img_item.attribs.src.indexOf("https://pic") > -1 || img_item.attribs.src.indexOf("http://pic") > -1)) {
                        //console.log(img_item.attribs.src)

                        let name = img_item.attribs.src.slice(img_item.attribs.src.lastIndexOf('/') + 1)

                        //download_img(img_item.attribs.src, './static/zhihu/img/' + name)
                        bagpipe.push(download_img, img_item.attribs.src, './static/zhihu/img/' + name, function (err, data) {
                            //console.log(img_item.attribs.src)
                            //console.log(img_item.attribs.src, err, data)
                        });
                    }
                })
            })

            //处理完毕后，翻页
            getAnswers(offset + LIMIT)
        }
    });
}

const object2formdata = function (obj, is_encodeURI = true) {
    let arr = [];
    Object.keys(obj).forEach((key) => {
        //console.log(key, obj[key], _.isObject(obj[key]))
        if (_.isObject(obj[key])) {
            let str = JSON.stringify(obj[key]);
            arr.push(`${key}=${(is_encodeURI ? encodeURI(str) : str)}`)
        }
        else {
            arr.push(`${key}=${obj[key]}`)
        }
    })
    return arr.join('&');
}

const download_img = function (url, dest) {
    //const name = url.slice(url.lastIndexOf('/') + 1)
    //'./static/zhihu/img/' + name
    request(url).pipe(fs.createWriteStream(dest)).on('close', function () {
        console.log("当前图片下载完成，通知bagpipe继续执行下一队列")
        bagpipe._next();
    })
}

//开始
getAnswers(OFFSET)