'use strict';
var express = require("express");
var bodyParser = require('body-parser');

var Blockchain_controller = require("./controllers/Blockchain.controller")
var Block_controller = require("./controllers/Block.controller")
var P2PServer_controller = require("./controllers/P2PServer.controller")

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

var blockchain = Blockchain_controller.getBlockchainInstance();

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain.blockchain)));
    app.post('/mineBlock', (req, res) => {
        var newBlock = Block_controller.generateNextBlock(req.body.data);
        Blockchain_controller.addBlock(newBlock);
        P2PServer_controller.broadcastLastBlock();
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(P2PServer_controller.getSockets().map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        P2PServer_controller.connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

P2PServer_controller.connectToPeers(initialPeers);
P2PServer_controller.initP2PServer(p2p_port);
initHttpServer();
