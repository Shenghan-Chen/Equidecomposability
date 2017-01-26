// transformation between arbitrary triangle and equal-area rectangle with a given width is accomplished by:
// cut rec into 4 (hinged) pieces to form tri'
// cut tri' in half (repeatedly where necessary) along median, rotate around midpoint to form tri
// this class calculates the mininum repetition of the latter cut and identifies the corresponding order of ABC


// return {order:indicating order of A B C, offset:# of vCB that A moves}
function wInTri(tri, w) {
	var nList = [];
	var total = 3;
	var fail = failRange(tri);
	for (var i = 0; i < fail.length; i++) {
		if (w > fail[i].inf && w < fail[i].sup)
			total -= 1;
	}
	var minIndex = 0;
	for (var i = 0; i < total; i++) {
		var s2 = getSqrSide(tri, i);
		var halfH = Math.sqrt(sqrArea(tri)/s2);
		var del = w*w - sqrArea(tri)/s2;
		// numerical precision handling
		if (Math.abs(del) < 0.1 && halfH != w) {
			console.log(i+"-th h/2="+halfH+" w="+w+" del="+del);
			if (halfH != w) console.log("WANRNING: halfH != w\nk = "+getK(tri, 2*i));// debugging
		}

		if (w == halfH)
			var x = 0;
		else if (w < halfH) {
			minIndex += 2;
			continue;// ABC,ACB taller than BAC,BCA
		}
		else
			var x = Math.sqrt(del/s2)*2;
		nList.push(kDist(getK(tri, 2 * i), x));
		nList.push(kDist(getK(tri, 2*i+1), x));
	}
	// if (nList.length == 0) {console.log("failed w="+w);triInfo(tri);return null;}
	minIndex += indexAbsMin(nList);
	return {order:minIndex, offset:nList[indexAbsMin(nList)]};
}

// return achievable range for offset n (all 6 orders)
function totalRange(tri, n) {
	var fail = failRange(tri);// oriented here
	var range = [];
	for (var j = 0; j < 3; j++) {
		var r1 = getRange(tri, 2 * j, n);
		var r2 = getRange(tri, 2*j+1, n);
		var cmbn = unionRange(r1, r2);
		if (2-j < fail.length)
			cmbn = complementInterval(cmbn, fail[2-j]);
		range = unionRange(cmbn, range);
	}
	return range;
}

// [h/2, infinity) - [fail] on each side 
function possibleRange(tri) {
	var fail = failRange(tri);
	var range = [];
	for (var j = 0; j < 3; j++) {
		var halfH = Math.sqrt(sqrArea(tri)/getSqrSide(tri, j));
		var possible = [{inf:halfH, sup:Infinity}];
		if (2-j < fail.length)
			possible = complementInterval(possible, fail[2-j]);
		range = unionRange(possible, range);
	}
	return range;
}

// return achievable range for specified order and offset
function getRange(tri, index, n) {
	var k = getK(tri, index) + n;
	if (k < -1) return [];
	tri = orientTri(tri, index);
	var aSqr = getSqrSide(tri, 0);
	var bSqr = getSqrSide(tri, 1);
	var cSqr = getSqrSide(tri, 2);

	var l = Math.sqrt(aSqr*(k+1)*(k+1)/4+sqrArea(tri)/aSqr);
	if (k < 0) k = 0;
	var s = Math.sqrt(aSqr*k*k/4+sqrArea(tri)/aSqr);

	// TODO: validate this
	//// s = Math.sqrt(bSqr)/2;
	//// l = Math.sqrt(aSqr/2+bSqr/2-cSqr/4);
	return [{inf:s, sup:l}];
}

// on each side there might be a range in which an obtuse angle is formed
// return list of {inf, sup} if any
// Note: returned list is in reverse order, s.t. indices correspond to c, b, a (longer sides fail more)
function failRange(tri) {
	if (!('fail' in tri)) {
		orientTri(tri);
		var range = [];
		for (var i = 2; i >= 0; i--) {
			var s2 = getSqrSide(tri, i);
	    	if ((s2/4-getArea(tri)) <= 0) break;// larger for longer side
	    	var l = Math.sqrt(s2/4+getArea(tri));
	    	var s = Math.sqrt(s2/4-getArea(tri));
	    	range.push({inf:(l-s)/2, sup:(l+s)/2});
	    }
	    tri.fail = range;
	}
	return tri.fail;
}
