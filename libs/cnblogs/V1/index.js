const db = require("../../../bootstrap")().db;
const { getBlogs } = require("./blogs")(db)

const init = async () => {
    await getBlogs(1, 10);
}

init();