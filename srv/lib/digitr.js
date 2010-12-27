var util = require(process.binding('natives').util ? 'util' : 'sys'),
	io = require('socket.io');

var ELEMENTS_PER_ROW = 9, ROWS_COUNT = 3, INITIAL_DIGITS_COUNT = ELEMENTS_PER_ROW * ROWS_COUNT;

Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

Array.prototype.updateDigitr = function() {
	
	this.emptyRows = 0;
	
	var _filter = function(element) {
		return (element >= 0);
	};
	var rowsCount = Math.ceil(this.length / ELEMENTS_PER_ROW);
	for (var i=rowsCount - 1;i>=0;i--) {
		var _rowStart = i * ELEMENTS_PER_ROW;
		if (this.slice(_rowStart, _rowStart + ELEMENTS_PER_ROW - 1).filter(_filter).length == 0) {
			this.splice(_rowStart, ELEMENTS_PER_ROW);
			this.emptyRows++;
		}
	}
	Array.prototype.splice.apply(this, [this.length, 0].concat(this.filter(_filter)));
	return this;
};

Array.prototype.isDigitrs = function(pos1, pos2) {
	var d1 = this[pos1], d2 = this[pos2],
		row1 = Math.floor(pos1 / ELEMENTS_PER_ROW), row2 = Math.floor(pos2 / ELEMENTS_PER_ROW),
		col1 = pos1 % ELEMENTS_PER_ROW, col2 = pos2 % ELEMENTS_PER_ROW, i;
	//Same element
	if (pos1 === pos2) return false;
	//Not in one column/row
	if (row1 != row2 && col1 != col2) return false;
	//Not the same digits or sum not equal to 10
	if (d1 != d2 && d1+d2 != 10) return false;
	//Not neighboors
	if (col1 == col2) {
		for (i=Math.min(row1, row2)+1;i<Math.max(row1, row2);i++) {
			if (this[i * ELEMENTS_PER_ROW + col1] >=0) return false;
		}
	}
	if (row1 == row2) {
		for (i=Math.min(col1, col2)+1;i<Math.max(col1, col2);i++) {
			if (this[row1 * ELEMENTS_PER_ROW + i] >=0) return false;
		}
	}
	return true;
};

var initDigitr = exports.initDigitr = function(start) {
	start = (!start || start < 11)?Math.randomRange(11, 99):start;
	var digitsStr = '';
	do {
		digitsStr += start.toString();
		digitsStr = digitsStr.replace(/[^1-9]+/, '');
		start++;
	} while (digitsStr.length < INITIAL_DIGITS_COUNT);
	digitsStr = digitsStr.substr(0, INITIAL_DIGITS_COUNT);
	return Array.prototype.map.call(digitsStr, function(element) {return element * 1;});
};

var digitrFactory = exports.digitrFactory = function() {

	var client, score = 0, digits = [];

	return {
		init : function(start) {
			start = (!start || start < 11)?Math.randomRange(11, 99):start;
			var digitsStr = '';
			do {
				digitsStr += start.toString();
				digitsStr = digitsStr.replace(/[^1-9]+/, '');
				start++;
			} while (digitsStr.length < INITIAL_DIGITS_COUNT);
			digitsStr = digitsStr.substr(0, INITIAL_DIGITS_COUNT);
			digits = Array.prototype.map.call(digitsStr, function(element) {return element * 1;});
			return this;
		},
		setClient : function(c) {
			if (digits) {
				c.digits = digits;
			}
			client = c;
			return this;
		},
		getClient : function() {
			return client;
		},
		error : function(e, data) {

		},
		collapse : function(selectedElements) {
			if (!selectedElements || 
				selectedElements.length != 2 ||
				!Array.prototype.isDigitrs.apply(digits, selectedElements)) {
				client.send(JSON.stringify({
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

				client.send(JSON.stringify({
					method : 'afterCollapse',
					data : {
						selectedElements : selectedElements,
						score : score
					}
				}));
			}
			return this;
		},
		update : function() {
			digits.updateDigitr();
			score += 0.5 * (digits.emptyRows - 1) * score;
			client.send(JSON.stringify({
				method : 'update',
				data : {
					score : score
				}
			}));
			return this;
		},
		getScore : function() {
			return score;
		},
		getDigits : function() {
			return digits;
		}
	};
};