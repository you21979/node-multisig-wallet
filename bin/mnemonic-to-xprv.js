#!/usr/bin/env node
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');

var param = {
    ent : 256,
    network : bitcoin.networks.bitcoin,
}

var main = function(argv){
    if(argv.length < 1){
        console.log("need mnemonic");
        process.exit(0);
    }
    var mnemonic = argv[0];
    if(!bip39.validateMnemonic(mnemonic)){
        console.log("invalid mnemonic");
        process.exit(-1);
    }
    var password = argv[1] || undefined; // option
    var masterseed = bip39.mnemonicToSeed(mnemonic, password);
    var hdnode = bitcoin.HDNode.fromSeedBuffer(masterseed, param.network);
    var masterprv = hdnode.toString();
    console.log(masterprv)
}

main(process.argv.slice(2));
