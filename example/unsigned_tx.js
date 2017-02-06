'use strict'
var program = require('commander');
var utilFee = require('bitcoin-util-fee');
var multisigWallet = require("..");
var fs = require("fs");

program
  .version('0.0.1')
  .option('-c, --config <filename>', 'config file')
  .option('-i, --txid <id>', 'txid')
  .option('-o, --vout <vout>', 'vout')
  .option('-v, --value <value>', 'tx value')
  .option('-p, --path <path>', 'hdpath')
  .option('-x, --change <hdpath>', 'change hdpath')
  .parse(process.argv);

var getopt = function(program){
    var config = JSON.parse(fs.readFileSync(program.config, 'utf8'));
    var network = multisigWallet.networks[config.network];
    if(config.neededSignatures <= 0) {
        throw new Error('invalid needsignatures');
    }
    return {
        txid : program.txid,
        vout : parseInt(program.vout),
        value : parseInt(program.value),
        hdpath : program.path,
        change : program.change,
        network : network,
        feesize : 100,
        neededSignatures : config.neededSignatures,
        masterPubkeys : config.masterPubkeys,
    }
}

var main = function(opt){
    var hdw = new multisigWallet.HDWallet(opt.masterPubkeys, opt.neededSignatures)
    var txb = hdw.makeUnsignedTx(opt.change, opt.feesize, opt.network);
    txb.addInput(opt.txid, opt.vout, opt.value, opt.hdpath);
    var result = txb.unsignedBuild();
    console.log(result)
}

main(getopt(program))
