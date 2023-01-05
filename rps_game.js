var jsPsych = initJsPsych({
    on_finish: function() {
        console.log(jsPsych.data.get().json());
        jatos.endStudy(jsPsych.data.get().json());
    },
    show_progress_bar: true,
});

const RPS = ["Rock", "Paper", "Scissors"]
var count = {
    win: 0,
    loss: 0,
    draw: 0
}

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


const update_count = function (result) {
    console.log(count)
    count[result] = count[result] + 1
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

//////////////////////////// strategies //////////////////////////////////

const nash_equilibrium_strategy = function() {
    var bot_response = Math.floor(Math.random() * 3);
    return bot_response
}

const winstay = function() {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.response))
    d = data[data.length-1]
    if (!Boolean(d)) { return Math.floor(Math.random() * 3); }
    if ("win" == compute_result(d.response, d.bot_response)) {
        return d.bot_response
    } else {
        var idxs = new Set([0, 1, 2])
        idxs.delete(d.bot_response)
        var arr = Array.from(idxs)
        var r = Math.floor(Math.random() * 2);
        return arr[r]
    }
}

const super_male_strategy = function () {
    return 0
}

const rotate_strategy = function () {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.response))
    d = data[data.length-1]
    if (!Boolean(d)) { return Math.floor(Math.random() * 3); }
    var r = (d.bot_response + 1 ) % 3
    return r;
}

const learn_preference = function() {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.response))
    d = data[data.length-1]
    if (!Boolean(d)) { return Math.floor(Math.random() * 3); }
    var scounts = range(0, 2).map((i) => data.map((x) => x.response == i).reduce((a, b) => a+b, 0))
    scounts = scounts.map((x)=>x+1)
    p = scounts.map((x)=>x/(scounts.reduce(add, 0)))
    var prediction = sample(p)
    // data.map((x) => x.response == 1)
    // data.map((x) => x.response == 2)
    console.log(`p: ${p}`)
    return (prediction + 1) % 3; 
}

const dont_always_copy_opponent_move = function () {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.response))
    d = data[data.length-1]
    if (!Boolean(d)) { return Math.floor(Math.random() * 3); }
    result = compute_result(d.response, d.bot_response)
    if ("loss" == result) {
        return (d.response + 1 ) % 3;
    } else if ("win" == result) {
        return d.response;
    } else {
        return Math.floor(Math.random() * 3); 
    }
} // https://www.kaggle.com/code/mainakchain/rps-getting-started-with-researched-winning-logic

const strategy = dont_always_copy_opponent_move;

//////////////////// jsPsych Trials ////////////////////////////////////////////////////

const start = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p>.</p><p>Please click X to start the first trial.</p>',
    choices: ['X'],
    button_html: '<button class="jspsych-btn-fixation">%choice%</button>',
    on_start: function () {
        document
            .querySelector(".jspsych-display-element")
            .insertAdjacentHTML("afterbegin", '<div id="statistics-container">' +
                "<p><span id='wins'>Hallo!</span></p>"
            );
    }
}

const fixation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        var trials = jsPsych.data.get()['trials']
        var bot_response = trials[trials.length - 1]['bot_response'];
        var prev_response = trials[trials.length - 1]['response'];
        var result = compute_result(bot_response, prev_response)
        update_count(result)
        document.querySelector("#wins").innerHTML = `Wins: ${count.win}, Losses: ${count.loss}, Draws: ${count.draw} (${count.win/(count.win+count.loss)})`;
        return `<p>.</p><p>You responded ${RPS[prev_response]}, bot ${RPS[bot_response]}</p>`;
    },
    choices: ['X'],
    button_html: '<button class="jspsych-btn-fixation">%choice%</button>'
}

var countdown = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p><span id="clock"></span>',
    trial_duration: 3000,
    on_start: function() {
        var wait_time = 1 * 3 * 1000; // in milliseconds
        var start_time = performance.now();
        var interval = setInterval(function() {
            var time_left = wait_time - (performance.now() - start_time);
            document.querySelector('#clock').innerHTML = sec2rps(time_left)
            if (time_left <= 0) {
                // console.log("stop countdown")
                clearInterval(interval);
            }
        }, 250)
    }
}

const decision = {
    type: jsPsychHtmlButtonResponse,
    stimulus: '<p></p>',
    choices: ['R', 'P', 'S'],
    data: {
        bot_response: strategy
    },
    on_finish: function() {
        console.log(jsPsych.data.get().json());
        jatos.submitResultData(jsPsych.data.get().json());
    },
    button_html: '<button class="jspsych-btn-%pos%" accesskey="%scut%">%choice%</button>',
}

var trial = {
    timeline: [countdown, decision, fixation]
}

const fullscreen_trial = {
    type: jsPsychFullscreen,
    fullscreen_mode: true
};

const N = 2
// const timeline = [fullscreen_trial]
const timeline = []

timeline.push(start)
timeline.push(...Array.from(".".repeat(N)).map(() => trial));
// const timeline = Array.from(".".repeat(N)).map(() => trial);

jatos.onLoad(() => {
    // jatos.addAbortButton();
    jsPsych.run(timeline);
});
