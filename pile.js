
// cut off a slice parallel to AB
function sliceRec(rec, w) {
	var vW = vec3.create();
	var E = vec3.create();
	var F = vec3.create();
	vec3.sub(vW, rec[3], rec[0]);// vAD
	vec3.normalize(vW, vW);
	vec3.scale(vW, vW, w);
	vec3.add(E, rec[0], vW);
	vec3.add(F, rec[1], vW);


	return [ABFE, EFCD];////
}