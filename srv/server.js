var sys = require('util');
var http = require('http');
var io = require('socket.io');

var ELEMENTS_PER_ROW = 9, ROWS_COUNT = 3, INITIAL_DIGITS_COUNT = ELEMENTS_PER_ROW * ROWS_COUNT;

var digitr = require('./lib/digitr');

var server = http.createServer(function(req, res){
    res.finish();
});

server.listen(7979);

(function() {
	var socket = io.listen(server);
	
	socket.on('connection', function(client){
		var digitrInstance = digitr.digitrFactory().init().setClient(client);

		client.send(JSON.stringify({
			method : 'init',
			data : {
				digits : digitrInstance.getDigits(),
				score : digitrInstance.getScore()
			}
		}));

		client.on('message', function(data) {
			var methodData = JSON.parse(data) || {};
			if (!!methodData.method && digitrInstance[methodData.method]) {
				digitrInstance[methodData.method](methodData.data);
			}
		});
		client.on('disconnect', function() {
			
		});
	});
})();


