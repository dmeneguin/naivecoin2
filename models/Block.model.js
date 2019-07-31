var CryptoJS = require("crypto-js");

class Block {
    constructor(index, previousHash, timestamp, data) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    }
}

module.exports = Block;