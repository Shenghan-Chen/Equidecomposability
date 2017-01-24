// Numerical precision relies on vec3.equals()

// split pieces in 'cuts' with line 'PQ'
// return list of those on the same side as 'E'
// Note: 'cuts' is modified
function lineCutSameSide(cuts, P, Q, E) {
    var sameSide = [];
    var oppoSide = [];
    for (var i = 0; i < cuts.length; i++) {
        var lineCut = lineCutConvex(P, Q, cuts[i]);
        if (lineCut.length == 2) {
            cuts.splice(i, 1, lineCut[0], lineCut[1]);
            i++;
        }
        if (lineSameSide(P, Q, lineCut[0], E)) {
            sameSide.push(lineCut[0]);
            if (lineCut.length == 2)
                oppoSide.push(lineCut[1]);
        }
        else {
            oppoSide.push(lineCut[0]);
            if (lineCut.length == 2)
                sameSide.push(lineCut[1]);
            }
    }
    sameSide.oppo = oppoSide;
    // console.log("cuts: "+cuts.length+" same: "+sameSide.length+" oppo: "+oppoSide.length);
    return sameSide;
}

// assuming 'poly' not split by line PQ
// Note: always false if E on PQ
function lineSameSide(P, Q, poly, E) {
    var tmp = 0;
    var PQ = vec3.create();
    var PQxPE = vec3.create();
    var PQxPV = vec3.create();
    vec3.sub(PQ, Q, P);
    vec3.sub(PQxPE, E, P);// PE
    vec3.cross(PQxPE, PQ, PQxPE);

    for (var i = 0; i < poly.length; i++) {
        vec3.sub(PQxPV, poly[i], P);// PV
        vec3.cross(PQxPV, PQ, PQxPV);
        var prdct = vec3.dot(PQxPV, PQxPE);
        if (Math.abs(prdct) > Math.abs(tmp))// numerical precision check
            tmp = prdct;
    }
    // debugging
    if (Math.abs(tmp) < 1) {
        console.log("small abs warning: "+tmp);
        if (tmp==0) console.log("E on PQ");
    }
    return tmp > 0;
}

// return list of resulting piece(s)
function lineCutConvex(P, Q, poly) {
    var intxn = [];
    var index = [];
    var split = true;
    var l = poly.length;
    for (var i = 0; i < l; i++) {
        var A = poly[i];
        var B = poly[(i+1)%l];
        var X = lineIntersection(A, B, P, Q);
        if (X === null) continue;
        if (X === B) {
            if (i+1 != l) i++;
            else return [poly];// PQ through poly[0]
        }
        intxn.push(X);
        index.push(i);
        if (intxn.length == 2) {
            if ((intxn[1] === poly[i]) && (intxn[0] === poly[i-1]))
                return [poly];// PQ through edge i-1
            break;
        }
    }
    if (intxn.length < 2)
        return [poly];
    var cut1 = createPiece(index[0], index[1], intxn[0], intxn[1], poly);
    var cut2 = createPiece(index[1], index[0], intxn[1], intxn[0], poly);
    return [cut1, cut2];
}

// generate poly from parent, incl. vertices from indexA to indexB
// Note: vec3 and mat4 are cloned
function createPiece(indexA, indexB, intxnA, intxnB, parent) {
    var poly = [];
    poly.move = mat4.clone(parent.move);
    poly.push(vec3.clone(intxnA));
    var i = indexA;
    while (i != indexB) {
        i = (i+1)%parent.length;
        poly.push(vec3.clone(parent[i]));
    }
    if (!vec3.equals(parent[indexB], intxnB))
        poly.push(vec3.clone(intxnB));
    return poly;
}

// find intersection of segment AB and line CD (generalized to include 3D cases)
// s(ABxCD)=ACxCD, intxn = A + sAB (0 ≤ s ≤ 1)
// Note: intxn not cloned so that it could be compared using ===
function lineIntersection(A, B, C, D) {
    ////debugging: sanity check
    if (vec3.equals(A, C) && !vec3.exactEquals(A, C)) {
        console.log("A=C");
        vec3.copy(A, C);
    }
    if (vec3.equals(A, D) && !vec3.exactEquals(A, D)) {
        console.log("A=D");
        vec3.copy(A, D);
    }
    if (vec3.equals(B, C) && !vec3.exactEquals(B, C)) {
        console.log("B=C");
        vec3.copy(B, C);
    }
    if (vec3.equals(B, D) && !vec3.exactEquals(B, D)) {
        console.log("B=D");
        vec3.copy(B, D);
    }
    if (vec3.equals(A, C) || vec3.equals(A, D)) return A;
    if (vec3.equals(B, C) || vec3.equals(B, D)) return B;
    var zero = vec3.create();
    var AB = vec3.create();
    var CD = vec3.create();
    var ABxCD = vec3.create();
    vec3.sub(AB, B, A);
    vec3.sub(CD, D, C);
    vec3.cross(ABxCD, AB, CD);
    if (vec3.equals(ABxCD, zero)) return null;// parallel
    var ACxCD = vec3.create();
    vec3.sub(ACxCD, C, A);// AC
    vec3.cross(ACxCD, ACxCD, CD);
    var zr = vec3.create();
    vec3.cross(zr, ACxCD, ABxCD);
    if (!vec3.equals(zr, zero)) return null;// skew
    if (vec3.equals(ACxCD, zero)) return A;
    if (vec3.equals(ACxCD, ABxCD)) return B;

    var s = ACxCD[2]/ABxCD[2];// optimized for 2D cases (in z=0 plane)
    vec3.scaleAndAdd(zr, ACxCD, ABxCD, -s);
    if (!vec3.equals(zr, zero))
        console.log("s=ACxCD/ABxCD: ACxCD-s(ABxCD)="+zr);// debugging: numerical precision sanity check

    if (s < 0 || s > 1) return null;
    var intxn = vec3.create();
    vec3.scaleAndAdd(intxn, A, AB, s);
    if (vec3.equals(intxn, C)) return C;
    if (vec3.equals(intxn, D)) return D;
    return intxn;
}
