const db = require("../../../bootstrap")().db;

const { getBlogs } = require("./blogs")(db)

getBlogs();