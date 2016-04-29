'use strict'
var utilFee = require('bitcoin-util-fee');
var multisigWallet = require("..");
var fs = require("fs");

var getopt = function(prog, argv){
    if(argv.length < 3) {
        console.log([
            'usage:',
            'node',
            prog.split('/').pop(),
            'CONFIG_FILE',
            'TXID',
            'VOUT',
            'VALUE'
        ].join(' '));
        process.exit(0);
    }
    var config = JSON.parse(fs.readFileSync(argv[0], 'utf8'));
    var txid = argv[1];
    var vout = argv[2]
    var network = multisigWallet.networks[config.network];
    if(config.neededSignatures <= 0) {
        throw new Error('invalid needsignatures');
    }
    return {
        txid : txid,
        vout : vout,
        value : value,
        network : network,
        neededSignatures : config.neededSignatures,
        masterPubkeys : config.masterPubkeys,
    }
}

var main = function(opt){
    var address = "2MzHAs8cCdcXMjQyyZ4K6AzvHMb8SvnaGaT";
    var input_byte = utilFee.p2sh_calc_input_byte(opt.neededSignatures, opt.masterPubkeys.length)
    var txb = new multisigWallet.TXBuilder(address, opt.network);
    txb.add(opt.txid, opt.vout, opt.value, input_byte);
    var rawtx = txb.commit();
    console.log(rawtx)
}

main(getopt(process.argv[1], process.argv.slice(2)))
