const _ = require("lodash")
const path = require('path');
const fs = require('fs');
const dirUtil = {};

/**
 * 检查路径是否存在 如果不存在则创建路径 并返回
 * @param {string} folderpath 文件路径
 */
dirUtil.checkDirExist = (folderpath) => {
    try {
        //console.log(__dirname)
        //console.log(path.join(__dirname, '../static/', folderpath))
        const pahtStr = path.join(__dirname, '../static/', folderpath)
        const pathArr = _.pull(pahtStr.split('\\'), "");//去除空目录

        pathArr.forEach((item, index) => {
            let tempDir = _.take(pathArr, index + 1).join("\\")//循环判断多层目录是否存在，不存在则创建
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
        })
        return pathArr.join('/');
    }
    catch (err) {
        console.log("check dir error ", JSON.stringify(err))
        return "";
    }

}
module.exports = dirUtil;