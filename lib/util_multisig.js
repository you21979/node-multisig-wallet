'use strict'
var bitcoin = require('bitcoinjs-lib');

var derivePubkey = function(pubkey, path) { return path.reduce(function(r, v){ return r.derive(v) }, pubkey ) }
var sortBuffer = function(){ return function(a, b){ return a.compare(b) } }
var mapDerivePubkey = function(path){ return function(pubkey){ return derivePubkey(pubkey, path) } }
var mapFromBase58 = function(){ return function(pubkey){ return bitcoin.HDNode.fromBase58(pubkey) } }
var mapToBuffer = function(){ return function(hdnode){ return hdnode.getPublicKeyBuffer() } }

var masterPubkeyToPubkey = exports.masterPubkeyToPubkey = function(masterPubkeys, path){
    return masterPubkeys.
        map(mapFromBase58()).
        map(mapDerivePubkey(path)).
        map(mapToBuffer()).sort(sortBuffer())
}

var createRedeemScript = exports.createRedeemScript = function(neededSignatures, pubKeys){
    return bitcoin.script.multisigOutput(
        neededSignatures,
        pubKeys
    )
}

var generateAddress = exports.generateAddress = function(redeemScript, network){
    var scriptHash = bitcoin.crypto.hash160(redeemScript);
    var scriptPubKey = bitcoin.script.scriptHashOutput(scriptHash);
    var multisigaddr = bitcoin.address.fromOutputScript(scriptPubKey, network);
    return multisigaddr.toString();
}

