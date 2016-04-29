#!/usr/bin/env node
var fs = require('fs');
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');

var param = {
    ent : 256,
    password : undefined,
    network : bitcoin.networks.bitcoin,
}

var bip32PathDerive = function(extendedkey, path){
    return path.split('/').
        filter(function(v){ return v !== 'm' }).
        reduce(function(r, v){
            var isDash = (v[v.length - 1] === "'");
            var m = parseInt(v.replace("'",''));
            if( isDash ){
                return r.deriveHardened(m);
            } else {
                return r.derive(m);
            }
        }, extendedkey)
}

var derivePath = function(masterprv, path){
    return bip32PathDerive(masterprv, path);
}

var main = function(argv){
    if(argv.length != 1){
        console.log("filename");
        process.exit(0)
    }
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
    var hdnodes = config.mnemonics.map(function(mnemonic){
        if(!bip39.validateMnemonic(mnemonic)){
            throw new Error('invalid mnemonic :' + mnemonic);
        }
        return bitcoin.HDNode.fromSeedBuffer(bip39.mnemonicToSeed(mnemonic, param.password), param.network);
    })
    var xpubs = hdnodes.map(function(hdnode){
        var xprv = derivePath(hdnode, config.hdpath);
        var xpub = xprv.neutered();
        return xpub.toString();
    })
    console.log(xpubs)
}


main(process.argv.slice(2))
