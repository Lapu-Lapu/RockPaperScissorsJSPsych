var jsPsych = initJsPsych({
    on_finish: function() {
        //console.log(jsPsych.data.get().json());
        jatos.submitResultData(jsPsych.data.get().json());
        jatos.endStudy();
    },
    show_progress_bar: true,
    message_progress_bar: 'Fortschritt'
});

const RPS = randomize(["R", "P", "S"]);
const rps2idx = Object.assign(
    {}, ..._.zip(RPS, [0, 1, 2]).map((x) => ({[x[0]]: x[1]}))
);
const RPS2words = {
    "R": "Stein",
    "P": "Papier",
    "S": "Schere"
};
console.log(RPS)
const countdown_time = 1500; // in milliseconds
const N = 200;

const group = (Math.random() < 0.5) ? 1 : 2
const instructions = (group == 1) ? instructions1 : instructions2

const timeline = []

var survey = {
  type: jsPsychSurvey,
  pages: [
    [
      {
        type: 'multi-choice',
        prompt: "Haben Sie bewusst eine Spielstrategie angewendet?",
        name: 'SpielstrategieQ',
        options: ['Nein.', 'Ja, ich habe versucht möglichst zufällig zu spielen.',
            'Ja, ich habe mein Symbol nach jedem Spielzug geändert.',
            'Ja, ich habe immer das Symbol gewählt, das im vorherigen Spielzug gewonnen hätte.',
            'Ja, andere Strategie (bitte unten angeben).'],
        required: true
      },
      {
        type: 'text',
        prompt: "Andere Strategie:",
        name: 'freieStrategieQ',
        textbox_rows: 8,
        required: false,
      }
    ]
  ],
};

var count = {
    win: 0,
    loss: 0,
    draw: 0,
    total: 0,
}


const translate = {
    win: "<div style='color:#006600;'>Gewonnen! :-)</div>",
    loss: "<div style='color:#FF0000;'>Verloren :-(</div>",
    draw: "<div>Unentschieden</div>"
}

const update_count = function (result) {
    console.log(count);
    count[result] = count[result] + 1;
    count.total = count.total + 1;
}

//////////////////////////// strategies //////////////////////////////////

const nash_equilibrium_strategy = function() {
    var bot_response = Math.floor(Math.random() * 3);
    return RPS[bot_response]
}

const winstay = function() {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.bot_response))
    d = data[data.length-1]
    if (!Boolean(d)) { return RPS[Math.floor(Math.random() * 3)]; }
    if ("win" == compute_result(d.response, d.bot_response)) {
        console.log(`bot stays with ${d.bot_response}`)
        return d.bot_response
    } else {
        var idxs = new Set([0, 1, 2])
        idxs.delete(rps2idx[d.bot_response])
        var arr = Array.from(idxs)
        var r = Math.floor(Math.random() * 2);
        console.log(`sad bot shifts: select between ${arr}`)
        return RPS[arr[r]]
    }
}

const super_male_strategy = function () {
    return "R"
}

const rotate_strategy = function () {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.bot_response))
    d = data[data.length-1]
    if (!Boolean(d)) {
        return RPS[Math.floor(Math.random() * 3)];
    }
    var r = (rps2idx[d.bot_response] + 1 ) % 3
    return RPS[r];
}

const learn_preference = function() {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.bot_response))
    d = data[data.length-1]
    if (!Boolean(d)) { return RPS[Math.floor(Math.random() * 3)]; }
    var scounts = range(0, 2).map((i) => data.map((x) => rps2idx[x.response] == i).reduce((a, b) => a+b, 0))
    scounts = scounts.map((x)=>x+1)
    p = scounts.map((x)=>x/(scounts.reduce(add, 0)))
    var prediction = RPS[sample(p)]
    console.log(`p: ${p}`)
    return beat_symbol[prediction];
}

const dont_always_copy_opponent_move = function () {
    var data = jsPsych.data.get().trials.filter(d => Boolean(d.bot_response))
    d = data[data.length-1]
    if (!Boolean(d)) { return RPS[Math.floor(Math.random() * 3)]; }
    result = compute_result(d.response, d.bot_response)
    if ("loss" == result) {
        // return (d.response + 1 ) % 3;
        return beat_symbol[d.response];
    } else if ("win" == result) {
        // return lose_symbol[d.response]; // better if player just switches
        return d.response;  // better if player uses bots previous
    } else {
        return RPS[Math.floor(Math.random() * 3)]; 
    }
} // https://www.kaggle.com/code/mainakchain/rps-getting-started-with-researched-winning-logic

