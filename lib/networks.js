'use strict'
var bitcoin = require('bitcoinjs-lib');

var networks = exports;
Object.keys(bitcoin.networks).forEach(function(key){
    networks[key] = bitcoin.networks[key]
});

networks.monacoin = {
    magicPrefix: '\x19Monacoin Signed Message:\n',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
    },
    pubKeyHash: 0x32,
    scriptHash: 0x05,
    wif: 0xB2,
    dustThreshold: 546, // https://github.com/bitcoin/bitcoin/blob/v0.9.2/src/core.h#L151-L162
};

