// interval: {inf:a, sup:b} or null
// range: list of intervals

function printRange(range) {
	var str = "";
	for (var i = 0; i < range.length; i++)
		str += "[" + range[i].inf + ", " + range[i].sup + "] ";
	return str;
}

// range U range
function unionRange(r1, r2) {
	var range = [];
	var bound = ["inf", "sup"];
	var n1 = 0, n2 = 0;
	var i1 = 0, i2 = 0;
	var myInf, mySup;
	while (i1 < r1.length && i2 < r2.length) {
		var t1 = r1[i1][bound[n1]];
		var t2 = r2[i2][bound[n2]];
		if (t1 <= t2) {
			mySup = t1;
			i1 += n1;
			n1 = 1 - n1;
		}
		if (t1 >= t2) {
			mySup = t2;
			i2 += n2;
			n2 = 1 - n2;
		}
		if (myInf === undefined)
			myInf = mySup;
		if (n1 + n2 == 0) {
			range.push({inf:myInf, sup:mySup});
			myInf = undefined;
		}
	}
	if (i1 == r1.length && n2 == 1) range.push({inf:myInf, sup:r2[i2++][bound[n2]]});
	if (i2 == r2.length && n1 == 1) range.push({inf:myInf, sup:r1[i1++][bound[n1]]});
	for (var i = i1; i < r1.length; i++)
		range.push(r1[i]);
	for (var i = i2; i < r2.length; i++)
		range.push(r2[i]);
	return range;
}

// range - interval
function complementInterval(univ, intvl, start) {
	if (intvl === null) return univ;
	if (start === undefined) start = 0;
	var range = [];
	var i;
	for (i = start; i < univ.length; i++) {
		if (withinInterval(intvl.inf, univ[i]))
			range.push({inf:univ[i].inf, sup:intvl.inf});
		if (withinInterval(intvl.sup, univ[i])) {
			range.push({inf:intvl.sup, sup:univ[i].sup});
			break;
		}
		if (univ[i].sup < intvl.inf)
			range.push(univ[i]);
		if (univ[i].inf > intvl.sup) {
			range.push(univ[i]);
			if (i > 0) i--;
			break;
		}
	}
	range.start = i;
	return range;
}

// function complementRange(univ, range) {
// 	var compl = [];
// 	var i = 0;
// 	var j = 0;
// 	while (i != univ.length) {
// 		if (j == range.length) {
// 			compl.push(univ[i++]);
// 			continue;
// 		}
// 		var incr = 0;
// 		if (withinInterval(range[j].inf, univ[i]))
// 			compl.push({inf:univ[i].inf, sup:range[j].inf});
// 		if (withinInterval(range[j].sup, univ[i])) {
// 			compl.push({inf:range[j].sup, sup:univ[i].sup});
// 			incr = 1;
// 		}
// 		if (univ[i].sup < range[j].inf) {
// 			compl.push(univ[i]);
// 			incr = 1;
// 		}
// 		if (univ[i].inf > range[j].sup)
// 			compl.push(univ[i]);
// 		i += incr;
// 		j++;
// 	}
// 	for (var i = 0; i < compl.length; i++) console.log(compl[i]);
// 	return compl;
// }

function complementRange(univ, range) {
	var start = 0;
	for (var i = 0; i < range.length; i++) {
		univ = complementInterval(univ, range[i], start);
		start = univ.start;
	}
	return univ;
}


// range ^ range
function intersectionRange(r1, r2) {
	var range = [];
	for (var i = 0; i < r1.length; i++) {
		for (var j = 0; j < r2.length; j++) {
			var intxn = intersectionInterval(r1[i], r2[j]);
			if (intxn !== null) range.push(intxn);
		}
	}
	return range;
}

// Note: single point included as [x, x]
function intersectionInterval(i1, i2) {
	if (i1 === null || i2 === null) return null;
	var inf = Math.max(i1.inf, i2.inf);
	var sup = Math.min(i1.sup, i2.sup);
	if (inf > sup) return null;
	else return {inf:inf, sup:sup};
}

function withinRange(x, range) {
	for (var i = 0; i < range.length; i++)
		if (withinInterval(x, range[i])) return true;
	return false;
}

function withinInterval(x, intvl) {
	if (intvl === null) return false;
	return (intvl.inf-x)*(intvl.sup-x) <= 0;
}

function pickFromRange(range) {
	if (range.length != 0) {
		var index = Math.floor(Math.random()*range.length);
		return range[index].inf+(range[index].sup-range[index].inf)*Math.random();
		// return range[index].sup+(range[index].inf-range[index].sup)*Math.random();
	}
}


