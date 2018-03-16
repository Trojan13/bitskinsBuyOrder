const fetch = require('node-fetch');
const base32 = require('thirty-two');
var totp = require('notp').totp;
const config = require('config');
const Bottleneck = require("bottleneck");
var limiter = new Bottleneck(2, 1000);

var api_key = config.get("Bitskins.API_KEY");
var secret = config.get("Bitskins.API_SECRET");

let apiRequest = async (apiEndpoint, method, params = '') => {
    let err, data;
    try {
        let twofactorcode = totp.gen(base32.decode(secret));
        let body = await fetch('https://bitskins.com/api/v1/' + apiEndpoint + '/?api_key=' + api_key + '&code=' + twofactorcode + params, {
            method: method
        }).catch(err => this.err = err);
        if (body.status != 200) {
        data = await body.json().catch(err => this.err = err);
        err = '\x1b[31m Error: '+data.data.error_message+'\x1b[0m'; 
        }
        data = await body.json().catch(err => this.err = err);
        
    } catch (e) {
        console.log("Catch e:"+e);
        err = e;
    }
    return new Promise((resolve, reject) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    })
}

let getBuyOrders = () => {
    return limiter.schedule(apiRequest, 'summarize_buy_orders', 'post');
}
let createBuyOrder = (name, price, quantity) => {
    return limiter.schedule(apiRequest, 'create_buy_order', 'get', '&name=' + encodeURI(name) + '&price=' + price.toFixed(2) + '&quantity=' + quantity);
}
let cancelBuyOrder = (name) => {
    return limiter.schedule(apiRequest, 'cancel_all_buy_orders', 'post', '&market_hash_name=' + encodeURI(name));
}
let cancelBuyOrdersById = (ids) => {
    return limiter.schedule(apiRequest, 'cancel_buy_orders', 'post', '&buy_order_ids=' + ids);
}
let getMyBuyOrders = (page,type) => {
    return limiter.schedule(apiRequest, 'get_buy_order_history', 'post','&page='+page+'&type='+type);
}

module.exports.getBuyOrders = getBuyOrders;
module.exports.createBuyOrder = createBuyOrder;
module.exports.cancelBuyOrder = cancelBuyOrder;

module.exports.cancelBuyOrdersById = cancelBuyOrdersById;
module.exports.getMyBuyOrders = getMyBuyOrders;