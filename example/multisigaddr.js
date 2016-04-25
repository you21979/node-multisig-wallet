'use strict'
var multisigWallet = require("..");
var fs = require("fs");

var getopt = function(prog, argv){
    if(argv.length < 2) {
        console.log(['usage:', 'node', prog.split('/').pop(), 'BIP32_PATH', 'CONFIG_FILE'].join(' '));
        process.exit(0);
    }
    var pathStr = argv[0];
    var config = JSON.parse(fs.readFileSync(argv[1], 'utf8'));
    var network = multisigWallet.networks[config.network];
    if(config.neededSignatures <= 0) {
        throw new Error('invalid NEEDED_SIGNATURES!');
    }

    return {
        network : network,
        pathStr : pathStr,
        neededSignatures : config.neededSignatures,
        masterPubkeys : config.masterPubkeys,
    }
}

var main = function(opt){
    var hdwallet = new multisigWallet.HDWallet(opt.masterPubkeys, opt.neededSignatures);
    var wallet = hdwallet.makeWallet(opt.pathStr.split('/'));
    console.log(wallet.generateAddress(opt.network))
}

main(getopt(process.argv[1], process.argv.slice(2)))
