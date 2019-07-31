var WebSocket = require("ws");

class P2PServer {
    constructor(p2p_port) {
        this.server = new WebSocket.Server({port: p2p_port});
        this.sockets = [];
    } 
}

module.exports = P2PServer;