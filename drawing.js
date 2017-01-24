
// TODO: write a function to generalize (to 3D, in one place, including translation)
// is "if (null)" better in performance??

// given polygon and stage of transformation(0≤t≤1), draw it on canvas
function drawPolygon(ctx, poly, t) {

    for (var i = 0; i < poly.length; i++) {
        var p = vec3.clone(poly[i]);
        // if (!('transform' in poly)) {ctx.fillStyle = "#000000"; ctx.fillText(["A","B","C"][i], p[0], p[1]);}
        // else vec3.transformMat4(p, p, poly.transform);
        if (i == 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
    }
}

// transform polygon along straight line and around its center
function drawPolyNH(ctx, poly, t) {
    // ctx.fillRect(poly.center[0]-1, poly.center[1]-1, 2, 2);
    ctx.beginPath();
    for (var i = 0; i < poly.length; i++) {
        var p = vec3.clone(poly[i]);
        // vec3.transformMat4(p, p, poly.move);
        if (t > 0 && ('move' in poly)) {////
            // var center = vec3.clone(getCenter(poly));
            // vec3.transformMat4(center, getCenter(poly), poly.move);
            // vec3.sub(center, center, getCenter(poly));
            // vec3.scaleAndAdd(center, getCenter(poly), center, t);

            var rotat = quat.create();
            mat4.getRotation(rotat, poly.move);
            quat.slerp(rotat, quat.create(), rotat, t);
            var trnsl = vec3.create();
            mat4.getTranslation(trnsl, poly.move);

            // vec3.transformQuat(center, center, rotat);
            // vec3.scaleAndAdd(center, center, trnsl, t);

            // vec3.sub(p, p, center);
            vec3.transformQuat(p, p, rotat);//
            // vec3.add(p, p, center);
            vec3.scaleAndAdd(p, p, trnsl, t);//

            // // center = vec3.create();
            // vec3.scaleAndAdd(trnsl, center, trnsl, t);
            // var move = mat4.create();
            // mat4.fromRotationTranslation(move, rotat, trnsl);
            // vec3.scale(trnsl, center, -t);
            // var ardctr = mat4.create();
            // mat4.fromTranslation(ardctr, trnsl);
            // mat4.mul(move, move, ardctr);
            // vec3.transformMat4(p, p, move);
        }
        if (i == 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    if ('move' in poly) {
        if (!('color' in poly)) poly.color = randomColor();
        ctx.fillStyle = poly.color;
        ctx.fill();
    }
    else ctx.stroke();
}

// draw all polygons in a list of cuts
function drawPoly(ctx, polygons, t) {
    for (var i = 0; i < polygons.length; i++) {
        drawPolyNH(ctx, polygons[i], t);
    }
}

// return a random color
function randomColor() {
    var hex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
    var color = "#";
    for (var i = 0; i < 6; i++) {
        var h = Math.floor(Math.random()*16);
        color += hex[h];
    }
    return color;
}



// deside whether a point is inside a polygon
function insidePolygon(P, transformed) {
    var ref = crossProduct(transformed[transformed.length-1], transformed[0], P);
    for (var i = 0; i < transformed.length-1; i++) {
        if (vec3.dot(ref, crossProduct(transformed[i], transformed[i+1], P)) <= 0) {
            //// no intersection if P on the line of an edge (when crossProduct==0)
            return false;
        }
    } 
    return true;
}


//// Helper funtion to find the cross product of two vec3's AB and AC
function crossProduct(A, B, C) {
    var ab = vec3.create();
    var ac = vec3.create();
    var crs = vec3.create();
    vec3.subtract(ab, B, A);
    vec3.subtract(ac, C, A);
    vec3.cross(crs, ab, ac);
    return crs;
}
