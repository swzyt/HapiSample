const bootstrap = require("../../../bootstrap")()
const db = bootstrap.db;
const settings = bootstrap.settings;

const { getBlogs } = require("./blogs")(db, settings)

// getBlogs();

module.exports = getBlogs