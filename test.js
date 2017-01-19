
// debug("here");

function drawTest(ctx) {
	testMat4(glcanvas.cuts[0]);
	var x = Math.random();
	// if (Math.sqrt(x)*Math.sqrt(x)!=x) console.log(x);
}

function testMat4(poly) {
	if (!('center' in poly)) poly.center = getCenter(poly);
	var t = 1;
	var p = vec3.clone(poly[0]);
	var u = vec3.clone(poly[0]);
	vec3.transformMat4(u, u, poly.move);
	console.log(u);

	// console.log("move: "+poly.move);
	// var m3 = mat3.create();
	// mat3.fromMat4(m3, poly.move);
	// var q = quat.create();
	// mat4.getRotation(q, poly.move);
	// console.log(q);
	// quat.normalize(q,q);
	// console.log(q);
	// var mt = mat3.create();
	// mat3.fromQuat(mt, q);
	// console.log(m3);
	// console.log(mt);
	// console.log(mat3.equals(m3, mt));

	// vec3.subtract(p, p, poly.center);
	var rotat = quat.create();
	mat4.getRotation(rotat, poly.move);
	// quat.slerp(rotat, quat.create(), rotat, t);
	// vec3.transformQuat(p, p, rotat);
	// vec3.add(p, p, poly.center);
	var trnsl = vec3.create();
	mat4.getTranslation(trnsl, poly.move);
	// vec3.scaleAndAdd(p, p, trnsl, t);

	var m3 = mat3.create();
	mat3.fromMat4(m3, poly.move);
	vec3.transformMat3(p, p, m3);
	vec3.add(p, p, trnsl);

	console.log(p);
	console.log(vec3.equals(p, u));

	var m = mat4.create();
	mat4.fromRotationTranslation(m, rotat, trnsl);
	console.log(m);
	console.log(poly.move);
	console.log(mat4.equals(poly.move, m));
}

// function testwInTri() {
// 	var A = vec3.fromValues(0, 1.732, 0);
// 	var B = vec3.fromValues(-1, 0, 0);
// 	var C = vec3.fromValues(1, 0, 0);
// 	var tri = [A, B, C];
// 	prepTri2(tri);
// 	console.log("test: "+ wInTri(tri, 0.9).n);
// }

// function testLineIntersection(ctx) {
// 	var A = p(10, 0), B = p(0, 0), C = p(0, 10), D = p(10, 10);
// 	drawPoint(ctx, A, "A");
// 	drawPoint(ctx, B, "B");
// 	drawPoint(ctx, C, "C");
// 	drawPoint(ctx, D, "D");
// 	var X = lineIntersection(A, B, C, D);
// 	console.log("testLineIntersection:");
// 	if (X === null)
// 		console.log("X === null");
// 	else if (X === A)
// 		console.log("X === A");
// 	else if (X === B)
// 		console.log("X === B");
// 	else drawPoint(ctx, X, "X");
// 	drawPiece(ctx, [A, B, C, D]);
// }

function p(x, y) {
	return vec3.fromValues(x, y, 0);
}

function drawPiece(ctx, piece, color, label) {
	ctx.beginPath();
	for (var i = 0; i < piece.length; i++) {
		var p = piece[i];
		if (i == 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
	}
	ctx.closePath();
    if (color === undefined)
    	ctx.fillStyle = randomColor();
    else ctx.fillStyle = color;
    ctx.fill();
    if (label !== undefined) {
    	var p = getCenter(piece);
    	ctx.fillText(label, p[0], p[1]);
    }
}

function drawPoint(ctx, P, label) {
	ctx.fillRect(P[0]-1, P[1]-1, 2, 2);
    ctx.fillStyle = "#000000";
    if (label !== undefined)
    	ctx.fillText(label, P[0], P[1]);
}