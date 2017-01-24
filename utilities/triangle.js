
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

// Note: this should outperform Heron's formula in terms of accuracy
function sqrArea(tri) {
	var vBA = vec3.create();
	var vCA = vec3.create();
	var BAxCA = vec3.create();
	vec3.sub(vBA, tri[0], tri[1]);
	vec3.sub(vCA, tri[0], tri[2]);
	vec3.cross(BAxCA, vBA, vCA);
	return vec3.sqrLen(BAxCA)/4;
}

// a, b, c correspond to 0, 1, 2
function getSqrSide(tri, l) {
	return vec3.sqrDist(tri[(l+1)%3],tri[(l+2)%3]);
}

// a ≤ b ≤ c by default
function orientTri(tri, order) {
	if (!('order' in tri)) {
		if (vec3.sqrDist(tri[0], tri[2]) < vec3.sqrDist(tri[1], tri[2]))// swap A, B
			tri.splice(0, 2, tri[1], tri[0]);
    	if (vec3.sqrDist(tri[0], tri[1]) < vec3.sqrDist(tri[1], tri[2]))// swap A, C
    		tri.splice(0, 3, tri[2], tri[1], tri[0]);
    	if (vec3.sqrDist(tri[0], tri[1]) < vec3.sqrDist(tri[0], tri[2]))// swap B, C
    		tri.splice(1, 2, tri[2], tri[1]);
    	var A = tri[0], B = tri[1], C = tri[2];
    	tri.order = [[A,B,C], [A,C,B], [B,A,C], [B,C,A], [C,A,B], [C,B,A]];
    }
    if (order !== undefined)
    	return tri.order[order];
}
