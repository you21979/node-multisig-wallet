'use strict'
var bip39 = require('bip39');

var toSeed = exports.toSeed = function(mnemonic, password){
    return bip39.mnemonicToSeed(mnemonic, password);
}

var validate = exports.validate = function(mnemonic){
    return bip39.validateMnemonic(mnemonic);
}
