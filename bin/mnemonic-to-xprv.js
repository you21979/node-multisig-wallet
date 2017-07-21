#!/usr/bin/env node
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var program = require('commander');

program
  .version('0.0.1')
  .option('-m, --mnemonic <code>', 'mnemonic code')
  .option('-p, --password <password>', 'password', void 0)
  .option('-n, --network <bitcoin>', 'network parameter', 'bitcoin')
  .parse(process.argv);

var mnemonic = bip39.generateMnemonic(program.entropy);

var param = {
    network : bitcoin.networks.bitcoin,
}

var main = function(program){
    var mnemonic = program.mnemonic;
    if(!bip39.validateMnemonic(program.mnemonic)){
        console.log("invalid mnemonic");
        process.exit(-1);
    }
    var password = program.password || undefined; // option
    var network = program.network || "bitcoin";
    var masterseed = bip39.mnemonicToSeed(mnemonic, password);
    var hdnode = bitcoin.HDNode.fromSeedBuffer(masterseed, bitcoin.networks[network]);
    var masterprv = hdnode.toBase58();
    console.log(masterprv)
}

main(program);
