const download = require('images-downloader').images;

// The file will be downloaded to this directory. For example: __dirname + '/mediatheque'
const DEST = './static/zhihu/img'

const download_img = async function (images, dest = DEST) {
    try {
        return await download(images, dest)
    }
    catch (error) {
        return error
    }

    /*
    download(images, dest).then(result => {
        return Promise.resolve(result)
        //console.log('Images downloaded', result);
    })
    .catch(error => console.log("downloaded error", error))
    */
}

module.exports = download_img;