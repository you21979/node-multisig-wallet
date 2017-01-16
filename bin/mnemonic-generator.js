#!/usr/bin/env node
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var program = require('commander');

program
  .version('0.0.1')
  .option('-e, --entropy <n>', 'entropy bit', parseFloat, '256')
  .parse(process.argv);

var mnemonic = bip39.generateMnemonic(program.entropy);

console.log(mnemonic)

