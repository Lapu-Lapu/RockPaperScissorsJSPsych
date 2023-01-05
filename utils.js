const sec2rps = function(s) {
    console.log(s)
    if (s > 2000) {
        return "Schnick"
    } else if (s > 1000) {
        return "Schnack"
    } else {
        return "Schnuck"
    }
}

const compute_result = function(p0, p1) {  // from perspective of p1
    if (p0 == p1) {
        var s = "draw";
    } else if ("0120".includes(String(p0) + String(p1))) {
        var s = "win";
    } else if ("0210".includes(String(p0) + String(p1))) {
        var s = "loss";
    }
    return s
}


function range(start, end) {
    if(start === end) return [start];
    return [start, ...range(start + 1, end)];
}

function sample(p) {
    i = Math.random()
    if (i < p[0]) {
        return 0;
    } else if (i < p[1]){
        return 1;
    } else {
        return 2;
    }
}

function add(a, b) {
    return a + b;
}
