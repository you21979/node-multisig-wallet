'use strict';
var multisigUtil = require('./util_multisig');
var TxBuilder = require('./txbuilder');

var HDTxBuilder = module.exports = function(change_address, m, masterpubkeys, feesize, network){
    this.txb = new TxBuilder(change_address, m, masterpubkeys.length, feesize, network);
    this.masterpubkeys = masterpubkeys;
}

HDTxBuilder.prototype.addInput = function(txid, vout_n, satoshi, hdpath){
    var pubkeys = multisigUtil.masterPubkeyToPubkey(this.masterpubkeys, hdpath);
    var redeem_script = multisigUtil.createRedeemScript(this.txb.spec.m, pubkeys).toString('hex');
    return this.txb.addInput(txid, vout_n, satoshi, redeem_script, hdpath);
}

HDTxBuilder.prototype.addSpent = function(address, satoshi){
    return this.txb.addSpent(address, satoshi);
}

HDTxBuilder.prototype.unsignedBuild = function(){
    return this.txb.unsignedBuild();
}

