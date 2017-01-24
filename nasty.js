// transformation between arbitrary triangle and equal-area rectangle with a given width is accomplished by:
// cut rec into 4 (hinged) pieces to form tri'
// cut tri' in half (repeatedly where necessary) along median, rotate around midpoint to form tri
// this class calculates the mininum repetition of the latter cut and identifies the corresponding order of ABC


// return {order:indicating order of A B C, offset:# of vCB that A moves}
function wInTri(tri, w) {
	var nList = [];
	var total = 3;
	var fail = failRange(tri);

	// for (var i = 0; i < 6; i++) console.log(printRange(getRange(tri, i, 0)));

	for (var i = 0; i < fail.length; i++) {
		if (w > fail[i].inf && w < fail[i].sup)
			total -= 1;
	}
	var minIndex = 0;
	for (var i = 0; i < total; i++) {
		var s2 = getSqrSide(tri, i);
		if (w < Math.sqrt(sqrArea(tri)/s2)) {
			var del = w*w - sqrArea(tri)/s2;
			console.log(i+"-th h/2="+Math.sqrt(sqrArea(tri)/s2)+" w="+w+" del="+del);
			// console.log("area="+Math.sqrt(sqrArea(tri))+" s="+Math.sqrt(s2));
			minIndex += 2;
			continue; //ABC,ACB taller than BAC,BCA
		}
		var x = Math.sqrt((w*w - sqrArea(tri)/s2)/s2)*2;
		nList.push(kDist(getK(tri, 2 * i), x));
		nList.push(kDist(getK(tri, 2*i+1), x));
	}
	if (nList.length == 0) {console.log("failed w="+w);triInfo(tri);return null;}
	minIndex += indexAbsMin(nList);
	// console.log("order="+minIndex);
	// if (!withinRange(w, getRange(tri, minIndex, nList[indexAbsMin(nList)]))) console.log("out of luck");
	return {order:minIndex, offset:nList[indexAbsMin(nList)]};
}

// TODO: improve with S/w
function findRange(tri1, tri2) {
	var nSum = 0;
	while (true) {
		var pairs = absSumPairs(nSum);
		for (var i = 0; i < pairs.length; i++) {
			var common = commonRange(tri1, pairs[i].n1, tri2, pairs[i].n2);
			if (common.length > 0) {
				console.log("n1="+pairs[i].n1+" n2="+pairs[i].n2);////
				return pickFromRange(common);//// return n?
			}
		}
		nSum++;
		//// TODO: calculate distance?
	}
}

// return overlap of achievable ranges for offset n1 and n2
function commonRange(tri1, n1, tri2, n2) {
	return intersectionRange(totalRange(tri1, n1), totalRange(tri2, n2)); 
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

function possibleRange(tri) {
	var fail = failRange(tri);// oriented here
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
// TODO: validate this
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

	// s = Math.sqrt(bSqr)/2;
	// l = Math.sqrt(aSqr/2+bSqr/2-cSqr/4);
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

// print out details of tri for debugging
function triInfo(tri, label) {
	console.log("triangle");
	if (label !== undefined) console.log(label);
	console.log(tri[0]);
	console.log(tri[1]);
	console.log(tri[2]);
	var area = getArea(tri);
	console.log("area:" + area);
	console.log("sides:");
	for (var i = 0; i < 3; i++) {
		var s = Math.sqrt(getSqrSide(tri, i));
		console.log(s+" h/2="+area/s);
	}
	console.log("ranges: ");
	for (var i = 0; i < 6; i++)
		console.log(printRange(getRange(tri, i, 0)));
	console.log("fail ranges: "+printRange(failRange(tri)));
	console.log("total ranges: ");
	for (var i = -10; i < 10; i++)
		console.log(i+" "+printRange(totalRange(tri, i)));
}
