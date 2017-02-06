'use strict';
var assert = require('assert');
var TxBuilder = require('./txbuilder');

var HDTxBuilder = module.exports = function(hdwallet, change_hdpath, feesize, network){
    var change_wallet = hdwallet.makeWallet(change_hdpath, network);
    this.hdwallet = hdwallet;
    this.network = network;
    this.txb = new TxBuilder(
                    change_wallet.createRedeemScript(),
                    change_wallet.path,
                    hdwallet.neededSignatures,
                    hdwallet.masterPubkeys.length,
                    feesize,
                    network
                );
}

HDTxBuilder.prototype.addInput = function(txid, vout, satoshi, hdpath){
    assert(typeof txid === "string", "must be parameter is string [txid]");
    assert(typeof vout === "number", "must be parameter is number [vout]");
    assert(typeof satoshi === "number", "must be parameter is number [satoshi]");
    assert(typeof hdpath === "string", "must be parameter is string [hdpath]");
    var wallet = this.hdwallet.makeWallet(hdpath, this.network);
    return this.txb.addInput(
        txid,
        vout,
        satoshi,
        wallet.createRedeemScript(),
        wallet.path
    );
}

HDTxBuilder.prototype.addSpent = function(address, satoshi){
    assert(typeof address === "string", "must be parameter is string [address]");
    assert(typeof satoshi === "number", "must be parameter is number [satoshi]");
    return this.txb.addSpent(address, satoshi);
}

HDTxBuilder.prototype.unsignedBuild = function(){
    return this.txb.unsignedBuild();
}

