const sec2rps = function(s) {
    console.log(s)
    if (s > 800) {
        return "Schnick"
    } else if (s > 400) {
        return "Schnack"
    } else {
        return "Schnuck"
    }
}

const compute_result = function(p0, p1) {  // from perspective of p1
    if (p0 == p1) {
        var s = "draw";
    // } else if ("0120".includes(String(p0) + String(p1))) {
    } else if ("RPSR".includes(p0 + p1)) {
        var s = "win";
    // } else if ("0210".includes(String(p0) + String(p1))) {
    } else if ("RSPR".includes(p0 + p1)) {
        var s = "loss";
    }
    return s
}


const beat_symbol = {
    R: "P",
    P: "S",
    S: "R"
}

const lose_symbol = {
    R: "S",
    P: "R",
    S: "P"
}

const rps_emoji = {
  R: '<div style="font-size:31px;translate:-1px -1px">&#9994;</div>',
  P: '<div style="font-size:31px;translate:-1px -1px">&#9995;</div>',
  S: '<div style="font-size:31px;translate:-1px -1px">&#9996;</div>'
};
const rps_emoji_symbols = {
  R: '<div style="font-size:31px;translate:-1px -1px">&#129704;</div>',
  P: '<div style="font-size:31px;translate:-1px -1px">&#128196;</div>',
  S: '<div style="font-size:31px;translate:-1px -1px">&#9986;</div>'
};

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

function sample_dict(p) {
    i = Math.random()
    P = Object.values(p).map((sum => value => sum += value)(0))
    for (let pidx=0; pidx <= P.length; pidx++) {
        if (i < P[pidx]) {
            return Object.keys(p)[pidx];
        }
    }
}

function add(a, b) {
    return a + b;
}

function randomize(values) {
    // https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html
  let index = values.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (index != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * index);
    index--;

    // And swap it with the current element.
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
}

function choice(s) {
    return s[Math.floor(Math.random() * s.length)]
}

const max = (arr) => Math.max(...arr);

let f = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
let cartesian = (a, b, ...c) => b ? cartesian(f(a, b), ...c) : a;

function first_order_markov(ts) {
    const idxs = cartesian("RPS".split(""), "RPS".split("")).map((x)=>x[0]+x[1])
    const d = Object.assign({}, ...idxs.map((x) => ({[x]: 1})))
    n = _.values(d).reduce(add)
    p = Object.assign({}, ...idxs.map((x)=> ({[x]: d[x] / n})))
    return p;
}
