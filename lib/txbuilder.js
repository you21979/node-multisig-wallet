'use strict'
var bitcoin = require('bitcoinjs-lib');
var util = require('bitcoin-util-fee');
var networks = require('./networks');

var TxBuilder = module.exports = function(change_address, m, n, feesize, network){
    this.network = network || networks.bitcoin;
    this.change_address = change_address;
    this.total_input_value = 0;
    this.total_output_value = 0;
    this.feesize = feesize;
    this.inputs = [];
    this.outputs = [];
    this.spec = {
        m : m,
        n : n,
    };
}

TxBuilder.prototype.addInput = function(txid, vout_n, satoshi, redeem_script, hdpath){
    this.total_input_value += satoshi;
    this.inputs.push({
        txid : txid,
        vout : vout_n,
        redeem_script : redeem_script,
        hdpath : hdpath,
    })
}

TxBuilder.prototype.addSpent = function(address, satoshi){
    this.total_output_value += satoshi;
    this.outputs.push({
        address : address,
        satoshi : satoshi
    })
}

TxBuilder.prototype.calcByte = function(){
    var len = this.outputs.length + 1; // output + change
    return util.tx_calc_byte(util.p2sh_calc_input_byte(this.spec.m, this.spec.n), this.inputs.length, len)
}

TxBuilder.prototype.calcFees = function(){
    return util.tx_calc_fee(this.calcByte(), this.feesize);
}

TxBuilder.prototype.unsignedBuild = function(){
    var network = this.network;
    var fees = this.calcFees();
    if(this.total_input_value - fees <= 0){
        throw new Error('insufficient balance');
    }
    var change_value = this.total_input_value - this.total_output_value - fees;
    if(change_value < 0){
        throw new Error('insufficient balance');
    }
    var input_details = [];

    var txb = new bitcoin.TransactionBuilder(network);
    this.inputs.forEach(function(input){
        input_details.push({
            redeem_script : input.redeem_script,
            hdpath : input.hdpath,
        })
        txb.addInput(input.txid, input.vout);
    })
    this.outputs.forEach(function(output){
        var address = bitcoin.address.toOutputScript(output.address, network)
        txb.addOutput(address, output.satoshi);
    })
    var change_address = bitcoin.address.toOutputScript(this.change_address, network)
    txb.addOutput(change_address, change_value);

    var rawtx = txb.buildIncomplete().toHex();
    return {
        result : {
            rawtx : rawtx,
            inputs : input_details,
            iscomplete : false,
        },
        debug : {
            change_address : this.change_address,
            input : this.total_input_value,
            output : this.total_output_value,
            change : change_value,
            miner : fees,
            spb : this.feesize,
        }
    }
}



