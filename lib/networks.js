'use strict'
var bitcoin = require('bitcoinjs-lib');

var networks = exports;
Object.keys(bitcoin.networks).forEach(function(key){
    networks[key] = bitcoin.networks[key]
})

