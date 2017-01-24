
// wrapper for arbitary tri; aka matchTargetTri?
// transform 'gen' (tri generated from rec) to 'tgt' (target tri)
// 'inv' indicates whether to send pieces from intermediate rec to first target tri
function cutRec2Tri(cuts, rec, tri, n, inv) {

	var vCB = vec3.create();
	vec3.sub(vCB, tri[1], tri[2]);
	vec3.scaleAndAdd(tri[0], tri[0], vCB, n);// tri: tgt->gen

	// (inv=f/t) poly.move: rec->gen1 / tgt1->gen2
	rec2tri(cuts, rec, tri, inv);

	if (n == 0) return cuts;
	if (n > 0) {
		vec3.scale(vCB, vCB, -1);
		tri = [tri[0], tri[2], tri[1]];// swap B, C
	}
	else n = -n;

	// cuts moved to dest (gen1/gen2)
	for (var i = 0; i < cuts.length; i++)
		movePiece(cuts[i]);

	for (var i = 0; i < n; i++) {
		cutTriHalf(cuts, tri);
		vec3.add(tri[0], tri[0], vCB);// A += vCB
	}

	// cuts brought back to origin (rec/ori1)
	for (var i = 0; i < cuts.length; i++) {
		var inverse = mat4.create();
		mat4.invert(inverse, cuts[i].move);
		movePiece(cuts[i], inverse);
	}

	return cuts;////
}

// cut ABC in half from C, rotate AMC around M
// (assume cuts at dest. pos. of poly.move)
function cutTriHalf(cuts, tri) {
	var M = vec3.create();
	vec3.add(M, tri[0], tri[1]);
	vec3.scale(M, M, 0.5);
	var AMC = lineCutSameSide(cuts, tri[2], M, [], tri[0]);
	var AMCt = ctrSymm2D(M);
	for (var i = 0; i < AMC.length; i++) {
		var poly = AMC[i];
		movePiece(poly, AMCt);
		mat4.mul(poly.move, AMCt, poly.move);
	}
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

	cutRec2Tri(cuts, directed[0], tri1, o1.offset, false);
	cutRec2Tri(cuts, directed[1], tri2, o2.offset, true);
	console.log("total # pieces: "+cuts.length);
	// for (var i = 0; i < cuts.length; i++) console.log("move: "+cuts[i].move[12]+" "+cuts[i].move[13]);
	return cuts;
}
