// k is the ratio of {projection of vAC onto vBC} to vBC
// it is compared with x, ratio of {projection of w onto vBC} to vBC/2
// construction valid if k ≤ x ≤ k+1, i.e. tri can be cut into 4 pieces to form a rectangle with width w

function getK(tri, order) {
	if (!('k6' in tri)) {
		orientTri(tri);
		var A = tri[0], B = tri[1], C = tri[2];
		tri.k6 = [projK(A,B,C), projK(A,C,B), projK(B,A,C), projK(B,C,A), projK(C,A,B), projK(C,B,A)];
	}
	return tri.k6[order];
}

function projK(A, B, C) {
	var vAC = vec3.create();
	vec3.sub(vAC, C, A);
	var vBC = vec3.create();
	vec3.sub(vBC, C, B);
	return vec3.dot(vAC, vBC)/vec3.sqrLen(vBC);
}

// measure how far x is from [k, k+1]
// returned number indicates # times needed to cut tri in half, sign indicates the direction
// 0 is ideal; - seems to produce fewer pieces than +
function kDist(k, x) {
	if (x < k) return Math.floor(x-k);
	if (x > k+1) return Math.ceil(x-k-1);
	return 0;
}
