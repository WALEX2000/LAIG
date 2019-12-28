function normalizeVector(x, y, z) {
    let length = Math.sqrt(x*x+y*y+z*z);
    return [x/length, y/length, z/length];
}

function crossProduct(v1, v2) {
    return normalizeVector(v1[1]*v2[2]-v1[2]*v2[1],
                           v1[2]*v2[0]-v1[0]*v2[2],
                           v1[0]*v2[1]-v1[1]*v2[0]);
}

function subtractVector(v1, v2) {
    return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]];
}

function reverseVector(v) {
    return [-v[0], -v[1], -v[2]];
}