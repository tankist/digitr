var INITIAL_DIGITS_COUNT = 27;

Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

function render(digits) {
	var ul = '';
	for(var i=0;i<digits.length;i++) {
		ul += '<li><span>' + digits[i] + '</span></li>';
	}
	$('#digits').append(ul);
}

function initDigits(start) {
	start = (!start || start < 11)?Math.randomRange(11, 99):start;
	var digits = [];
	while (digits.length < INITIAL_DIGITS_COUNT) {
		var d = (start % 10 == 0)? start / 10 : start;
		digits = digits.concat(d.toString().split(''));
		start++;
	}
	return digits;
}

function updateDigits(digits) {
	digits = digits || [];
	
}

$(function() {
	var digits = initDigits();
	render(digits);
});