'use strict'
var bip39 = require('bip39');

var toSeed = exports.toSeed = function(mnemonic, password){
    return bip39.mnemonicToSeed(mnemonic, password);
}

var validate = exports.validate = function(mnemonic){
    return bip39.validateMnemonic(mnemonic);
}

var unmatch = exports.unmatch = function(mnemonic){
    return mnemonic.split(' ').map(function(word, n){
        return {
            n : n,
            word : word,
            check : bip39.wordlists.EN.indexOf(word)
        }
    }).filter(function(data){
        return data.check === -1
    })
}
