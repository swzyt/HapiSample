var cache = require('../cache.js');
/**
 * 检测库存是否足够
 * @param {*} key 
 * @param {*} number 
 */
exports.redisCheckKeyStock = async function (key, number = 1) {
    let status = false;

    let stock = 0;
    for (let i = 0; i < number; i++) {
        if (await cache.client.lpopAsync(key))
            stock++;
    }
    if (stock == number)
        status = true

    //检测库存时，不论库存是否足够，均恢复
    //补齐取出的元素
    await cache.client.lpushAsync(key, ...Array.from({ length: stock }, (item, index) => { return key }))

    return status;
}
/**
 * 库存递减
 * @param {*} key 
 * @param {*} number 
 */
exports.redisWatchDecrbyKey = async function (key, number = 1) {

    let status = false;

    let pop_arr = [];
    for (let i = 0; i < number; i++) {
        let stock = await cache.client.lpopAsync(key)
        if (stock) {
            pop_arr.push(stock)
        }
    }
    if (pop_arr.length == number) {
        status = true
    }
    else {
        //扣减时，库存不够本次购买数量，则恢复已取出的库存
        //补齐取出的元素
        await cache.client.lpushAsync(key, ...Array.from({ length: pop_arr.length }, (item, index) => { return key }))
    }

    return status;
}
/**
 * 库存递增
 * @param {*} key 
 * @param {*} number 
 */
exports.redisWatchIncrbyKey = async function (key, number = 1) {
    let status = await cache.client.lpushAsync(key, ...Array.from({ length: number }, (item, index) => { return key }))

    return !!status
}