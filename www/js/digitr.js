var ELEMENTS_PER_ROW = 9, ROWS_COUNT = 3, INITIAL_DIGITS_COUNT = ELEMENTS_PER_ROW * ROWS_COUNT;

Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

Array.prototype.indexOf = Array.prototype.indexOf || function(element) {
	for (var i=0;i<this.length;i++) {
		if (this[i] == element) return i;
	}
	return -1;
};

Array.prototype.map = Array.prototype.map || function(cb) {
	for (var i=0;i<this.length;i++) {
		this[i] = cb(this[i]);
	}
	return this;
};

Array.prototype.filter = Array.prototype.filter || function(cb) {
	cb = (cb && typeof cb === 'function') ? cb : function(element) {
		return (!!element);
	};
	var newArray = [];
	for (var i=0;i<this.length;i++) {
		if (cb(this[i])) newArray.push(this[i]);
	}
	return newArray;
};

Array.prototype.renderDigitr = function() {
	var ul = '';
	for(var i=0;i<this.length;i++) {
		ul += '<li' + ((this[i] < 0)?' class="empty"':'') + ' unselectable="on"><span>' + ((this[i] < 0)?'&nbsp;':this[i]) + '</span></li>';
	}
	$('#digits').html(ul);
	return this;
};

Array.prototype.updateDigitr = function() {
	var _filter = function(element) {
		return (element >= 0);
	};
	var rowsCount = Math.ceil(this.length / ELEMENTS_PER_ROW);
	for (var i=rowsCount - 1;i>=0;i--) {
		var _rowStart = i * ELEMENTS_PER_ROW;
		if (this.slice(_rowStart, _rowStart + ELEMENTS_PER_ROW - 1).filter(_filter).length == 0) {
			this.splice(_rowStart, ELEMENTS_PER_ROW);
		}
	}
	Array.prototype.splice.apply(this, [this.length, 0].concat(this.filter(_filter)));
	return this;
};

Array.prototype.isDigitrs = function(pos1, pos2) {
	var d1 = this[pos1], d2 = this[pos2],
		row1 = Math.floor(pos1 / ELEMENTS_PER_ROW), row2 = Math.floor(pos2 / ELEMENTS_PER_ROW),
		col1 = pos1 % ELEMENTS_PER_ROW, col2 = pos2 % ELEMENTS_PER_ROW;
	//Same element
	if (pos1 === pos2) return false;
	//Not in one column/row
	if (row1 != row2 && col1 != col2) return false;
	//Not the same digits or sum not equal to 10
	if (d1 != d2 && d1+d2 != 10) return false;
	//Not neighboors
	if (col1 == col2) {
		for (var i=Math.min(row1, row2)+1;i<Math.max(row1, row2);i++) {
			if (this[i * ELEMENTS_PER_ROW + col1] >=0) return false;
		}
	}
	if (row1 == row2) {
		for (var i=Math.min(col1, col2)+1;i<Math.max(col1, col2);i++) {
			if (this[row1 * ELEMENTS_PER_ROW + i] >=0) return false;
		}
	}
	return true;
};

function initDigitr(start) {
	start = (!start || start < 11)?Math.randomRange(11, 99):start;
	var digitsStr = '';
	do {
		digitsStr += start.toString();
		digitsStr = digitsStr.replace(/[^1-9]+/, '');
		start++;
	} while (digitsStr.length < INITIAL_DIGITS_COUNT);
	digitsStr = digitsStr.substr(0, INITIAL_DIGITS_COUNT);
	return Array.prototype.map.call(digitsStr, function(element) { return element * 1; });
};

$(function() {
	var digits = initDigitr();
	digits.renderDigitr();
	
	$('a#update').click(function(e) {
		digits.updateDigitr().renderDigitr();
		e.preventDefault();
	});
	
	(function() {
		
		var selectedElements = [];
		$('#digits').delegate('li', 'click', function(e) {
			e.preventDefault();
			var $this = $(this);
			if ($this.hasClass('empty')) return;
			var pos = $this.addClass('selected').index();
			selectedElements.push(pos);
			if (selectedElements.length == 2) {
				if (Array.prototype.isDigitrs.apply(digits, selectedElements)) {
					$('#digits li.selected span').animate({
						opacity : 0
					}, 300, '', function() {
						for (var i=0;i<selectedElements.length;i++) {
							var pos = selectedElements[i];
							digits[pos] = -1;
							$('#digits li:nth-child(' + (pos + 1) + ')').removeClass('selected').addClass('empty').html('&nbsp');
						}
						selectedElements = [];
					});
				}
				else {
					if ($('#digits li.selected').length == 1) {
						selectedElements.pop();
					}
					$this.removeClass('selected');
					selectedElements.pop();
				}
			}
		});
		
	}());
});