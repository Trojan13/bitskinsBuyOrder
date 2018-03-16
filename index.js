'use strict'
const bitApi = require('./bin/bitskins');
const fastApi = require('./bin/csgofast');
const cron = require('node-cron');
const config = require('config');

const minPrice = config.get("Prices.MIN_PRICE");
const maxPrice = config.get("Prices.MAX_PRICE");
const min_discount = config.get("Prices.MIN_DISCOUNT");

let checkBuyOrders = async (p) => {
    let iWantThisSkins = {};
    let err;
    try {
        let b = await bitApi.getBuyOrders();
        let buyOrders = b.data.items;

        buyOrders.sort(function (a, b) {
            return parseFloat(a[1].max_price) - parseFloat(b[1].max_price);
        });

        for (let o in buyOrders) {
            if (parseFloat(p[buyOrders[o][0]]) > minPrice && parseFloat(p[buyOrders[o][0]]) < maxPrice) {
                let tmpObj = buyOrders[o][1];
                tmpObj.extPrice = p[buyOrders[o][0]];
                iWantThisSkins[buyOrders[o][0]] = tmpObj;
            }
        }
    } catch (e) {
        err = e;
    }

    return new Promise((resolve, reject) => {
        if (err) {
            reject(err)
        } else {
            resolve(iWantThisSkins);
        }
    })
}


let setBuyOrders = async (skins) => {
    for (let skin in skins) {
        let extPrice = skins[skin].extPrice;
        let maxPrice = parseFloat(skins[skin].max_price);
        let disc = Math.round(100 - ((maxPrice / extPrice) * 100));
        let myPrice = -1;
        if (skins[skin].my_buy_orders !== null) {
            myPrice = parseFloat(skins[skin].my_buy_orders.max_price);
        }
        if ((disc >= 35 && extPrice >= 10 && extPrice <= 50) || (disc >= 40 && extPrice >= 51 && extPrice >= 100) || (disc >= 50 && extPrice >= 100 && extPrice >= 200) || (disc >= 90 && extPrice >= 10)) {
            if (maxPrice === myPrice && skins[skin].my_buy_orders !== null) {
                console.log("\x1b[32m", "Höchstbietend!", "\x1b[0m");
            } else if (skins[skin].my_buy_orders !== null) {
                bitApi.cancelBuyOrder(skin).catch((err) => console.log(err)).then(() => {
                    console.log('Buyorder deleted for || ' + skin);
                    bitApi.createBuyOrder(skin, maxPrice + 0.01, 1).catch((err) => console.log(err)).then(console.log('Buyorder created for || ' + skin + ' || ext: ' + extPrice + ' höchstgebot: ' + maxPrice + ' Discount: ' + disc))
                });
            } else {
                bitApi.createBuyOrder(skin, maxPrice + 0.01, 1).catch((err) => console.log(err)).then(console.log('Buyorder created for || ' + skin + ' || ext: ' + extPrice + ' höchstgebot: ' + maxPrice + ' Discount: ' + disc))
            }
        }
    }
    console.log('-------------------------------------------------------------');
}

let cancelAllBuyOrders = async () => {
    var myIds = [];
    let err;
    try {
        for (let i = 1;i<9;i++){
        let b = await bitApi.getMyBuyOrders(i,'listed');
        let buyOrders = b.data.orders;
        
        for (let o in buyOrders) {
            myIds.push(buyOrders[o].buy_order_id);
        }
        
    }
    console.log(myIds.join(","));
    let c = await bitApi.cancelBuyOrdersById(myIds.join(","));
    } catch (e) {
        err = e;
    }

    return new Promise((resolve, reject) => {
        if (err) {
            reject(err)
        } else {
            resolve(true);
        }
    })
}


let getMyBuyOrdersOnePage = async (page) => {
        var myIds = [];
    let err;
    try {
        for (let i = 1;i<9;i++){
        let b = await bitApi.getMyBuyOrders(i,'listed');
        let buyOrders = b.data.orders;

        for (let o in buyOrders) {
            myIds.push(buyOrders[o].buy_order_id);
        }
        
    }
    console.log(myIds.join(","));
    let c = await bitApi.cancelBuyOrdersById(myIds.join(","));
    } catch (e) {
        err = e;
    }

    return new Promise((resolve, reject) => {
        if (err) {
            reject(err)
        } else {
            resolve(true);
        }
    });
}



(async () => {
    try {
        let p = await fastApi.getExternalPrices();
        let skins = await checkBuyOrders(p);
        setBuyOrders(skins);
    } catch (err) {
        console.log(err);
    }
})();

/*
cron.schedule('* 1-59/6 * * * *', async () => {
    try {
    let p = await fastApi.getExternalPrices();
    let skins = await checkBuyorders(p);
        setBuorders(skins);
    } catch (err) {
        console.log(err);
    }
});*/