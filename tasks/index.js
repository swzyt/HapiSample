module.exports = function (text) {
    return {
        text: text,
        execPath: process.execPath,
        dirname: __dirname,
        cwd: process.cwd(),
        config: JSON.stringify(require("../config/docker"))
    };
}