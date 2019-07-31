var Block_controller = require("../controllers/Block.controller");
var Blockchain_model = require("../models/Blockchain.model");
var blockchain = new Blockchain_model().getInstance();

exports.getBlockchainInstance = () =>{
    return blockchain;
};

exports.addBlock = function (newBlock) {
    if (Block_controller.isValidNewBlock(newBlock, blockchain.latestBlock)) {
        blockchain.blockchain.push(newBlock);
    }
};

exports.replaceChain = function (newBlocks) {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain.blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

exports.isValidChain = function (blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(blockchain.genesisBlock)) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};
