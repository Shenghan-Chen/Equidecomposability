
// TODO: improve with S/w
function findRange(tri1, tri2) {
	var nSum = 0;
	while (true) {
		var pairs = absSumPairs(nSum);
		for (var i = 0; i < pairs.length; i++) {
			var common = commonRange(tri1, pairs[i].n1, tri2, pairs[i].n2);
			if (common.length > 0) {
				console.log("n1="+pairs[i].n1+" n2="+pairs[i].n2);////
				return pickFromRange(common);
			}
		}
		nSum++;
		//// TODO: calculate distance?
	}
}

// return overlap of achievable ranges for 2 tri w/ offset n1 and n2
function commonRange(tri1, n1, tri2, n2) {
	return intersectionRange(totalRange(tri1, n1), totalRange(tri2, n2)); 
}


function clockDirection(tri1, tri2, rec) {
	var rec1, rec2;
	if (triCCW(tri1)) {
		rec1 = rec;//ABCD
		if (triCCW(tri2))
			rec2 = [rec[2], rec[3], rec[0], rec[1]];//CDAB
		else
			rec2 = [rec[3], rec[2], rec[1], rec[0]];//DCBA
	}
	else {
		rec1 = [rec[3], rec[2], rec[1], rec[0]];//DCBA
		if (triCCW(tri2))
			rec2 = rec;//ABCD
		else
			rec2 = [rec[1], rec[0], rec[3], rec[2]];//BADC
	}
	// DCBA = [rec[3], rec[2], rec[1], rec[0]];//cw
	// BADC = [rec[1], rec[0], rec[3], rec[2]];//cw
	// CDAB = [rec[2], rec[3], rec[0], rec[1]];//ccw
	console.log("same clock direction?\n"+(triCCW(tri1)+" "+triCCW(tri2)));
	return [rec1, rec2];
}



function cutTri2Tri(tri1, tri2) {
	var cuts = [];
	var S = getArea(tri2);
	rescaleCtr(tri1, S);

	var w = findRange(tri1, tri2);
	console.log("common width="+w);
	var o1 = wInTri(tri1, w);
	var o2 = wInTri(tri2, w);

	console.log("tri1: n="+o1.offset);
	console.log("tri2: n="+o2.offset);
	tri1 = orientTri(tri1, o1.order);
	tri2 = orientTri(tri2, o2.order);
	var rec = createRec(w, S/w);
	cuts.push(rec); //starting point of cuts
	
	var directed = clockDirection(tri1, tri2, rec);

	cuts = cutRec2Tri(cuts, directed[0], tri1, o1.offset, false);
	console.log(cuts);
	cuts = cutRec2Tri(cuts, directed[1], tri2, o2.offset, true);
	console.log("total # pieces: "+cuts.length);
	// for (var i = 0; i < cuts.length; i++) console.log("move: "+cuts[i].move[12]+" "+cuts[i].move[13]);
	return cuts;
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


//// put here temporarily


// deside whether a point is inside a polygon
function insidePolygon(P, transformed) {
    var ref = crossProduct(transformed[transformed.length-1], transformed[0], P);
    for (var i = 0; i < transformed.length-1; i++) {
        if (vec3.dot(ref, crossProduct(transformed[i], transformed[i+1], P)) <= 0) {
            //// no intersection if P on the line of an edge (when crossProduct==0)
            return false;
        }
    } 
    return true;
}

//// Helper funtion to find the cross product of two vec3's AB and AC
function crossProduct(A, B, C) {
    var ab = vec3.create();
    var ac = vec3.create();
    var crs = vec3.create();
    vec3.subtract(ab, B, A);
    vec3.subtract(ac, C, A);
    vec3.cross(crs, ab, ac);
    return crs;
}
