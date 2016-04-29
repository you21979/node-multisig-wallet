#!/usr/bin/env node
var bitcoin = require('bitcoinjs-lib');

var param = {
    network : bitcoin.networks.bitcoin,
}

var bip32PathDerive = function(extendedkey, path){
    return path.split('/').
        filter(function(v){ return v !== 'm' }).
        reduce(function(r, v){
            var isDash = (v[v.length - 1] === "'");
            var m = parseInt(v.replace("'",''));
            if( isDash ){
                return r.deriveHardened(m);
            } else {
                return r.derive(m);
            }
        }, extendedkey)
}

var derivePath = function(masterprv, path){
    var hdnode = bitcoin.HDNode.fromBase58(masterprv, param.network);
    return bip32PathDerive(hdnode, path);
}

var main = function(argv){
    if(argv.length != 2){
        console.log("hdpath xprv");
        process.exit(0)
    }
    var hdpath = argv[0]
    var masterprv = argv[1]
    var xprv = derivePath(masterprv, hdpath);
    var xpub = xprv.neutered();
    console.log(xpub.toString());
}

main(process.argv.slice(2))
