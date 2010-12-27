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
		
		var digits = digitr.initDigitr();
		var digitrInstance = digitr.digitrFactory();
		digitrInstance.setClient(client);
		client.digits = digits;

		client.send(JSON.stringify({
			method : 'init',
			data : {
				digits : digits,
				score : digitrInstance.getScore()
			}
		}));

		client.on('message', function(data) {
			var methodData = JSON.parse(data) || {};
			if (!!methodData.method && digitrInstance[methodData.method]) {
				digitrInstance[methodData.method](methodData.data);
			}
			console.log('Current score is: ' + digitrInstance.getScore());
		});
		client.on('disconnect', function() {
			
		});
	});
})();


