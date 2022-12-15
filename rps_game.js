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

const fixation = {
  type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        var trials = jsPsych.data.get()['trials']
        try {
            var prev_response = trials[trials.length - 1]['response']
            return `<p>You responded ${RPS[prev_response]}</p>`;
        } catch (err) {
            return `<p>Please click X to start the first trial.</p>`;
        }

    },
  choices: ['X'],
  button_html: '<button class="jspsych-btn-fixation">%choice%</button>'
}

var countdown = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p><span id="clock"></span>',
  trial_duration: 3000,
  on_start: function(){
    var wait_time = 1 * 3 * 1000; // in milliseconds
    var start_time = performance.now();
    var interval = setInterval(function(){
      var time_left = wait_time - (performance.now() - start_time);
      document.querySelector('#clock').innerHTML = sec2rps(time_left)
      if(time_left <= 0){
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
  button_html: '<button class="jspsych-btn-%pos%" accesskey="%scut%">%choice%</button>',
}

var trial = {
    timeline: [ fixation, countdown, decision]
}

const timeline = [trial, trial, trial];

jatos.onLoad(() => {
  jatos.addAbortButton();
  jsPsych.run(timeline);
});
