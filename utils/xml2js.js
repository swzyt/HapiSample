
const xml2js = require('xml2js');
const parseString = require('xml2js').parseString;

/**
 * @param { Object } params 对象
 * @param { Object } obj 需要转换为xml的对象
 * @return { Object } options 转换参数
 */
exports.sobj2xml = async function (params) {
    let { options, obj } = params;
    options = options || {};
    if (!options.headless) {
        options.headless = true;
    }
    //如果节点内容为字符串且字符串中有特殊符号（如<、>、&）则会使用CDATA格式
    options.cdata = true;
    //headless省略XML标头,默认false
    let builder = new xml2js.Builder(options);
    let xmlstr = builder.buildObject(obj) //对象转xml格式
    return xmlstr;
    //var valueXml = str.split('?>')[1].replace('\n', '')
}
/**
 * @param { Object } params 对象
 * @param { String } xmlstr xml格式字符串
 * @param { Object } options 转换参数
 */
exports.xml2obj = async function (params) {
    let { options, xmlstr } = params;
    options = options || {};
    if (!options.explicitArray) {
        options.explicitArray = false;
    }
    let output = new Promise((resolve, reject) => {
        parseString(xmlstr, options, function (err, result) {
            //console.log(err);
            if (err) {
                resolve({});
            } else {
                resolve(result);
            }
        });
    })
    return await output;
}

exports.genNonce = function (length) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < (length || 16); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
}