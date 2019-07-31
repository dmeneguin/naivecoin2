var WebSocket = require("ws");
var P2PServer_model = require('../models/P2PServer.model');
var Blockchain_model = require("../models/Blockchain.model");
var blockchain = new Blockchain_model().getInstance();
var p2pserver;
var sockets;

var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

exports.initP2PServer = function (p2p_port) {
    p2pserver = new P2PServer_model(p2p_port);
    var server = p2pserver.server;
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);
};   

exports.getP2PServer = function () {
    return p2pserver;
};
exports.getSockets = function () {
    return sockets;
};

var initConnection = function (ws) {
    sockets = p2pserver.sockets;
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = function (ws) {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

exports.connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

exports.broadcastLastBlock = () => {
    broadcast(responseLatestMsg());
};

var handleBlockchainResponse = function (message) {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = blockchain.latestBlock;
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            blockchain.blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};
var responseLatestMsg = function () {return {'type': MessageType.RESPONSE_BLOCKCHAIN,'data': JSON.stringify([blockchain.latestBlock])}};
var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
var responseChainMsg = () =>({'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain.blockchain)});
var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));