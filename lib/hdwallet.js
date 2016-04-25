'use strict'
var bitcoin = require('bitcoinjs-lib');
var utilMS = require('./util_multisig');

var HDWallet = module.exports = function(masterPubkeys, neededSignatures){
    this.masterPubkeys = masterPubkeys;
    this.neededSignatures = neededSignatures;
}

HDWallet.prototype.makeWallet = function(path){
    return new Wallet(this.neededSignatures, utilMS.masterPubkeyToPubkey(this.masterPubkeys, path), path);
}

var Wallet = function(neededSignatures, pubKeys, path){
    this.neededSignatures = neededSignatures;
    this.pubKeys = pubKeys;
    this.path = path;
    this.redeemScript = utilMS.createRedeemScript(this.neededSignatures, this.pubKeys);
}

Wallet.prototype.generateAddress = function(network){
    return utilMS.generateAddress(this.redeemScript, network || bitcoin.networks.bitcoin);
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

