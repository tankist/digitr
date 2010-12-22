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
	
	var digitrInstance = (function() {
		
		var clientInstance;
    
		return {
			init : function(data) {
				
			},
			setClient : function(c) {
				clientInstance = c;
			},
			getClient : function() {
				return clientInstance;
			},
			error : function(e, data) {
				
			},
			collapse : function(selectedElements) {
				if (!Array.prototype.isDigitrs.apply(digits, selectedElements)) {
					clientInstance.send(JSON.stringify({
						method : 'error',
						data : {
							digits : digits
						}
					}));
				}
				else {
					for (var i=0;i<selectedElements.length;i++) {
						digits[selectedElements[i]] = -1;
					}
					clientInstance.send(JSON.stringify({
						method : 'afterCollapse',
						data : {
							selectedElements : selectedElements
						}
					}));
				}
			},
			update : function() {
				digits.updateDigitr();
			}
		};
	}());
	
	digitrInstance.setClient(client);
    
    client.send(JSON.stringify({
        method : 'init',
        data : {
            digits : digits
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