const strategies = [super_male_strategy, nash_equilibrium_strategy, winstay, rotate_strategy, learn_preference, dont_always_copy_opponent_move];
const sampled_strategy = Math.floor(Math.random() * strategies.length - 1) + 1;
//const sampled_strategy = 4;
console.log('strategy:');
console.log(sampled_strategy);
//const strategy = dont_always_copy_opponent_move;
const strategy = strategies[sampled_strategy];
const fixation_cross = '<div style="font-size:20px;"><b>+</b></div>';

//////////////////// jsPsych Trials ////////////////////////////////////////////////////

const start = {
    type: jsPsychHtmlButtonResponseRPS,
    stimulus: `<p>.</p><p>Klicken Sie auf ${fixation_cross} um die erste Runde zu starten.</p>`,
    choices: [fixation_cross],
    data: {strategy: sampled_strategy},
    button_html: '<button class="jspsych-btn-fixation">%choice%</button>',
    on_start: function () {
        document
            .querySelector(".jspsych-display-element")
            .insertAdjacentHTML("afterbegin", '<div id="statistics-container">' + "<p><span id='wins'>Runde 0 von 200.<br>Gewonnen: 0, Verloren: 0, Unentschieden: 0</span></p>"
            );
    }
}

const fixation = {
    type: jsPsychHtmlButtonResponseRPS,
    stimulus: function() {
        var trials = jsPsych.data.get()['trials']
        var bot_response = trials[trials.length - 1]['bot_response'];
        var prev_response = trials[trials.length - 1]['response'];
        var result = compute_result(bot_response, prev_response)
        update_count(result)
        var win_percent = (100*count.win/(count.win+count.loss)).toFixed(1)
        document.querySelector("#wins").innerHTML = `Runde ${count.total} von 200.<br>Gewonnen: ${count.win}, Verloren: ${count.loss}, Unentschieden: ${count.draw} (${win_percent}%)`;
        // return `<p>.</p><p>Sie haben ${RPS[prev_response]} gewählt, der Gegner ${RPS[bot_response]}.</p><p>${result}</p>`;
        return `<p>.</p><p>Sie haben ${RPS2words[prev_response]} ${rps_emoji[prev_response]}<br>gewählt, der Gegner ${RPS2words[bot_response]} ${rps_emoji[bot_response]}</p><p>${translate[result]}</p>`;
    },
    choices: [fixation_cross],
    button_html: '<button class="jspsych-btn-fixation">%choice%</button>'
}

var countdown = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p><span id="clock"></span>',
    trial_duration: countdown_time,
    on_start: function() {
        var wait_time = countdown_time;
        var start_time = performance.now();
        var interval = setInterval(function() {
            var time_left = wait_time - (performance.now() - start_time);
            document.querySelector('#clock').innerHTML = sec2rps(time_left)
            if (time_left <= 0) {
                // console.log("stop countdown")
		document.querySelector('#clock').innerHTML = "";
                clearInterval(interval);
            }
        }, 400)
    }
}

const idx2pos = Object.assign(
    {}, ..._.zip(RPS, ["topleft", "topright", "bottom"]).map((x) => ({[x[0]]: x[1]}))
)

const idx2key = Object.assign(
    {}, ..._.zip(RPS, ["g", "h", "b"]).map((x) => ({[x[0]]: x[1]}))
)

const decision = {
    type: jsPsychHtmlButtonResponseRPS,
    stimulus: '<p></p>',
    choices: RPS,
    data: {
        bot_response: strategy
    },
    on_finish: function() {
        // console.log(jsPsych.data.get().json());
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

// const timeline = [fullscreen_trial]
var consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: consent_msg,
    choices: ["Ich stimme zu."],
}
timeline.push(consent)

var welcome = {
      type: jsPsychHtmlButtonResponse,
      stimulus: instructions,
      choices: ['Experiment starten!']
};
timeline.push(welcome)

timeline.push(start)
timeline.push(...Array.from(".".repeat(N)).map(() => trial));
// const timeline = Array.from(".".repeat(N)).map(() => trial);

timeline.push(survey)

jatos.onLoad(() => {
    // jatos.addAbortButton();
    jsPsych.run(timeline);
});
