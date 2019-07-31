var Block = require("./Block.model")

class Blockchain {
    constructor() {
        this.genesisBlock = new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
        this.blockchain = [this.genesisBlock];
    }

    get latestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }
}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new Blockchain();
        }
    }
  
    getInstance() {
        return Singleton.instance;
    }
  
  }
  
  module.exports = Singleton;