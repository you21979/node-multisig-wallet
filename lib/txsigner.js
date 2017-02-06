'use strict'
var bitcoin = require('bitcoinjs-lib');
var bip39 = require('bip39');
var Promise = require('bluebird');
var assert = require('assert')
var task = require('promise-util-task');
var sleep = require('@you21979/promise-sleep')
var TxDecorder = require('./txdecoder');

var TxSigner = module.exports = function(split_path, rawtx, inputs, network){
    this.split_path = split_path;
    this.tx = bitcoin.Transaction.fromHex(rawtx);
    this.inputs = inputs;
    this.network = network;
}

TxSigner.prototype.decode = function(){
    return (new TxDecorder(this.tx, this.network)).decode()
}

TxSigner.prototype.signFromMasterKey = function(masterseed, progress){
    assert(typeof masterseed === 'string', 'must be parameter is string [masterseed]')
    if(progress === void 0){
        progress = function(idx, max, sign){}
    }else{
        assert(typeof progress === 'function', 'must be parameter is function [progress]')
    }

    var outputs = [];
    var isComplete = true;
    var input_max = this.inputs.length;
    var txb = bitcoin.TransactionBuilder.fromTransaction(this.tx, this.network);
    return task.seq(prepareInput(this.inputs, makeDerivePromise(masterseed, this.split_path, this.network)).map(function(f){
        return function(){
            return f().then(function(sign){
                progress(sign.idx + 1, input_max, sign);
                if(!sign.isComparePubkey){
                    throw new Error('invalid redeem script or mnemonic! [' + (sign.idx + 1) + ' / '+ input_max +']');
                }
                if(isComplete && !sign.isComplete){
                    isComplete = false;
                }
                txb.sign(sign.idx, sign.privKey, sign.redeemScript);
                outputs.push({
                    redeem_script : sign.redeemScript.toString('hex'),
                    hdpath : sign.input.hdpath,
                    signatures : sign.signatures,
                });
                return sleep(0)
            })
        }
    })).then(function(){
        return {
            rawtx : buildRawTx(txb, isComplete).toHex(),
            inputs : outputs,
            iscomplete : isComplete,
        }
    })
}

TxSigner.prototype.signFromMnemonic = function(mnemonic, password, progress){
    assert(typeof mnemonic === 'string', "must be paramter is string [mnemonic]");
    return this.signFromMasterKey(bip39.mnemonicToSeedHex(mnemonic, password), progress)
}

var comparePubkey = function(redeemScript, pubKey){
    for(var i = 1; i < redeemScript.length - 2; ++i) {
        if(redeemScript[i].toString('hex') == pubKey.toString('hex')) {
            return true;
        }
    }
    return false;
}

var prepareInput = function( inputs, path_deriver ){
    return inputs.map(function(input, n){
        return function(){
            return path_deriver(input.hdpath).then(function(childKey){
                var redeemScriptBuffer = new Buffer(input.redeem_script, 'hex');
                var redeemScript = bitcoin.script.decompile(redeemScriptBuffer);
                var needSignatures = redeemScript[0] - bitcoin.opcodes.OP_RESERVED; // OP_M
                var signatures = (input.signatures ? input.signatures : 0) + 1;
                return {
                    signatures : signatures,
                    isComplete : signatures >= needSignatures ? true : false,
                    isComparePubkey : comparePubkey(redeemScript, childKey.keyPair.getPublicKeyBuffer()),
                    idx : n,
                    privKey : childKey.keyPair,
                    redeemScript : redeemScriptBuffer,
                    input : input,
                };
            })
        }
    })
}

var makeDerivePromise = function( seed, split_path, network ){
    var m = bitcoin.HDNode.fromSeedHex(seed, network).derivePath(split_path);
    return function(path) {
        return new Promise(function(resolve, reject){
            try{
                resolve(m.derivePath(path));
            }catch(e){
                reject(e);
            }
        })
    }
}

var buildRawTx = function(txb, isComplete){
    return isComplete ? txb.build() : txb.buildIncomplete()
}

