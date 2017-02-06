'use strict'
var bitcoin = require('bitcoinjs-lib');
var util = require('bitcoin-util-fee');
var networks = require('./networks');
var utilMS = require('./util_multisig');

var TxBuilder = module.exports = function(change_redeem_script, change_hdpath, m, n, feesize, network){
    this.network = network || networks.bitcoin;
    this.change = {
        redeem_script : change_redeem_script,
        hdpath : change_hdpath,
        address : utilMS.generateAddress(change_redeem_script, network),
    }
    this.total_input_value = 0;
    this.total_output_value = 0;
    this.feesize = feesize;
    this.inputs = [];
    this.outputs = [];
    this.p2sh_tx_calc_byte = util.p2sh_tx_calc_byte_create(m, n);
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
    var output = this.outputs.length + 1; // output + change
    return this.p2sh_tx_calc_byte(this.inputs.length, output);
}

TxBuilder.prototype.calcFees = function(){
    return util.tx_calc_fee(this.calcByte(), this.feesize);
}

TxBuilder.prototype.unsignedBuild = function(){
    var network = this.network;
    var fees = this.calcFees();
    if(this.total_input_value - fees <= 0){
        throw new Error('insufficient balance [input - fee <= 0]');
    }
    var change_value = this.total_input_value - this.total_output_value - fees;
    if(change_value < 0){
        throw new Error('insufficient balance [change < 0]');
    }
    var input_details = [];
    var change_details = [];

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

    if(change_value > 0){
        var change_address = bitcoin.address.toOutputScript(this.change.address, network)
        change_details.push(this.change);
        txb.addOutput(change_address, change_value);
    }

    var rawtx = txb.buildIncomplete().toHex();
    return {
        result : {
            rawtx : rawtx,
            inputs : input_details,
            changes : change_details,
            iscomplete : false,
        },
        debug : {
            change_address : this.change.address,
            input : this.total_input_value,
            output : this.total_output_value,
            change : change_value,
            miner : fees,
            spb : this.feesize,
        }
    }
}



