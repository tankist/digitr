var sys = require('util');
var http = require('http');
var io = require('socket.io');

var ELEMENTS_PER_ROW = 9, ROWS_COUNT = 3, INITIAL_DIGITS_COUNT = ELEMENTS_PER_ROW * ROWS_COUNT;

var digitr = require('./lib/digitr');

server = http.createServer(function(req, res){
    res.finish();
});

server.listen(7979);

var socket = io.listen(server);

socket.on('connection', function(client){
    var digits = digitr.initDigitr()
		score = 0;
	
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
				if (!selectedElements || 
					selectedElements.length != 2 ||
					!Array.prototype.isDigitrs.apply(digits, selectedElements)) {
					clientInstance.send(JSON.stringify({
						method : 'error',
						data : {
							digits : digits
						}
					}));
				}
				else {
					var range = Math.abs(selectedElements[0] - selectedElements[1]),
						rowsRange = Math.floor(range / ELEMENTS_PER_ROW);
					if (rowsRange == 0) {
						rowsRange = range;
					}
					
					score += (digits[selectedElements[0]] + digits[selectedElements[1]]) * rowsRange;
					for (var i=0;i<selectedElements.length;i++) {
						digits[selectedElements[i]] = -1;
					}
					
					clientInstance.send(JSON.stringify({
						method : 'afterCollapse',
						data : {
							selectedElements : selectedElements,
							score : score
						}
					}));
				}
			},
			update : function() {
				digits.updateDigitr();
				score += 0.5 * (digits.emptyRows - 1) * score;
				clientInstance.send(JSON.stringify({
					method : 'update',
					data : {
						score : score
					}
				}));
			}
		};
	}());
	
	digitrInstance.setClient(client);
    
    client.send(JSON.stringify({
        method : 'init',
        data : {
            digits : digits,
			score : score
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