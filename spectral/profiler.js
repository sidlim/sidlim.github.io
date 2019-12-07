// Button/interactivity setup:
let btn1 = document.createElement('button');
document.body.appendChild(btn1);
btn1.innerText = "Start Profiling"

let btn2 = document.createElement('button');
btn2.innerText = "Sample Sound/Create Instrument"

// spec Setup:
let spec = document.createElement("canvas");
document.body.appendChild(spec);
//spec.height = document.body.offsetHeight;
spec.height = 300;
spec.width = document.body.offsetWidth;
let visCtx = spec.getContext("2d");

// Audio Setup:
let audCtx = new AudioContext();
let analyzer = audCtx.createAnalyser();
MediaDevices.getUserMedia({audio: true, video: false}).then(
    function(stream) {
        let source = audCtx.createMediaStreamSource(stream);
        source.connect(analyzer);
    }
);
btn1.addEventListener("click", function() {
    audCtx.resume();
    document.body.appendChild(btn2);
    btn2.addEventListener("click", function() {
        var samples = sample_sound();

        setTimeout(make_instrument, 1000);
        
        function make_instrument() {
            var wave = create_waveform(samples);

            let container = document.createElement("div");
            document.body.appendChild(container);
            var f_0 = 130;

            var playing = [];

            playtone = function(e) {
                e.target.className = "key active";
                let freq = parseFloat(e.target.dataset.frequency);
                let osc = createOscillator(wave, freq);
                playing[freq] = osc;
                osc.start()
                console.log(freq);
            }

            endtone = function(e) {
                e.target.className = "key"
                let freq = e.target.dataset.frequency;
                playing[freq].stop();
            }

            for (let i = 0; i < 24; i++) {
                var key = document.createElement('div')
                key.className = 'key';
                container.appendChild(key);
                key.dataset['frequency'] = f_0 * Math.pow(2, i / 12);

                key.addEventListener('mousedown', playtone);
                key.addEventListener('touchstart', playtone);
                key.addEventListener('mouseup', endtone);
                key.addEventListener('touchend', endtone);
            }

            mapKeys(5);
        }
    })
})
analyzer.fftSize = 2048;
let fft_buf = new Float32Array(analyzer.frequencyBinCount);
let wav_buf = new Float32Array(analyzer.frequencyBinCount);

function getFunFreq(MIN_SAMPLES = 0, r_thresh = 0.9) {
    var SIZE = wav_buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_r = 0;
	var rms = 0;
	var foundGoodr = false;
	var rs = new Array(MAX_SAMPLES);

	for (var i=0;i<SIZE;i++) {
		var val = wav_buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var lastr=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var r = 0;

		for (var i=0; i<MAX_SAMPLES; i++) {
			r += Math.abs((wav_buf[i])-(wav_buf[i+offset]));
		}
		r = 1 - (r/MAX_SAMPLES);
		rs[offset] = r; // store it, for the tweaking we need to do below.
		if ((r>r_thresh) && (r > lastr)) {
			foundGoodr = true;
			if (r > best_r) {
				best_r = r;
				best_offset = offset;
			}
		} else if (foundGoodr) {
			// short-circuit - we found a good r, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on rs[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodr cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (rs[best_offset+1] - rs[best_offset-1])/rs[best_offset];  
			return audCtx.sampleRate/(best_offset+(8*shift));
		}
		lastr = r;
	}
	if (best_r > 0.01) {
		return audCtx.sampleRate/best_offset;
	}
	return -1;

}

function getAmp(frequency) {
    return(fft_buf[getInd(frequency)])
}

function getInd(frequency) {
    return(Math.round(2 * fft_buf.length * frequency / (audCtx.sampleRate)))
}

function getFreq(index) {
    return(index * audCtx.sampleRate / (2 * fft_buf.length))
}

function getHarmonics(freq, n) {
    
    var profile = []

    for (let i = 1; i < n; i++) {
        profile.push(getAmp(i * freq))
    }

    return profile

}

function sample_sound(n_harmonics = 10, n_samples = 10, time = 500) {
    let freq = getFunFreq()
    let samples = []
    let time_interval = time / n_samples

    for (i = 0; i < n_samples; i++) {
        setTimeout(function() {
            samples.push(getHarmonics(getFunFreq(), n_harmonics))
        }, i * time_interval);
    }

    return(samples)

}

function create_waveform(samples) {
    let profile_real = new Float32Array(samples[0].length);
    let profile_imag = new Float32Array(samples[0].length);
    for (let i = 0; i < samples[0].length; i++) {
        var amp = 0
        for (let j = 0; j < samples.length; j++) {
            amp += samples[j][i];
        }
        profile_real[i] = (amp / samples.length)
        profile_imag[i] = 0
    }

    for (let i = 0; i < profile_real.length; i++) {
        if (isNaN(profile_real[i])) {
            profile_real[i] = 0;
        }
    }

    return(audCtx.createPeriodicWave(profile_real, profile_imag))
}

function createOscillator(waveform, frequency) {
    let osc = audCtx.createOscillator();
    osc.setPeriodicWave(waveform);
    osc.frequency.value = frequency;
    osc.connect(audCtx.destination);
    return(osc)
}

function draw() {
    requestAnimationFrame(draw);
    analyzer.getFloatFrequencyData(fft_buf);
    analyzer.getFloatTimeDomainData(wav_buf);

    freq = getFunFreq();

    harmonic_ind = [];
    for (let i = 1; i < 10; i++) {
        harmonic_ind.push(getInd(i * freq))
    }

    barWidth = spec.width / analyzer.frequencyBinCount;
    visCtx.fillStyle = "rgb(0,0,0)";
    visCtx.clearRect(0, 0, spec.width, spec.height);

    let x = 0;
    let y = spec.height;
    let offset = Math.min(...fft_buf);
    let intensity = fft_buf.map(x => (x - offset));
    for (let i = 0; i < analyzer.frequencyBinCount; i++) {
        if (harmonic_ind.includes(i) && freq != -1) {
            visCtx.fillStyle = "rgb(200,0,0)";
        }
        else {
            visCtx.fillStyle = "rgb(0,0,0)";
        }
        visCtx.fillRect(x, y - intensity[i], barWidth, intensity[i]);
        x += barWidth;
    }
}

function mapKeys(base) {
    var target_div = document.getElementsByClassName('key');

    var key_note_mapping = { "a": -5,
                "s": -2,
                "d": 0,
                "f": 2,
                "g": 3,
                "h": 5,
                "j": 7,
                "k": 8,
                "l": 12}

    var key_status = { "a": false,
                "s": false,
                "d": false,
                "f": false,
                "g": false,
                "h": false,
                "j": false,
                "k": false,
                "l": false}

    function keydown (e) {
        key = String.fromCharCode(e.keyCode).toLowerCase();
        if ((typeof(key_note_mapping[key]) != "undefined") && !key_status[key]) {
            active_key = target_div[base + key_note_mapping[key]]
            key_status[key] = true;
            triggerMouseEvent(active_key, "mousedown");
        }
    }

    function keyup (e) {
        key = String.fromCharCode(e.keyCode).toLowerCase();
        if ((typeof(key_note_mapping[key]) != "undefined") && key_status[key]) {
            active_key = target_div[base + key_note_mapping[key]]
            key_status[key] = false;
            triggerMouseEvent(active_key, "mouseup");
        }
    }

    function triggerMouseEvent (node, eventType) {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    }

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
}

requestAnimationFrame(draw);