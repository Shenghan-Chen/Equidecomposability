// special cases:
// x = k 		M coincides with E (checked)
// x = k+1 		M coincides with L (checked)
// w = inf/sup 	N coincides with B, L with D
// w = h/2		L with A, N with C, degenerate AEL (sameSide handled correctly w/o changing rec)


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



// chain the original transformation of pieces with the move from rec to tri
// if 'inv', move to destination of original transformation (position of tri1, in the context of 2nd call to cutRec2Tri)
// Note: assuming equal area; order: ABCD forms letter 'U', XYZ forms letter 'L'
function rec2tri(cuts, rec, tri, inv) {
	var X = tri[0], Y = tri[1], Z = tri[2];
	var A = rec[0], B = rec[1], C = rec[2], D = rec[3];

// construct points E, F, L, M, N
	var p = getPoints(X, Y, Z, A, B, C, D);
	var E = p.E, F = p.F, L = p.L, M = p.M, N = p.N;
	// console.log(L);console.log(M);console.log(N);

// generate collections of pieces
	var AEL = lineCutSameSide(cuts, E, L, [], A);
	var DFML = lineCutSameSide(cuts, F, M, AEL, D);
	var BEMN = lineCutSameSide(cuts, M, N, AEL, midPoint(B, E)); //special case handling

	// var AEL = lineCutSameSide(cuts, E, L, [], A);
	// var DFML = lineCutSameSide(AEL.oppo, F, M, [], D);
	// var BEMN = lineCutSameSide(DFML.oppo, M, N, [], midPoint(B, E));
	// var CFMN = BEMN.oppo;
	// cuts = AEL.concat(DFML).concat(BEMN).concat(CFMN);


	if (inv) {
		for (var i = 0; i < cuts.length; i++) {
			var poly = cuts[i];
			movePiece(poly); //where pieces are actually moved (from within rec)
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
	chainMove(cuts, triCoincide(cuts, X, Y, Z, M, N, F));
	// if (inv) glcanvas.debug = [[X, "X"], [Y, "Y"], [Z, "Z"], [A, "A"], [B, "B"], [C, "C"], [D, "D"], [L, "L"], [M, "M"], [N, "N"], [E, "E"], [F, "F"]];
}



// determine whether ABC is counterclockwise in the plane
function triCCW(tri) {
	var vAB = vec3.create();
    var vAC = vec3.create();
    var norm = vec3.create();
    vec3.sub(vAB, tri[1], tri[0]);
    vec3.sub(vAC, tri[2], tri[0]);
    vec3.cross(norm, vAB, vAC);
    return norm[2] > 0;
}

// to be called in rec2tri, to match resulting tri with original XYZ:
// translate -vM, rotate MF to XZ, rotate MN to XY, translate vX (generalized to 3D)
function triCoincide(cuts, X, Y, Z, M, N, F) {
	var vYX = vec3.create();
	var vYZ = vec3.create();
	var vXZ = vec3.create();
	var vMF = vec3.create();
	var vMN = vec3.create();
	var vFN = vec3.create();

	vec3.sub(vYX, X, Y);
	vec3.sub(vYZ, Z, Y);
	vec3.sub(vXZ, Z, X);
	vec3.sub(vMF, F, M);
	// vec3.sub(vMN, N, M);
	// vec3.sub(vFN, N, F);
	
	// var nMF = vec3.create();
	// var nXZ = vec3.create();
	// vec3.cross(nMF, vMN, vFN);
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
	return move;
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

	// TODO: generalize using cos for parallelogram?
	var l = Math.sqrt(vec3.sqrDist(Z, Y) - vec3.sqrDist(A, B))/2;
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

// rotate π around ctr <=> {-ctr, *-1, +ctr}
////TODO: validate with mat4 operations
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
// create 'w' by 'h' rec in z=0 plane; order of ABCD forms letter 'U'
function createRec(w, h, B) {
	if (B === undefined)
		B = vec3.fromValues(400-w/2, 300-h/2, 0);//TODO: parameterize this
	else B = vec3.clone(B);
	var A = vec3.clone(B);
	var C = vec3.clone(B);
	var D = vec3.clone(B);
	A[1] += h;
	D[1] += h;
	C[0] += w;
	D[0] += w;
	var rec = [A, B, C, D];
	rec.move = mat4.create();
	return rec;
}

// function createRec(w, h, ctr) {
// 	if (ctr === undefined) {
// 		ctr = vec3.fromValues(400, 300, 0);//center of canvas; TODO: parameterize this
// 	}
// 	var uLeft = vec3.fromValues(-w/2, h/2, 0);
// 	var uRight = vec3.fromValues(w/2, h/2, 0);
// 	var A = vec3.create(), B = vec3.create(), C = vec3.create(), D = vec3.create();
// 	vec3.add(A, ctr, uLeft);
// 	vec3.add(D, ctr, uRight);
// 	vec3.sub(C, ctr, uLeft);
// 	vec3.sub(B, ctr, uRight);

// 	var rec = [A, B, C, D];
// 	rec.move = mat4.create();
// 	return rec;
// }
