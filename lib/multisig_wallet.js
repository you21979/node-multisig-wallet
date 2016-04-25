'use strict'
var bitcoin = require('bitcoinjs-lib');
var utilFee = require('bitcoin-util-fee');
var utilMS = require('./util_multisig');

var HDWallet = exports.HDWallet = function(masterPubkeys, neededSignatures){
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

var TxBuilder = exports.TxBuilder = function(withdraw_address, network){
    network = network || bitcoin.networks.bitcoin;
    this.txb = new bitcoin.TransactionBuilder(network);
    this.amount = 0;
    this.byte = (34 * 1) + 10;
    this.min_fee = 10000;
    this.target_address = bitcoin.address.toOutputScript(withdraw_address, network)
}

TxBuilder.prototype.add = function(txid, vout_n, vout_value, input_byte){
    this.txb.addInput(txid, vout_n);
    this.amount += Math.round(1e8 * vout_value);
    this.byte += input_byte;
}

TxBuilder.prototype.calcFee = function(){
    return Math.max(utilFee.tx_calc_fee(this.byte, utilFee.getBaseBytePerSatoshi()), this.min_fee);
}

TxBuilder.prototype.commit = function(){
    var fee = this.calcFee();
    if(this.amount - fee <= 0){
        throw new Error('insufficient balance');
    }
    this.txb.addOutput(this.target_address, this.amount - fee);
    return this.txb.buildIncomplete().toHex();
}

