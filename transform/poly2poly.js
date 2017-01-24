
// pile up the rectangles
function cutPoly2Poly(poly1, poly2) {
	var cuts1 = [];
	var cuts2 = [];
	var S = getArea(poly2);
	rescaleCtr(poly1, S);
	var triList1 = triangularize(poly1);
	var triList2 = triangularize(poly2);
	var w = pickFromRange(overlapRange(triList1.concat(triList2)));
	console.log("w="+w);

	var B = vec3.create();
	for (var i = 0; i < triList1.length; i++) {
		var tri = triList1[i];
		var oo = wInTri(tri, w);
		// if (oo === null) console.log(tri+"\n"+w);
		var h = getArea(tri)/w;
		tri = orientTri(tri, oo.order);
		var rec = createRec(w, h, B);
		if (!triCCW(tri)) {
			rec = [rec[3], rec[2], rec[1], rec[0]];
			rec.move = mat4.create();
		}
		cuts1 = cuts1.concat(cutRec2Tri([rec], rec, tri, oo.offset, false));
		B[1] += h;
	}
	B[1] -= S/w;////
	for (var i = 0; i < triList2.length; i++) {
		var tri = triList2[i];
		var oo = wInTri(tri, w);
		// if (oo === null) console.log(tri+"\n"+w);
		var h = getArea(tri)/w;
		tri = orientTri(tri, oo.order);
		var rec = createRec(w, h, B);
		if (!triCCW(tri)) {
			rec = [rec[3], rec[2], rec[1], rec[0]];
			rec.move = mat4.create();
		}
		var A = vec3.clone(B);A[1] += h;
		var D = vec3.clone(A);D[0] += w;
		var cuts = lineCutSameSide(cuts1, A, D, B);
		cuts1 = cuts.oppo;
		cuts2 = cuts2.concat(cutRec2Tri(cuts, rec, tri, oo.offset, true));
		B[1] += h;
	}
	return cuts2;
}

//// TODO
// find the most overlapped range, to reduce pieces
function overlapRange(triList) {
	var total = [];
	var possible = [{inf:-Infinity, sup:Infinity}];
	for (var j = 0; j < triList.length; j++) {
		var tri = triList[j];
		possible = intersectionRange(possible, possibleRange(tri));

		var range = totalRange(tri, 0);
		var overlap = [];
		for (var i = 0; i < total.length; i++) {
			var intxn = intersectionRange(range, total[i]);
			range = complementRange(range, total[i]);
			total[i] = complementRange(total[i], intxn);
			overlap.push(intxn);
		}
		
		for (var i = 1; i < total.length; i++)
			total[i] = unionRange(total[i], overlap[i-1]);
		if (total.length == 0)
			total.push(range);
		else {
			total[0] = unionRange(total[0], range);
			total.push(overlap[overlap.length-1]);
		}
	}

	for (var i = total.length-1; i >= 0; i--) {
		var common = intersectionRange(total[i], possible);
		if (common.length > 0) {
			//// temporary; fix compl()
			for (var j = 0; j < common.length; j++) {
				if (common[j].inf!=common[j].sup) {
					console.log((i+1)+" overlap out of "+total.length);
					return common;
				}
			}
		}
	}
	console.log("empty overlap");
	for (var i = 0; i < triList.length; i++) {
		var tri = triList[i];
		console.log("total: "+totalRange(tri, 0));
		console.log("possible: "+possibleRange(tri));
	}
	possible = intersectionRange({inf:0, sup:possible[possible.length-1].inf}, possible);
	console.log(possible);
	return possible;
}
