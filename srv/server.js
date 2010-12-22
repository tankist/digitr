var sys = require('util');
var http = require('http');
var io = require('socket.io');

require('./lib/digitr');

server = http.createServer(function(req, res){
    res.finish();
});

server.listen(7979);

var socket = io.listen(server);

socket.on('connection', function(client){
  client.on('message', function(){
      
  });
  client.on('disconnect', function(){
      
  });
});