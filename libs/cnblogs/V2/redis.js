const prefix = "cnBlogs:"
module.exports = () => {
    return {

        PATTERNKEYS: {
            Blogs: `${prefix}Blogs:*`,
            Authors: `${prefix}Authors:*`
        },

        KEYS: {
            BlogKey: `${prefix}Blogs`,
            AuthorKey: `${prefix}Authors`
        }
    }
}