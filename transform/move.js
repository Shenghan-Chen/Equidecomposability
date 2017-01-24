
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

function movePiece(poly, move) {
	if (move === undefined) move = poly.move;
	for (var i = 0; i < poly.length; i++)
		vec3.transformMat4(poly[i], poly[i], move); 
}

// apply move after original transformation
function chainMove(cuts, move) {
	for (var i = 0; i < cuts.length; i++)
		mat4.mul(cuts[i].move, move, cuts[i].move);
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

function midPoint(A, B) {
	var M = vec3.create();
	vec3.add(M, A, B);
	vec3.scale(M, M, 0.5);
	return M;
}
