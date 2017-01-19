///UTILITIES///

// alternatively, generate two polygons to have equal area?
function rescaleCtr(poly, S) {
	var ctr = getCenter(poly);
	var ratio = Math.sqrt(S/getArea(poly));
	for (var i = 0; i < poly.length; i++) {
		var c2v = vec3.create();
		vec3.sub(c2v, poly[i], ctr);
		vec3.scaleAndAdd(poly[i], ctr, c2v, ratio);
	}
	delete poly.area;
	delete poly.triList;
}

function getArea(poly) {
	if (!('area' in poly)) {
		var area = 0;
		if (poly.length == 3)
			area = Math.sqrt(sqrArea(poly));
		else {
			var triList = triangularize(poly);
			for (var i = 0; i < triList.length; i++)
				area += getArea(triList[i]);// recursive
		}
		poly.area = area;
	}
	return poly.area;
}

// Note: only convex polygon for now
function triangularize(poly) {
	if (!('triList' in poly)) {
		var l = poly.length;
		var copy = [];
		for (var i = 0; i < l; i++)
			copy.push(poly[i]);
		var triList = [];
		while (triList.length < l-2) {
			var index = Math.floor(Math.random()*copy.length); //
			var tri = [];
			for (var i = -1; i < 2; i++)
				tri.push(vec3.clone(copy[(index+i+l)%l]));
			triList.push(tri);
			copy.splice(index, 1);
		}
		poly.triList = triList;
	}
	return poly.triList;
}

// return the center of polygon, which is the average of all vertices
function getCenter(poly) {
	if (!('center' in poly)) {
		var ctr = vec3.create();
		for (var i = 0; i < poly.length; i++) {
			vec3.add(ctr, ctr, poly[i]);
		}
		vec3.scale(ctr, ctr, 1/poly.length);
		poly.center = ctr;
	}
	return poly.center;
}

function movePiece(poly, move) {
	if (move === undefined) move = poly.move;
	for (var i = 0; i < poly.length; i++)
		vec3.transformMat4(poly[i], poly[i], move); 
}
