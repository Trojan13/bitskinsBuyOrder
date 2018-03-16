const fetch = require('node-fetch');

getExternalPrices = async() => {
    let err ;
    let data;
    let body;
    try {
        body = await fetch('https://api.csgofast.com/price/all', {
            method: 'get'
        });
        data = await body.json();
    } catch (e) {
        err = e;
    }

    return new Promise((resolve, reject) => {
        if (err) {
            let error = {};
            error.err = err;
            error.body = body;
            reject(error)
        } else {
            resolve(data);
        }
    })
}

module.exports.getExternalPrices = getExternalPrices;