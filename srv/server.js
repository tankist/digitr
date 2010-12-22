var sys = require('util');
var http = require('http');
var io = require('socket.io');

var digitr = require('./lib/digitr');

server = http.createServer(function(req, res){
    res.finish();
});

server.listen(7979);

var socket = io.listen(server);

socket.on('connection', function(client){
    var digits = digitr.initDigitr();
    
    client.send(JSON.stringify({
        method : 'init',
        data : {
            digits : digits
        }
    }));
    
    client.on('message', function(data) {
        
    });
    client.on('disconnect', function() {
        
    });
});