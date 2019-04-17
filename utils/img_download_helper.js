const download = require('images-downloader').images;

var Bagpipe = require('bagpipe');
var bagpipe = new Bagpipe(10);
bagpipe.on('full', function (length) {
    console.warn('插入新的下载队列，当前队列长度为:' + length);
});

const dirUtil = require("./dir")

const download_handle = (images, dest) => {
    let _path = dirUtil.checkDirExist(dest)
    if (_path) {
        download(images, _path)
            .then((result) => {
                console.log('Images download success', result)

                console.log("当前图片下载结束，通知bagpipe继续执行下一队列，剩余队列数：" + bagpipe.queue.length)
                bagpipe._next();
            })
            .catch((error) => {
                console.log('Images download error  ', error)

                console.log("当前图片下载结束，通知bagpipe继续执行下一队列，剩余队列数：" + bagpipe.queue.length)
                bagpipe._next();
            })
    }
}

const download_img = function (images, dest) {
    bagpipe.push(download_handle, images, dest);
}
/* const download_img = function (url, dest) {
    //const name = url.slice(url.lastIndexOf('/') + 1)
    //'./static/zhihu/img/' + name
    request(url).pipe(fs.createWriteStream(dest)).on('close', function () {
        console.log("当前图片下载完成，通知bagpipe继续执行下一队列，剩余队列数：" + bagpipe.queue.length)
        bagpipe._next();
    })
} */
module.exports = download_img;