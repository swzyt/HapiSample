/* // await 关键字后的函数
var Delay_Time = function(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, 1000)
    } )
}
// async 函数
var Delay_Print = async function(ms) {
    await Delay_Time(ms)
    return new Promise(function(resolve, reject) {
        resolve("End");
    })
}
// 执行async函数后
Delay_Print(1000).then(function(resolve) {
    console.log(resolve);
}) */


const test = (num) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(num)
        }, 2000);
    })
}

const exec = async () => {
    /* for (let i = 0; i < 5; i++) {
        let num = await test(i)
        console.log(num)
    }
    num = await test(20)
    console.log(num)
    num = await test(30)
    console.log(num) */

    [1, 2, 3, 4, 5, 6, 7].forEach(async (element) => {
        let num = await test(element)
        console.log(num)
    });
}

console.log("开始了")
exec();