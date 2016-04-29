#!/usr/bin/env node
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');

var param = {
    ent : 256,
    network : bitcoin.networks.bitcoin,
}

var mnemonic = bip39.generateMnemonic(param.ent);
var password = undefined;
var masterseed = bip39.mnemonicToSeed(mnemonic, password);
var hdnode = bitcoin.HDNode.fromSeedBuffer(masterseed, param.network);
var masterprv = hdnode.toString();

console.log(mnemonic)
console.log(masterprv)

