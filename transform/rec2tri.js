
// wrapper for arbitary tri
// transform 'gen' (tri generated from rec) to 'tgt' (target tri)
// 'inv' indicates whether to send pieces from intermediate rec to first target tri
function cutRec2Tri(cuts, rec, tri, n, inv) {
	var vCB = vec3.create();
	vec3.sub(vCB, tri[1], tri[2]);
	vec3.scaleAndAdd(tri[0], tri[0], vCB, n);// tri: tgt->gen

	// (inv=f/t) poly.move: rec->gen1 / tgt1->gen2
	cuts = xyz2abcd(cuts, rec, tri, inv);
	if (n == 0) return cuts;// common case
	if (n > 0) {
		vec3.scale(vCB, vCB, -1);
		tri = [tri[0], tri[2], tri[1]];// swap B, C
	}
	else n = -n;

	// cuts moved to dest (gen1/gen2)
	for (var i = 0; i < cuts.length; i++)
		movePiece(cuts[i]);

	for (var i = 0; i < n; i++) {
		cuts = cutTriHalf(cuts, tri);
		vec3.add(tri[0], tri[0], vCB);// A += vCB
	}

	// cuts brought back to origin (rec/ori1)
	for (var i = 0; i < cuts.length; i++) {
		var inverse = mat4.create();
		mat4.invert(inverse, cuts[i].move);
		movePiece(cuts[i], inverse);
	}
	return cuts;
}

// cut ABC in half from C, rotate AMC around M
// (assume cuts at dest. pos. of poly.move)
function cutTriHalf(cuts, tri) {
	var M = vec3.create();
	vec3.add(M, tri[0], tri[1]);
	vec3.scale(M, M, 0.5);
	var AMC = lineCutSameSide(cuts, tri[2], M, tri[0]);
	var AMCt = ctrSymm2D(M);
	for (var i = 0; i < AMC.length; i++) {
		var poly = AMC[i];
		movePiece(poly, AMCt);
		mat4.mul(poly.move, AMCt, poly.move);
	}
	return cuts;
}
