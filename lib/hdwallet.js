'use strict'
var bitcoin = require('bitcoinjs-lib');
var utilMS = require('./util_multisig');
var networks = require('./networks');
var Wallet = require('./wallet');
var HDTxBuilder = require('./hdtxbuilder');

var HDWallet = module.exports = function(masterPubkeys, neededSignatures){
    this.masterPubkeys = masterPubkeys;
    this.neededSignatures = neededSignatures;
}

HDWallet.prototype.makeWallet = function(path, network){
    return new Wallet(this.neededSignatures, utilMS.masterPubkeyToPubkey(this.masterPubkeys, path), path, network);
}

HDWallet.prototype.makeUnsignedTx = function(change_address, feesize, network){
    return new HDTxBuilder(change_address, this, feesize, network);
}

