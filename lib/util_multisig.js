'use strict'
var assert = require('assert');
var bitcoin = require('bitcoinjs-lib');

var mapDerive = function(path){ return function(extendedkey){ return extendedkey.derivePath(path) } }
var sortBuffer = function(){ return function(a, b){ return a.compare(b) } }
var mapFromBase58 = function(){ return function(pubkey){ return bitcoin.HDNode.fromBase58(pubkey) } }
var mapToBuffer = function(){ return function(hdnode){ return hdnode.getPublicKeyBuffer() } }

var masterPubkeyToPubkey = exports.masterPubkeyToPubkey = function(masterPubkeys, path){
    return masterPubkeys.
        map(mapFromBase58()).
        map(mapDerive(path)).
        map(mapToBuffer()).
        sort(sortBuffer())
}

var createRedeemScript = exports.createRedeemScript = function(neededSignatures, pubKeys){
    return bitcoin.script.multisig.output.encode(
        neededSignatures,
        pubKeys
    )
}

var generateAddress = exports.generateAddress = function(redeemScript, network){
    assert(typeof network !== 'string', 'network is not string')
    var scriptHash = bitcoin.crypto.hash160(redeemScript);
    var scriptPubKey = bitcoin.script.scriptHash.output.encode(scriptHash);
    var multisigaddr = bitcoin.address.fromOutputScript(scriptPubKey, network);
    return multisigaddr.toString();
}

