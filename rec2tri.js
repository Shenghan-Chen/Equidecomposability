
// move cuts from rec to tri
// (assume equal area; order: ABCD forms letter 'U', XYZ forms letter 'L')
function rec2tri(cuts, rec, tri, inv) {
	var X = vec3.clone(tri[0]);
	var Y = vec3.clone(tri[1]);
	var Z = vec3.clone(tri[2]);

	if (triCCW(tri)) {
		console.log("CCW"); //debugging
		var A = vec3.clone(rec[0]);
		var B = vec3.clone(rec[1]);
		var C = vec3.clone(rec[2]);
		var D = vec3.clone(rec[3]);
	}
	else {
		var B = vec3.clone(rec[0]);
		var A = vec3.clone(rec[1]);
		var D = vec3.clone(rec[2]);
		var C = vec3.clone(rec[3]);
	}

// construct points E, F, L, M, N
	var p = getPoints(X, Y, Z, A, B, C, D);
	var E = p.E, F = p.F, L = p.L, M = p.M, N = p.N;

// generate collections of pieces
	var AEL = lineCutSameSide(cuts, E, L, [], A);
	var DFML = lineCutSameSide(cuts, F, M, AEL, D);
	var BEMN = lineCutSameSide(cuts, M, N, AEL, B);

	if (inv) {
		for (var i = 0; i < cuts.length; i++) {
			var poly = cuts[i];
			movePiece(poly); //where pieces are actually moved (from within rec)
			mat4.invert(poly.move, poly.move);
		}
	}

// update poly.move
	var BEMNt = ctrSymm2D(N);
	for (var i = 0; i < BEMN.length; i++) {
		var poly = BEMN[i];
		mat4.mul(poly.move, BEMNt, poly.move);
	}

	var DFMLt = ctrSymm2D(F);
	for (var i = 0; i < DFML.length; i++) {
		var poly = DFML[i];
		mat4.mul(poly.move, DFMLt, poly.move);
	}

	var AELt = mat4.create();
	var vLF = vec3.create();
    vec3.sub(vLF, F, L);
    vec3.scale(vLF, vLF, 2);
    mat4.fromTranslation(AELt, vLF);// faster than mat4.translate()
	for (var i = 0; i < AEL.length; i++) {
		var poly = AEL[i];
		mat4.mul(poly.move, AELt, poly.move);
	}

// to move resulting tri to match original XYZ
	triCoincide(cuts, X, Y, Z, A, B, D, F, M);
}



// determine whether ABC is counterclockwise in the plane; only needed in 2D
function triCCW(tri) {
	var AB = vec3.create();
    var AC = vec3.create();
    var norm = vec3.create();
    vec3.subtract(AB, tri[1], tri[0]);
    vec3.subtract(AC, tri[2], tri[0]);
    vec3.cross(norm, AB, AC);
    return norm[2] > 0;
}

// to be called in rec2tri, to match resulting tri with original XYZ:
// translate -vM, rotate MF to XZ, rotate MN to XY, translate vX (generalized to 3D)
function triCoincide(cuts, X, Y, Z, A, B, D, F, M) {
	var vAD = vec3.create();
	var vAB = vec3.create();
	var vYX = vec3.create();
	var vYZ = vec3.create();
	var vMF = vec3.create();
	var vXZ = vec3.create();
	vec3.sub(vAD, D, A);
	vec3.sub(vAB, B, A);
	vec3.sub(vYX, X, Y);
	vec3.sub(vYZ, Z, Y);
	vec3.sub(vMF, F, M);
	vec3.sub(vXZ, Z, X);
	// var nMF = vec3.create();
	// var nXZ = vec3.create();
	// vec3.cross(nMF, vAD, vAB);
	// vec3.cross(nMF, nMF, vMF);
	// vec3.cross(nXZ, vYX, vYZ);
	// vec3.cross(nXZ, nXZ, vXZ);
	vec3.normalize(vMF, vMF);
	vec3.normalize(vXZ, vXZ);
	// vec3.normalize(nMF, nMF);
	// vec3.normalize(nXZ, nXZ);
	var r1 = quat.create();
	// var r2 = quat.create();
	// var r0 = quat.create();
	// var rotate = mat4.create();
	quat.rotationTo(r1, vMF, vXZ);
	// quat.rotationTo(r2, nMF, nXZ);
	// quat.mul(r0, r1, r2);
	// mat4.fromQuat(rotate, r0);

	var vM = vec3.create();
	var transl = mat4.create();
	var move = mat4.create();
	vec3.scale(vM, M, -1);
	mat4.fromTranslation(transl, vM);
	mat4.fromRotationTranslation(move, r1, X);
	mat4.mul(move, move, transl);

	for (var i = 0; i < cuts.length; i++) {
		var poly = cuts[i];
		mat4.mul(poly.move, move, poly.move);
	}
}

// construct points E, F, L, M, N according to the specified figure
function getPoints(X, Y, Z, A, B, C, D) {

	var W = vec3.create(); //vAD
	vec3.subtract(W, D, A);

	var E = vec3.create(); //AB midpoint
	vec3.add(E, A, B);
	vec3.scale(E, E, 0.5);
	var F = vec3.create(); //CD midpoint
	vec3.add(F, E, W);

	// TODO: generalize using cos for parallelogram?
	var l = Math.sqrt(vec3.sqrDist(Z, Y) - vec3.sqrDist(A, B))/2;
	// console.log("W "+vec3.len(W)+"\nl: "+l);
	var L = vec3.create();
	vec3.normalize(L, W);
	vec3.scaleAndAdd(L, A, L, l);
	// console.log(vec3.str(L));

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
	// console.log(vec3.str(M));// Note: M might not be strictly on EL due to numerical precision

	var N = vec3.create();
	vec3.add(N, A, C);
	vec3.subtract(N, N, L);
	// console.log(vec3.str(N));
	return {E:E, F:F, L:L, M:M, N:N};
}

// rotate π around ctr <=> {-ctr, *-1, +ctr}
function ctrSymm2D(center) {
	var transl = mat4.create();
	mat4.fromTranslation(transl, center);
	var result = mat4.clone(transl);
	transl[0] = -1; transl[5] = -1;// in z=0 plane only
	result[12] *= -1; result[13] *= -1; result[14] *= -1;
	mat4.mul(result, transl, result);
	return result;
}

// (W, H: width and height vectors?) ccw?
// create 'w' by 'h' rec centered at 'ctr' || z=0 plane; order of ABCD forms letter 'U'
function createRec(w, h, ctr) {
	if (ctr === undefined) {
		ctr = vec3.fromValues(400, 300, 0);//center of canvas; TODO: parameterize this
	}
	var uLeft = vec3.fromValues(-w/2, h/2, 0);
	var uRight = vec3.fromValues(w/2, h/2, 0);
	var A = vec3.create(), B = vec3.create(), C = vec3.create(), D = vec3.create();
	vec3.add(A, ctr, uLeft);
	vec3.add(D, ctr, uRight);
	vec3.sub(C, ctr, uLeft);
	vec3.sub(B, ctr, uRight);

	var rec = [A, B, C, D];
	rec.move = mat4.create();
	return rec;
}
