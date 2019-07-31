
const guid = require("guid");

var TaskMgr = require("./index")();
let id = guid.create().value
TaskMgr.Run(id)

console.log(TaskMgr.task_list)

setTimeout(function () {
    console.log(TaskMgr.task_list)
    TaskMgr.Remove(id)
    console.log(TaskMgr.task_list)
}, 1000 * 30)