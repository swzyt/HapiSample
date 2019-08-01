module.exports = function (text) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("哈哈2" + text)
        }, 3000)
    })
}