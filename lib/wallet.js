'use strict'
var bitcoin = require('bitcoinjs-lib');
var utilFee = require('bitcoin-util-fee');
var utilMS = require('./util_multisig');

var Wallet = module.exports = function(neededSignatures, pubKeys, path, network){
    this.neededSignatures = neededSignatures;
    this.pubKeys = pubKeys;
    this.path = path;
    this.network = network;
    this.redeemScript = utilMS.createRedeemScript(this.neededSignatures, this.pubKeys);
}

Wallet.prototype.generateAddress = function(){
    return utilMS.generateAddress(this.redeemScript, this.network);
}

Wallet.prototype.createRedeemScript = function(){
    return this.redeemScript.toString('hex');
}

Wallet.prototype.getPath = function(){
    return this.path;
}

Wallet.prototype.getInputByte = function(){
    return utilFee.p2sh_calc_input_byte(this.neededSignatures, this.pubKeys.length);
}


