'use strict'
var bitcoin = require('bitcoinjs-lib');
var networks = require('./networks');
var bip39 = require('bip39');

var TxSigner = module.exports = function(split_path, rawtx, inputs, network){
    this.split_path = split_path;
    this.tx = bitcoin.Transaction.fromHex(rawtx);
    this.inputs = inputs;
    this.network = network;
}

TxSigner.prototype.decode = function(){
    var result = {
        txid: this.tx.getId(),
        version: this.tx.version,
        locktime: this.tx.locktime,
        vout: [],
    };
    var network = this.network;
    this.tx.outs.forEach(function(out, n){
        var vout = {
            satoshi: out.value,
            value: (1e-8 * out.value).toFixed(8),
            n: n,
            scriptPubKey: {
                asm: bitcoin.script.toASM(out.script),
                hex: out.script.toString("hex"),
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
        result.vout.push(vout);
    })
    return result;
}

var createTasks = function( inputs, hdpath_derive ){
    return inputs.map(function(input, n){
        var redeemScriptBuffer = new Buffer(input.redeem_script, 'hex');
        var redeemScript = bitcoin.script.decompile(redeemScriptBuffer);
        var needSignatures = redeemScript[0] - bitcoin.opcodes.OP_RESERVED; // OP_M
        var signatures = (input.signatures ? input.signatures : 0) + 1;
        var childKey = hdpath_derive(input.hdpath);
        return {
            signatures : signatures,
            isComplete : signatures >= needSignatures ? true : false,
            checkPubkey : checkPubkey(redeemScript, childKey.keyPair.getPublicKeyBuffer()),
            idx : n,
            privKey : childKey.keyPair,
            redeemScript : redeemScriptBuffer,
            input : input,
        }
    })
}

TxSigner.prototype.signFromMasterKey = function(masterseed){
    var txb = bitcoin.TransactionBuilder.fromTransaction(this.tx, this.network);
    var isComplete = true;
    var outputs = [];
    createTasks(this.inputs, createDerive(masterseed, this.split_path, this.network)).forEach(function(task){
        if(!task.checkPubkey){
            throw new Error('E: invalid redeem script or mnemonic!');
        }
        if(isComplete && !task.isComplete){
            isComplete = false;
        }
        txb.sign(task.idx, task.privKey, task.redeemScript);
        outputs.push({
            redeemScript : task.redeemScript,
            hdpath : task.input.hdpath,
            signatures : task.signatures,
        });
    })
    return {
        rawtx : buildRawTx(txb, isComplete).toHex(),
        inputs : outputs,
    }
}

TxSigner.prototype.signFromMnemonic = function(mnemonic, password){
    return this.signFromMasterKey(bip39.mnemonicToSeedHex(mnemonic, password))
}

var checkPubkey = function(redeemScript, pubKey){
    // Checks if redeem public key is contained in redeem script.
    // Exclude OP_M, OP_N and OP_CHECKMULTISIG.
    for(var i = 1; i < redeemScript.length - 2; ++i) {
        if(redeemScript[i].toString('hex') == pubKey.toString('hex')) {
            return true;
        }
    }
    return false;
}

var createDerive = function( seed, split_path, network ){
    var m = bitcoin.HDNode.fromSeedHex(seed, network).derivePath(split_path);
    return function(path) {
        return m.derivePath(path);
    }
}

var buildRawTx = function(txb, isComplete){
    return isComplete ? txb.build() : txb.buildIncomplete()
}

