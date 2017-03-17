'use strict'
var bitcoin = require('bitcoinjs-lib');

var decodeFormat = function(tx){
    var result = {
        txid: tx.getId(),
        version: tx.version,
        locktime: tx.locktime,
    };
    return result;
}

var decodeInput = function(tx){
    var result = [];
    tx.ins.forEach(function(input, n){
        var vin = {
            txid: input.hash.toString('hex'),
            n : input.index,
            script: bitcoin.script.toASM(input.script),
            sequence: input.sequence,
        }
        result.push(vin);
    })
    return result
}

var decodeOutput = function(tx, network){

    var format = function(out, n, network){
        var vout = {
            satoshi: out.value,
            value: (1e-8 * out.value).toFixed(8),
            n: n,
            scriptPubKey: {
                asm: bitcoin.script.toASM(out.script),
                hex: out.script.toString('hex'),
                type: bitcoin.script.classifyOutput(out.script),
                addresses: [],
            },
        };
        switch(vout.scriptPubKey.type){
        case 'pubkeyhash':
        case 'scripthash':
            vout.scriptPubKey.addresses.push(bitcoin.address.fromOutputScript(out.script, network));
            break;
        }
        return vout
    }

    var result = [];
    tx.outs.forEach(function(out, n){
        result.push(format(out, n, network));
    })
    return result
}



var TxDecoder = module.exports = function(rawtx, network){
    this.tx = bitcoin.Transaction.fromHex(rawtx);
    this.network = network;
    this.format = decodeFormat(this.tx);
    this.inputs = decodeInput(this.tx);
    this.outputs = decodeOutput(this.tx, network);
}

TxDecoder.prototype.decode = function(){
    var result = {}
    var self = this;
    Object.keys(self.format).forEach(function(key){
        result[key] = self.format[key]
    })
    result.outputs = self.outputs
    return result;
}

