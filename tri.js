
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

function getK(tri, order) {
	if (!('k6' in tri)) {
		orientTri(tri);
		var A = tri[0], B = tri[1], C = tri[2];
		tri.k6 = [projK(A,B,C), projK(A,C,B), projK(B,A,C), projK(B,C,A), projK(C,A,B), projK(C,B,A)];
	}
	return tri.k6[order];
}

// return ratio of [projection of vAC onto vBC] to vBC; construction valid if k ≤ x ≤ k+1
function projK(A, B, C) {
	var vAC = vec3.create();
	vec3.sub(vAC, C, A);
	var vBC = vec3.create();
	vec3.sub(vBC, C, B);
	return vec3.dot(vAC, vBC)/vec3.sqrLen(vBC);
}

// measure how far x is from [k, k+1]
function kDist(k, x) {
	if (x < k) return Math.floor(x-k);
	if (x > k+1) return Math.ceil(x-k-1);
	return 0;
}

// return index of entry with smallest absolute value, assuming - preferred over +
function indexAbsMin(list) {
	var min = list[0];
	var index = 0;
	for (var i = 1; i < list.length; i++) {
		if (Math.abs(list[i]) < Math.abs(min) || (min > 0 && list[i]+min == 0)) {
			min = list[i];
			index = i;
		}
	}
	return index;
}

// return {(n1, n2):|n1|+|n2|≤nSum}
function absSumPairs(nSum) {
	var n1 = 0;
	var n2 = nSum;
	while (n2 >= 0) {
		var pairs = [{n1:n1, n2:n2}];
		if (n1 != 0) pairs.push({n1:-n1, n2:n2});
		if (n2 != 0) pairs.push({n1:n1, n2:-n2});
		if (n1+n2 != 0) pairs.push({n1:-n1, n2:-n2});
		n1++;
		n2--;
	}
	return pairs;
}
