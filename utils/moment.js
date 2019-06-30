const moment = require("moment");

module.exports = {
    moment: moment,

    getNow: function () {
        return moment().format("YYYY-MM-DD HH:mm:ss")
    },

    getDiff: function (start, end) {
        return moment(end).diff(moment(start));
    }
}