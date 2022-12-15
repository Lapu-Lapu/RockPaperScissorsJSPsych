var jsPsych = initJsPsych({
    on_finish: () => jatos.endStudy(jsPsych.data.get().json())
});

const RPS = ["Rock", "Paper", "Scissors"]

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

const compute_result = function(p0, p1) {
    if (p0 == p1) {
        var s = "<p>draw</p>";
    } else if ("0120".includes(String(p0) + String(p1))) {
        var s = "<p>win</p>";
    } else if ("0210".includes(String(p0) + String(p1))) {
        var s = "<p>loss</p>";
    }
    return s
}

const fixation = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        var trials = jsPsych.data.get()['trials']
        try {
            var bot_response = trials[trials.length - 1]['bot_response'];
            var prev_response = trials[trials.length - 1]['response'];
            var s = compute_result(bot_response, prev_response);
            return s + `<p>You responded ${RPS[prev_response]}, bot ${RPS[bot_response]}</p>`;
        } catch (err) {
            if (err  instanceof TypeError){
                return `<p>Please click X to start the first trial.</p>`;
            }
            console.log(err)
            return `<p>Please click Y to start the first trial.</p>`;
        }

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
        bot_response: function() {
            var bot_response = Math.floor(Math.random() * 3);
            return bot_response
        }
    },
    button_html: '<button class="jspsych-btn-%pos%" accesskey="%scut%">%choice%</button>',
}

var trial = {
    timeline: [fixation, countdown, decision]
}

const timeline = [trial, trial, trial, fixation];

jatos.onLoad(() => {
    jatos.addAbortButton();
    jsPsych.run(timeline);
});
