'use strict';
var multisigUtil = require('./util_multisig');
var TxBuilder = require('./txbuilder');

var HDTxBuilder = module.exports = function(change_address, hdwallet, feesize, network){
    this.hdwallet = hdwallet;
    this.txb = new TxBuilder(
                    change_address,
                    hdwallet.neededSignatures,
                    hdwallet.masterPubkeys.length,
                    feesize,
                    network
                );
}

HDTxBuilder.prototype.addInput = function(txid, vout_n, satoshi){
    return this.txb.addInput(
        txid,
        vout_n,
        satoshi,
        this.hdwallet.createRedeemScript(),
        this.hdwallet.path
    );
}

HDTxBuilder.prototype.addSpent = function(address, satoshi){
    return this.txb.addSpent(address, satoshi);
}

HDTxBuilder.prototype.unsignedBuild = function(){
    return this.txb.unsignedBuild();
}

