'use strict'
var assert = require('assert');
var bitcoin = require('bitcoinjs-lib');
var utilMS = require('./util_multisig');
var networks = require('./networks');
var Wallet = require('./wallet');
var HDTxBuilder = require('./hdtxbuilder');

var HDWallet = module.exports = function(masterPubkeys, neededSignatures){
    assert(masterPubkeys instanceof Array, "must be parameter is Array [masterPubkeys]")
    assert(typeof neededSignatures === "number", "must be parameter is number [neededSignatures]")
    this.masterPubkeys = masterPubkeys;
    this.neededSignatures = neededSignatures;
}

HDWallet.prototype.makeWallet = function(path, network){
    assert(typeof path === "string", "must be parameter is string [path]")
    assert(typeof network === "object", "must be parameter is object [network]")
    return new Wallet(this.neededSignatures, utilMS.masterPubkeyToPubkey(this.masterPubkeys, path), path, network);
}

HDWallet.prototype.makeUnsignedTx = function(change_hdpath, feesize, network){
    assert(typeof change_hdpath === "string", "must be parameter is string [change_hdpath]")
    assert(typeof feesize === "number", "must be parameter is number [feesize]")
    assert(typeof network === "object", "must be parameter is object [network]")
    return new HDTxBuilder(this, change_hdpath, feesize, network);
}

