// coincidence in special cases:
// x = k 		M with E
// x = k+1 		M with L
// w = inf/sup 	N with B, L with D
// w = h/2		L with A, N with C, degenerate AEL (no same no cutting no move)


// chain the original transformation of pieces with the move from rec to tri
// if 'inv', move to destination of original transformation (position of tri1, in the context of 2nd call to cutRec2Tri)
// Note: assuming equal area; order: ABCD forms letter 'U', XYZ forms letter 'L'
function xyz2abcd(cuts, rec, tri, inv) {
	var X = tri[0], Y = tri[1], Z = tri[2];
	var A = rec[0], B = rec[1], C = rec[2], D = rec[3];

// construct points E, F, L, M, N
	var p = getPoints(X, Y, Z, A, B, C, D);
	var E = p.E, F = p.F, L = p.L, M = p.M, N = p.N;

	if (vec3.equals(M, E)) console.log("M=E");//
	if (vec3.equals(M, L)) console.log("M=L");
	if (vec3.equals(N, B)) console.log("N=B");//
	if (vec3.equals(L, D)) console.log("L=D");//
	if (vec3.equals(L, A)) console.log("L=A");//
	if (vec3.equals(N, C)) console.log("N=C");//
	if (vec3.equals(N, B) != vec3.equals(L, D)) {
		console.log("w=sup unstable");console.log(N);console.log(B);console.log(L);console.log(D);
	}
	if (vec3.equals(N, C) != vec3.equals(L, A)) {
		console.log("w=h/2 unstable");console.log(N);console.log(C);console.log(L);console.log(A);
	}

// generate pieces within each quadrilateral or triangle
	var AEL = lineCutSameSide(cuts, E, L, A);
	var DFML = lineCutSameSide(AEL.oppo, F, M, D);
	var BEMN = lineCutSameSide(DFML.oppo, M, N, midPoint(B, E));
	var CFMN = BEMN.oppo;
	cuts = AEL.concat(DFML).concat(BEMN).concat(CFMN);//special case handling

	if (inv) {
		for (var i = 0; i < cuts.length; i++) {
			var poly = cuts[i];
			movePiece(poly);// pieces actually moved (from within rec)
			mat4.invert(poly.move, poly.move);
		}
	}

// update poly.move
	var AELt = mat4.create();
	var vLF = vec3.create();
    vec3.sub(vLF, F, L);
    vec3.scale(vLF, vLF, 2);
    mat4.fromTranslation(AELt, vLF);
    chainMove(AEL, AELt);
    chainMove(DFML, ctrSymm2D(F));
	chainMove(BEMN, ctrSymm2D(N));

// move resulting tri to match original XYZ
	chainMove(cuts, triCoincide(cuts, M, N, F, X, Y, Z));
	return cuts;
}


// construct points E, F, L, M, N according to the specified figure
// separated out for clarity
function getPoints(X, Y, Z, A, B, C, D) {
	var W = vec3.create(); //vAD
	vec3.sub(W, D, A);
	var E = vec3.create(); //AB midpoint
	vec3.add(E, A, B);
	vec3.scale(E, E, 0.5);
	var F = vec3.create(); //CD midpoint
	vec3.add(F, E, W);
	
	// numerical precision handling
	var h = vec3.create();
	vec3.sub(h, A, B);
	vec3.scaleAndAdd(h, B, h, vec3.dist(Z, Y)/vec3.len(h));
	if (vec3.dist(A, h) != 0 && vec3.dist(A, h) < 0.1)// debugging
		console.log(A+"\n"+h+"\ndist= "+vec3.dist(A, h)+"\nequal? "+vec3.equals(A, h));
	if (vec3.equals(A, h))
		var l = 0;// A = L
	else
		var l = Math.sqrt(vec3.sqrDist(Z, Y) - vec3.sqrDist(A, B))/2;
	// TODO: generalize using cos for parallelogram?
	var L = vec3.create();
	vec3.normalize(L, W);
	vec3.scaleAndAdd(L, A, L, l);

	var vEL = vec3.create();
	vec3.sub(vEL, L, E);
	var f2 = vec3.dot(vEL, W);
	f2 = f2*f2 / vec3.dot(vEL, vEL);// sqrDist from F to EL
	var m = Math.sqrt(vec3.sqrDist(X, Z)/4 + f2 - vec3.sqrLen(W));
	var vYZ = vec3.create();
	vec3.sub(vYZ, Z, Y);
	var vZX = vec3.create();
	vec3.sub(vZX, X, Z);
	if (vec3.dot(vYZ, vZX) < 0)
		m = Math.sqrt(f2) - m;
	else
		m = Math.sqrt(f2) + m;
	var M = vec3.create();
	vec3.normalize(M, vEL);
	vec3.scaleAndAdd(M, E, M, m);
	// Note: M might not be strictly on EL due to numerical precision

	var N = vec3.create();
	vec3.add(N, A, C);
	vec3.sub(N, N, L);
	return {E:E, F:F, L:L, M:M, N:N};
}


// return mat4 that matches NMF with YXZ
// to be called in rec2tri, to match resulting tri with original XYZ:
// translate -vM, rotate MF to XZ, rotate MN to XY, translate vX (generalized to 3D)
function triCoincide(cuts, M, N, F, X, Y, Z) {
	var vMF = vec3.create();
	var vMN = vec3.create();
	var vXZ = vec3.create();
	var vXY = vec3.create();
	
	vec3.sub(vMF, F, M);
	vec3.sub(vMN, N, M);
	vec3.sub(vXZ, Z, X);
	vec3.sub(vXY, Y, X);
	
	var nMF = vec3.create();
	var nXZ = vec3.create();
	vec3.cross(nMF, vMF, vMN);
	vec3.cross(nXZ, vXZ, vXY);
	vec3.normalize(vMF, vMF);
	vec3.normalize(vXZ, vXZ);
	vec3.normalize(nMF, nMF);
	vec3.normalize(nXZ, nXZ);
	var r1 = quat.create();
	var r2 = quat.create();
	var r0 = quat.create();
	quat.rotationTo(r1, vMF, vXZ);
	quat.rotationTo(r2, nMF, nXZ);
	console.log(r2);//// not tested yet
	quat.mul(r0, r1, r2);

	var vM = vec3.create();
	var transl = mat4.create();
	var move = mat4.create();
	vec3.scale(vM, M, -1);
	mat4.fromTranslation(transl, vM);
	mat4.fromRotationTranslation(move, r0, X);
	mat4.mul(move, move, transl);
	return move;
}
