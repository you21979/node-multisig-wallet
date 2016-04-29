#!/usr/bin/env node
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');

var param = {
    ent : 256,
    network : bitcoin.networks.bitcoin,
}

var mnemonic = bip39.generateMnemonic(param.ent);

console.log(mnemonic)

