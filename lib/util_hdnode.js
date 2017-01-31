'use strict'
var assert = require('assert');
var bitcoin = require('bitcoinjs-lib');

var seedToMasterNode = exports.seedToMasterNode = function(seed, network){
    return bitcoin.HDNode.fromSeedBuffer(seed, network)
}

var splitPublicNode = exports.splitPublicNode = function(masterNode, split_hdpath){
    return masterNode.derivePath(split_hdpath).neutered()
}

