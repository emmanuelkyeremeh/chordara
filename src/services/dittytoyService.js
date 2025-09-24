import { Dittytoy, MSG_INIT, MSG_UPDATE, MSG_NOTE_PLAYED, MSG_ERROR, MSG_LOG, MSG_PLAY, MSG_PAUSE, MSG_STOP, MSG_RESUME } from 'dittytoy';
import { uploadToCloudinary, deleteAudioFromCloudinary } from './cloudinary.js';
import { db } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

// Dittytoy import - minimal logging

class DittytoyService {
  constructor() {
    this.isInitialized = false;
    this.dittytoy = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    this.totalDuration = 0;
    this.progressCallback = null;
    this.noteCallback = null;
    this.errorCallback = null;
    this.updateCallback = null;
    this.isRecording = false;
    this.recordedAudio = null;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Dittytoy requires a browser environment');
      }

      // Check for Web Audio API support
      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Web Audio API not supported in this browser');
      }

      // Check if Dittytoy is properly imported
      if (!Dittytoy) {
        throw new Error('Dittytoy library not properly imported');
      }

      try {
        this.dittytoy = new Dittytoy();
        
        // Check if required methods exist
        if (typeof this.dittytoy.compile !== 'function') {
          throw new Error('Dittytoy instance missing compile method');
        }
        if (typeof this.dittytoy.play !== 'function') {
          throw new Error('Dittytoy instance missing play method');
        }
        if (typeof this.dittytoy.stop !== 'function') {
          throw new Error('Dittytoy instance missing stop method');
        }
        if (typeof this.dittytoy.addListener !== 'function') {
          throw new Error('Dittytoy instance missing addListener method');
        }
        
        // Dittytoy instance methods verified
      } catch (constructorError) {
        console.error('🎵 Dittytoy constructor failed:', constructorError);
        throw new Error(`Failed to create Dittytoy instance: ${constructorError.message}`);
      }
      
      // Set up event listeners
      this.dittytoy.addListener(MSG_NOTE_PLAYED, (data) => {
        if (this.noteCallback) {
          this.noteCallback(data);
        }
      });

      this.dittytoy.addListener(MSG_ERROR, (data) => {
        console.error('Dittytoy error:', data);
        if (this.errorCallback) {
          this.errorCallback(data);
        }
      });

      this.dittytoy.addListener(MSG_UPDATE, (data) => {
        this.currentTime = data.state?.time || 0;
        if (this.updateCallback) {
          this.updateCallback(data);
        }
      });

      // Add initialization listener
      this.dittytoy.addListener(MSG_INIT, (data) => {
        // Dittytoy initialized successfully
      });

      // Add other event listeners
      this.dittytoy.addListener(MSG_LOG, (data) => {
        // Handle logs silently unless they're errors
      });

      this.dittytoy.addListener(MSG_PLAY, () => {
        // Started playing
      });

      this.dittytoy.addListener(MSG_PAUSE, () => {
        // Paused
      });

      this.dittytoy.addListener(MSG_STOP, () => {
        // Stopped
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Dittytoy:', error);
      throw error;
    }
  }

  // Generate dittytoy code from musical patterns
  generateDittytoyCode(patterns, instructions) {
    const { tempo, key, style, mood } = instructions;
    const { melody, drums, bass } = patterns;

    // Set BPM and add utility functions
    let dittyCode = `ditty.bpm = ${tempo};

// Utility functions for better sound shaping
function softclip(x) {
    return x < -1 ? -1 : x > 1 ? 1 : 1.5*(1 - x*x/3)*x;
}

function varsaw(p, formant) {
    let x = p%1;
    return (x - 0.5) * softclip(formant*x*(1-x));
}

function fract(x) {
    return x - Math.floor(x);
}

function triangle(x) {
    return Math.abs(fract(x + .5) - .5) * 2;
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

`;

    // Add advanced effects
    dittyCode += this.generateAdvancedEffects();
    
    // Add custom synth definitions
    dittyCode += this.generateCustomSynths();

    // Generate melody loop with more realistic patterns
    if (melody && melody.length > 0) {
      dittyCode += `// Melody loop with loop counter for structure
loop((lc) => {
`;
      
      // Create pattern variations based on loop counter
      dittyCode += `  var patterns = [
    {p:[${this.generateMelodyPattern(melody, 0)}], d:[${this.generateDurationPattern(melody, 0)}]},
    {p:[${this.generateMelodyPattern(melody, 1)}], d:[${this.generateDurationPattern(melody, 1)}]},
    {p:[${this.generateMelodyPattern(melody, 2)}], d:[${this.generateDurationPattern(melody, 2)}]}
  ];
  var pattern = patterns[lc % patterns.length];
  
  for(var i = 0; i < pattern.p.length; ++i) {
    var r = Math.random() * .05; // Human-like timing variation
    sleep(r);
    synth1.play(pattern.p[i], {duration: pattern.d[i]/3 - .1 * Math.random(), release: .1});
    sleep(pattern.d[i]/3 - r);
  }
`;
      
      dittyCode += `}, { name: 'melody' }).connect(echo.create());

`;
    }

    // Generate bass loop with enhanced bass synth
    if (bass && bass.length > 0) {
      dittyCode += `// Enhanced bass loop with varsaw and dynamic filtering
loop((lc) => {
  var patterns = [
    {p:[${this.generateBassPattern(bass, 0)}], d:[${this.generateBassDurationPattern(bass, 0)}]},
    {p:[${this.generateBassPattern(bass, 1)}], d:[${this.generateBassDurationPattern(bass, 1)}]},
    {p:[${this.generateBassPattern(bass, 2)}], d:[${this.generateBassDurationPattern(bass, 2)}]}
  ];
  var pattern = patterns[lc % patterns.length];
  
  for(var i = 0; i < pattern.p.length; ++i) {
    var r = Math.random() * .05;
    sleep(r);
    bass.play(pattern.p[i], {duration: pattern.d[i]/3 - .1 * Math.random(), release: .1});
    sleep(pattern.d[i]/3 - r);
  }
}, { name: 'bass' });

`;
    }

    // Add harmony layer for more realistic sound
    if (melody && melody.length > 0) {
      dittyCode += `// Harmony layer with strings
loop((lc) => {
  var patterns = [
    {p:[${this.generateHarmonyPattern(melody, 0)}]},
    {p:[${this.generateHarmonyPattern(melody, 1)}]},
    {p:[${this.generateHarmonyPattern(melody, 2)}]}
  ];
  var pattern = patterns[lc % patterns.length];
  
  if(pattern && pattern.p.length > 0) {
    for(var i = 0; i < pattern.p.length; ++i) {
      strings.play(pattern.p[i]-12, {duration: 8});
      sleep(.05);
    }
    sleep(8-pattern.p.length*.05);
  } else {
    sleep(8);
  }
}, { name: 'harmony' }).connect(phaser.create()).connect(echo.create());

`;
    }

    // Add realistic drum patterns with enhanced percussion
    if (drums && drums.length > 0) {
      dittyCode += `// Enhanced drum patterns with realistic percussion
const beat = [
    ['x....xx..x.x', bassdrum],
    ['..x..x..x..x', smallbongo],
    ['x.....x..x..', largebongo],
    ['.........x.x', conga],
    ['...x.....x..', rimshot],
    ['xxxxxxxxxxxx', hihat],
    ['..x.........', cymbal],
    ['.. .. .. x. ', quijada]
];

loop(() => {
    for(var i = 0; i < 12; ++i) {
        for(var j = 0; j < beat.length; ++j) {
            if(beat[j][0][i] == 'x') {
                beat[j][1].play();
            }
        }
        sleep(1/3);
    }
}, { name: 'drums' });

`;
    }

    // Add atmospheric noise layer
    dittyCode += `// Atmospheric noise layer
loop(() => {
    var pat = [
        0,0,
        0,0,0,
        0,0,0,0,
        1,1,1,1,
        1,1,1,1,
        0,0,0,
        0,0,0,
        1,0,0,
        0,0,0,0,
        1,1,1,1,
        0,0,0,
        0,0,0,
        1,0,0,
        1,0,0,
        1,0,0,
        1,0,0,
        1,0,0];
    for(var i = 0; i < pat.length; ++i) {
        sleep(4);
        if(pat[i]) {
            noise.play(0,{duration:1, pan: -.8});
            sleep(1);
            noise.play(1,{duration:1, pan: .8});
            sleep(3);
        }
        else
            sleep(4);
    }
}, {name: 'noise'});

`;

    // Add pluck layer for additional texture
    if (melody && melody.length > 0) {
      dittyCode += `// Pluck layer for additional texture
loop((lc) => {
  var patterns = [
    {p:[${this.generatePluckPattern(melody, 0)}], a:[${this.generatePluckAccentPattern(melody, 0)}]},
    {p:[${this.generatePluckPattern(melody, 1)}], a:[${this.generatePluckAccentPattern(melody, 1)}]},
    {p:[${this.generatePluckPattern(melody, 2)}], a:[${this.generatePluckAccentPattern(melody, 2)}]}
  ];
  var pattern = patterns[(lc>>1) % patterns.length];
  
  for(var i = 0; i < pattern.p.length; ++i) {
    pluck.play(pattern.p[i], {duration: .1, cutoff: .2 + pattern.a[i] * .4});
    sleep(1/3);
  }
}, { name: 'pluck' }).connect(echo.create());

`;
    }

    // Validate the generated code
    dittyCode = this.validateDittytoyCode(dittyCode);
    
    return dittyCode;
  }

  // Generate a simple, guaranteed-to-work Dittytoy code
  generateSimpleDittytoyCode(patterns, instructions) {
    const { tempo, style } = instructions;
    
    let simpleCode = `ditty.bpm = ${tempo};

// Simple melody
loop(() => {
  sine.play(c4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.7 });
  sleep(1);
  sine.play(e4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.7 });
  sleep(1);
  sine.play(g4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.7 });
  sleep(1);
  sine.play(c5, { attack: 0.01, release: 0.25, duration: 1, amp: 0.7 });
  sleep(1);
}, { name: 'melody' });

// Simple bass
loop(() => {
  sine.play(c2, { attack: 0.02, release: 0.5, duration: 2, amp: 0.8 });
  sleep(2);
  sine.play(g2, { attack: 0.02, release: 0.5, duration: 2, amp: 0.8 });
  sleep(2);
}, { name: 'bass' });

// Simple rhythm using sine waves
loop(() => {
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.3 });
  sleep(1);
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.2 });
  sleep(1);
}, { name: 'rhythm' });`;

    console.log('🎵 Generated simple Dittytoy code');
    return simpleCode;
  }

  // Generate a basic Dittytoy code when no patterns/instructions are available
  generateBasicDittytoyCode() {
    return `ditty.bpm = 120;

// Basic melody
loop(() => {
  sine.play(c4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
  sine.play(e4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
  sine.play(g4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
  sine.play(c5, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
}, { name: 'melody' });

// Basic rhythm using sine waves
loop(() => {
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.4 });
  sleep(1);
}, { name: 'rhythm' });`;
  }

  // Test basic Dittytoy functionality
  async testBasicFunctionality() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Test with the simplest possible code that includes a loop
      const minimalCode = `ditty.bpm = 120;

loop(() => {
  sine.play(c4, { attack: 0.01, release: 0.25, duration: 0.5, amp: 0.3 });
  sleep(1);
}, { name: 'test' });`;
      
      await this.dittytoy.compile(minimalCode);
      this.dittytoy.stop();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Test melody and bass without drums
  async testMelodyAndBass() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const testCode = `ditty.bpm = 120;

// Test melody
loop(() => {
  sine.play(c4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
  sine.play(e4, { attack: 0.01, release: 0.25, duration: 1, amp: 0.5 });
  sleep(1);
}, { name: 'melody' });

// Test bass
loop(() => {
  sine.play(c2, { attack: 0.02, release: 0.5, duration: 2, amp: 0.6 });
  sleep(2);
}, { name: 'bass' });`;
      
      await this.dittytoy.compile(testCode);
      this.dittytoy.stop();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper function to group notes by time
  groupNotesByTime(notes) {
    const grouped = {};
    notes.forEach(note => {
      const time = note.time || 0;
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(note);
    });

    return Object.keys(grouped)
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .map(time => ({
        time: parseFloat(time),
        notes: grouped[time]
      }));
  }

  // Convert duration notation to dittytoy duration
  convertDuration(duration) {
    const durationMap = {
      '1n': 4,      // whole note
      '2n': 2,      // half note
      '4n': 1,      // quarter note
      '8n': 0.5,    // eighth note
      '16n': 0.25,  // sixteenth note
      '32n': 0.125, // thirty-second note
      '1t': 2.67,   // whole note triplet
      '2t': 1.33,   // half note triplet
      '4t': 0.67,   // quarter note triplet
      '8t': 0.33,   // eighth note triplet
    };
    
    return durationMap[duration] || 1;
  }

  // Convert note names to Dittytoy format (e.g., 'C4' -> 'c4')
  convertNoteToDittytoy(note) {
    if (!note) return 'c4';
    
    // Convert to lowercase and handle sharps/flats
    let dittyNote = note.toLowerCase();
    
    // Handle common note formats
    const noteMap = {
      'c#': 'cs', 'd#': 'ds', 'f#': 'fs', 'g#': 'gs', 'a#': 'as',
      'db': 'cs', 'eb': 'ds', 'gb': 'fs', 'ab': 'as', 'bb': 'as'
    };
    
    // Replace sharps and flats
    Object.keys(noteMap).forEach(key => {
      if (dittyNote.includes(key)) {
        dittyNote = dittyNote.replace(key, noteMap[key]);
      }
    });
    
    return dittyNote;
  }

  // Get harmony note (5th above the given note)
  getHarmonyNote(note) {
    const noteMap = {
      'c': 'g', 'cs': 'gs', 'd': 'a', 'ds': 'as', 'e': 'b', 'f': 'c', 'fs': 'cs',
      'g': 'd', 'gs': 'ds', 'a': 'e', 'as': 'f', 'b': 'fs'
    };
    
    // Extract note and octave
    const match = note.match(/^([a-gs]+)(\d+)$/);
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const harmonyNote = noteMap[noteName] || noteName;
    const harmonyOctave = parseInt(octave) + 1;
    
    return `${harmonyNote}${harmonyOctave}`;
  }

  // Convert drum instruments to Dittytoy format
  convertDrumToDittytoy(instrument) {
    // Based on Dittytoy documentation, only these drum types are available
    const supportedDrums = ['kick', 'snare', 'hihat', 'openhat'];
    const drumMap = {
      'kick': 'kick',
      'snare': 'snare', 
      'hihat': 'hihat',
      'openhat': 'openhat',
      // Map unsupported drums to supported ones
      'crash': 'hihat',     // crash -> hihat
      'clap': 'snare',      // clap -> snare
      'tom': 'snare',       // tom -> snare
      'ride': 'hihat',      // ride -> hihat
      'cymbal': 'hihat'     // cymbal -> hihat
    };
    
    const mappedDrum = drumMap[instrument] || 'kick';
    
    // Double-check that we're using a supported drum type
    if (!supportedDrums.includes(mappedDrum)) {
      console.warn(`🎵 Warning: ${mappedDrum} is not a supported drum type, falling back to kick`);
      return 'kick';
    }
    
    return mappedDrum;
  }

  // Validate Dittytoy code - basic validation for now
  validateDittytoyCode(code) {
    // Basic validation - ensure we're not using any undefined drum types
    const unsupportedPatterns = ['kick\.play', 'snare\.play', 'hihat\.play', 'openhat\.play'];
    
    unsupportedPatterns.forEach(pattern => {
      if (code.includes(pattern)) {
        console.warn(`🎵 Found unsupported drum pattern: ${pattern}. This may cause errors.`);
      }
    });
    
    return code;
  }

  // Get root note for key
  getRootNote(key) {
    const keyMap = {
      'C': 'c',
      'G': 'g',
      'D': 'd',
      'A': 'a',
      'E': 'e',
      'B': 'b',
      'F#': 'fs',
      'F': 'f',
      'Bb': 'as',
      'Eb': 'ds',
      'Ab': 'as',
      'Db': 'cs',
      'Gb': 'fs'
    };
    
    return keyMap[key] || 'c';
  }

  // Generate advanced effects (echo, phaser, filters)
  generateAdvancedEffects() {
    return `
// Advanced effects
class Delayline {
    constructor(n) {
        this.n = ~~n;
        this.p = 0;
        this.lastOutput = 0;
        this.data = new Float32Array(n);
    }
    clock(input) {
        this.lastOutput = this.data[this.p];
        this.data[this.p] = input;
        if(++this.p >= this.n) {
            this.p = 0;
        }
    }
    tap(offset) {
        var x = this.p - offset - 1;
        x %= this.n;
        if(x < 0) {
            x += this.n;
        }
        return this.data[x];
    }
}

input.echo = .8;
const echo = filter.def(class {
    constructor(options) {
        this.lastOutput = [0, 0];
        var time = 60 / ditty.bpm;
        time /= 2;
        var n = Math.floor(time / ditty.dt);
        this.delay = [new Delayline(n), new Delayline(n)];
        this.dside = new Delayline(500);
        this.kfbl = .5;
        this.kfbr = .7;
    }
    process(inv, options) {
        this.dside.clock(inv[0]);
        var new0 = (this.dside.lastOutput + this.delay[1].lastOutput) * this.kfbl;
        var new1 = (inv[1] + this.delay[0].lastOutput) * this.kfbr;
        this.lastOutput[0] = inv[0] + this.delay[0].lastOutput * input.echo;
        this.lastOutput[1] = inv[1] + this.delay[1].lastOutput * input.echo;
        this.delay[0].clock(new0);
        this.delay[1].clock(new1);
        var m = (this.lastOutput[0] + this.lastOutput[1])*.5;
        var s = (this.lastOutput[0] - this.lastOutput[1])*.5;
        s *= 2;
        return [m+s, m-s];
    }
});

var phaser = filter.def(class {
    constructor(opt) {
        this.stages = [[], []];
        this.n = 4;
        this.lastOut = [0, 0];
        this.p = 0;
        this.feedback = .5;
        this.speed = .1;
        this.mix = .5;
        this.fc = .0;
        for(var i = 0; i < this.n; ++i) {
            this.stages[0].push({z: 0, ap: 0});
            this.stages[1].push({z: 0, ap: 0});
        }
    }
    __allpass(s, input, a) {
        var z = input - a * s.z;
        s.ap = s.z + a * z;
        s.z = z;
        return s.ap;
    }
    process(inv, opt) {
        var vl = inv[0] + clamp(this.stages[0][this.n-1].ap * this.feedback, -1, 1);
        var vr = inv[1] + clamp(this.stages[1][this.n-1].ap * this.feedback, -1, 1);
        var lfo = (2**triangle(this.p))*.5-1.4;
        this.p += ditty.dt * this.speed;
        for(var i = 0; i < this.n; ++i) {
            vl = this.__allpass(this.stages[0][i], vl, lfo);
            vr = this.__allpass(this.stages[1][i], vr, lfo);
        }
        vl = lerp(inv[0], vl, this.mix);
        vr = lerp(inv[1], vr, this.mix);
        return [vl, vr];
    }
});

const LOWPASS = 'lp';
const BANDPASS = 'bp';
const HIGHPASS = 'hp';
class SVF {
    constructor(opt) {
        this.mode = opt ? opt.mode || LOWPASS : LOWPASS;
        this.stages = opt ? opt.stages || 2 : 2;
        this.states = [];
        for(var i = 0; i < this.stages; ++i) {
            this.states.push({lp:0, hp:0, bp:0});
        }
        this.kf = opt && opt.kf ? opt.kf : 0.1;
        this.kq = opt && opt.kq ? opt.kq : 1.5;
        this.run = (state, input, kf, kq) => {
            var lp, hp, bp;
            lp = state.lp + kf * state.bp;
            hp = input - lp - kq * state.bp;
            bp = state.bp + kf * hp;
            state.lp = lp;
            state.hp = hp;
            state.bp = bp;
        };
    }
    process(input) {
        for(var i = 0, ni = this.states.length; i < ni; ++i) {
            const state = this.states[i];
            this.run(state, input, this.kf, this.kq);
            this.run(state, input, this.kf, this.kq);
            input = state[this.mode];
        }
        return input;
    }
}

`;
  }

  // Generate custom synth definitions
  generateCustomSynths() {
    return `
// Custom synth definitions
class Tank {
    constructor(opt) {
        this.t = 0;
    }
    process(note, env, tick, opt) {
        this.t += ditty.dt;
        return Math.sin(this.t * Math.PI * 2 * opt.freq) * env.value;
    }
}

class Analog {
    constructor(opt) {
        this.ops = [];
        for(var i = 0; i < opt.nuni; ++i) {
            var t = i / (opt.nuni-1);
            this.ops.push({p:Math.random(), p2: 0, po: Math.random()-.5, fl: t, fr:1-t});
        }
        this.c = 100 + 100 * Math.random();
        this.tshimmer = 0;
        this.detune = opt.detune;
        this.cutoff = opt.cutoff;
        this.fa = opt.fa;
        this.fd = opt.fd;
    }
    process(note, env, tick, opt) {
        var vl=0, vr=0;
        if(this.tshimmer >= 1) {
            this.tshimmer -= 1;
            for(var i = 0; i < this.ops.length; ++i) {
                var op = this.ops[i];
                op.po = Math.random()-.5;
            }
        }
        this.tshimmer += ditty.dt * 10;
        var cutoff = 4 + Math.min(1, tick / this.fa) * Math.exp(-Math.max(0, tick - this.fa) * this.fd) * this.cutoff * 100;
        for(var i = 0; i < this.ops.length; ++i) {
            var op = this.ops[i];
            var fbase = midi_to_hz(note + op.po * this.detune) * ditty.dt;
            var v = varsaw(op.p, cutoff * .008 / fbase);
            vl += v * op.fl;
            vr += v * op.fr;
            op.p += fbase;
            op.p2 += fbase * .5;
        }
        return [vl*env.value, vr*env.value];
    }
}

// Enhanced percussion synths
var quijada = synth.def(class {
    constructor(opt) {
        this.t = 0;
    }
    process(note, env, tick, opt) {
        this.t += ditty.dt;
        var p = ((this.t * 25 + .75) % 1) / 25; // pulses at 25Hz
        var p2 = ((this.t * 25) % 1) / 25; // pulses at 25Hz
        var v = Math.sin(p * Math.PI * 2 * 2700) * .6 ** Math.max(p * 2750 - 2, 0) * Math.exp(-this.t * 10); // ringing at 2.7kHz
        v -= (Math.sin(p2 * Math.PI * 2 * 2700) * .6 ** Math.max(p2 * 2750 - 2, 0)) * .25 * Math.exp(-this.t * 20); // ringing at 2.7kHz
        return v * env.value;
    }
}, { attack: .055, duration: 2.0 });

// Realistic drum sounds
var bassdrum = synth.def(Tank, {attack: .001, release: .165, duration: 0, freq: 65});
var conga = synth.def(Tank, {attack: .001, release: .165, duration: 0, freq: 195, amp: .5});
var smallbongo = synth.def(Tank, {attack: .001, release: .05, duration: 0, freq: 600, amp: .5});
var largebongo = synth.def(Tank, {attack: .001, release: .08, duration: 0, freq: 400, amp: .5});
var claves = synth.def(Tank, {attack: .001, release: .05, duration: 0, freq: 2200});
var rimshot = synth.def(Tank, {attack: .0005, release: .01, duration: 0, freq: 1860, amp: .3});
var hihat = synth.def((p, e, t, o) => (Math.random() - .5) * e.value, {release: .04, duration: 0, amp: .4});
var cymbal = synth.def((p, e, t, o) => (Math.random() - .5) * e.value, {release: .2, duration: 0, amp: .4});

// Enhanced bass synth
const bass = synth.def(class {
    constructor() {
        this.p = Math.random();
        this.c = 100 + 100 * Math.random();
    }
    process(note, env, tick, options) {
        this.p += midi_to_hz(note) * ditty.dt;
        return varsaw(this.p, 4 + (500 * Math.exp(-tick * 5) + 10 * env.value) * .1) * env.value;
    }
}, {attack:.01});

// Analog2 synth for more complex interactions
class Analog2 {
    constructor(opt) {
        if(!isFinite(opt.spread))
            opt.spread = .8;
        this.ops = [];
        for(var i = 0; i < opt.nuni; ++i) {
            var t = opt.nuni > 1 ? i / (opt.nuni-1) : .5;
            var t2 = opt.nuni > 1 ? i / (opt.nuni-1) : 0;
            this.ops.push({
                pha1:Math.random(),
                pha2: .5,
                pitch: t2*2-1,
                fl: lerp(.5,t,opt.spread),
                fr: lerp(.5,1-t, opt.spread)
            });
        }
        this.detune = opt.detune;
        this.c = 100 + 100 * Math.random();
        this.tshimmer = 0;
    }
    process(note, env, tick, opt) {
        var vl=0, vr=0;
        for(var i = 0; i < this.ops.length; ++i) {
            var op = this.ops[i];
            var fbase = midi_to_hz(note + op.pitch * this.detune) * ditty.dt;
            var osc1 = varsaw(op.pha1, .3 / fbase);
            var osc2 = varsaw(op.pha2, .5 / fbase);
            vl += osc1 * op.fl;
            vr += osc1 * op.fr;
            op.pha1 += fbase * (1.001+osc2*20);
            op.pha2 += fbase * .995;
        }
        return [vl*env.value, vr*env.value];
    }
}

// Noise synth for atmospheric effects
const noise = synth.def(class {
    constructor(opt) {
        this.flt = new SVF({kq: .7, mode: 'bp'});
    }
    process(note, env, tick, opt) {
        this.flt.kf = 2 ** (-1+Math.min(1, tick * 2) * .7 - tick * .4);
        return this.flt.process(Math.random() - .5) * env.value;
    }
}, {attack: .01, release: 8, cutoff: .3, amp: .12});

// Melodic synths
const pluck = synth.def(Analog, {nuni:2, cutoff: 0, fa: .01, fd: 30, detune: .3, amp: .3, release: .1, attack:.005});
const synth1 = synth.def(Analog, {nuni:4, cutoff: .3, fa: .15, fd: 4, detune: .3, amp: .3});
const synth2 = synth.def(Analog2, {nuni:2, attack: .001, cutoff: .3, fa: .15, fd: 4, detune: .1, amp: .25});
const strings = synth.def(Analog, {nuni:4, attack: 1, release: 3, cutoff: .3, fa: .01, fd: 0, detune: .5, amp: .1});

`;
  }

  // Generate melody pattern variations
  generateMelodyPattern(melody, variation) {
    if (!melody || melody.length === 0) {
      return 'c4,e4,g4,c5';
    }
    
    const notes = melody.slice(0, 4).map(note => this.convertNoteToDittytoy(note.note));
    
    // Create variations by transposing or changing notes
    switch (variation) {
      case 1:
        return notes.map(note => this.transposeNote(note, 2)).join(',');
      case 2:
        return notes.map(note => this.transposeNote(note, -2)).join(',');
      default:
        return notes.join(',');
    }
  }

  // Generate duration pattern for melody
  generateDurationPattern(melody, variation) {
    if (!melody || melody.length === 0) {
      return '1,1,1,1';
    }
    
    const durations = melody.slice(0, 4).map(note => this.convertDuration(note.duration));
    
    // Create variations by changing durations
    switch (variation) {
      case 1:
        return durations.map(d => d * 0.8).join(',');
      case 2:
        return durations.map(d => d * 1.2).join(',');
      default:
        return durations.join(',');
    }
  }

  // Generate bass pattern variations
  generateBassPattern(bass, variation) {
    if (!bass || bass.length === 0) {
      return 'c2,g2';
    }
    
    const notes = bass.slice(0, 2).map(note => this.convertNoteToDittytoy(note.note));
    
    // Create variations
    switch (variation) {
      case 1:
        return notes.map(note => this.transposeNote(note, 5)).join(',');
      case 2:
        return notes.map(note => this.transposeNote(note, -5)).join(',');
      default:
        return notes.join(',');
    }
  }

  // Generate bass duration pattern
  generateBassDurationPattern(bass, variation) {
    if (!bass || bass.length === 0) {
      return '2,2';
    }
    
    const durations = bass.slice(0, 2).map(note => this.convertDuration(note.duration));
    
    switch (variation) {
      case 1:
        return durations.map(d => d * 1.5).join(',');
      case 2:
        return durations.map(d => d * 0.75).join(',');
      default:
        return durations.join(',');
    }
  }

  // Generate harmony pattern
  generateHarmonyPattern(melody, variation) {
    if (!melody || melody.length === 0) {
      return 'c4,e4,g4';
    }
    
    const notes = melody.slice(0, 3).map(note => this.convertNoteToDittytoy(note.note));
    
    // Create chord tones
    switch (variation) {
      case 1:
        return notes.map(note => this.getChordTone(note, 3)).join(',');
      case 2:
        return notes.map(note => this.getChordTone(note, 5)).join(',');
      default:
        return notes.join(',');
    }
  }

  // Transpose a note by semitones
  transposeNote(note, semitones) {
    const noteMap = {
      'c': 0, 'cs': 1, 'd': 2, 'ds': 3, 'e': 4, 'f': 5, 'fs': 6, 'g': 7, 'gs': 8, 'a': 9, 'as': 10, 'b': 11
    };
    
    const reverseMap = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
    
    const match = note.match(/^([a-gs]+)(\d+)$/);
    if (!match) return note;
    
    const [, noteName, octave] = match;
    const noteIndex = noteMap[noteName] || 0;
    const newIndex = (noteIndex + semitones + 12) % 12;
    const newOctave = parseInt(octave) + Math.floor((noteIndex + semitones) / 12);
    
    return `${reverseMap[newIndex]}${newOctave}`;
  }

  // Get chord tone (3rd or 5th)
  getChordTone(note, interval) {
    const intervals = { 3: 4, 5: 7 }; // Major 3rd = 4 semitones, Perfect 5th = 7 semitones
    return this.transposeNote(note, intervals[interval] || 0);
  }

  // Generate pluck pattern
  generatePluckPattern(melody, variation) {
    if (!melody || melody.length === 0) {
      return 'c5,c5,c4,c5,c4,c5,c4,c5,c5,c4,c5,c4';
    }
    
    const notes = melody.slice(0, 12).map(note => this.convertNoteToDittytoy(note.note));
    
    // Create variations by transposing
    switch (variation) {
      case 1:
        return notes.map(note => this.transposeNote(note, 2)).join(',');
      case 2:
        return notes.map(note => this.transposeNote(note, -2)).join(',');
      default:
        return notes.join(',');
    }
  }

  // Generate pluck accent pattern
  generatePluckAccentPattern(melody, variation) {
    if (!melody || melody.length === 0) {
      return '0,0,1,0,1,0,1,0,0,1,0,1';
    }
    
    // Create accent patterns (0 = soft, 1 = accented)
    const accentPatterns = [
      '0,0,1,0,1,0,1,0,0,1,0,1',
      '1,0,0,1,0,1,0,1,0,0,1,0',
      '0,1,0,0,1,0,1,0,1,0,0,1'
    ];
    
    return accentPatterns[variation] || accentPatterns[0];
  }

  // Compile and play dittytoy code
  async playDittytoyCode(dittyCode, duration = 60, patterns = null, instructions = null) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.dittytoy) {
      throw new Error('Dittytoy instance not initialized');
    }

    try {
      this.totalDuration = duration;
      this.currentTime = 0;
      
      // Compiling Dittytoy code
      
      // Test basic functionality
      const basicTestPassed = await this.testBasicFunctionality();
      if (!basicTestPassed) {
        throw new Error('Dittytoy basic functionality test failed');
      }
      
      try {
        // Compile the dittytoy code
        await this.dittytoy.compile(dittyCode);
        
        // Start playback
        this.dittytoy.play();
        this.isPlaying = true;
        this.isPaused = false;
        
        // Start progress tracking
        this.startProgressTracking();
      } catch (compileError) {
        // Fallback to a simple working version
        const simpleCode = patterns && instructions 
          ? this.generateSimpleDittytoyCode(patterns, instructions)
          : this.generateBasicDittytoyCode();
        
        try {
          await this.dittytoy.compile(simpleCode);
          
          this.dittytoy.play();
          this.isPlaying = true;
          this.isPaused = false;
          
          this.startProgressTracking();
        } catch (fallbackError) {
          throw new Error(`Both complex and simple Dittytoy code failed. Complex error: ${compileError.message}, Fallback error: ${fallbackError.message}`);
        }
      }
      
    } catch (error) {
      console.error('Error playing Dittytoy code:', error);
      console.error('Dittytoy code that failed:', dittyCode);
      throw error;
    }
  }

  // Start progress tracking
  startProgressTracking() {
    this.progressInterval = setInterval(() => {
      if (this.isPlaying && !this.isPaused) {
        this.currentTime += 0.1; // Update every 100ms
        
        if (this.progressCallback) {
          this.progressCallback({
            currentTime: this.currentTime,
            totalDuration: this.totalDuration,
            progress: (this.currentTime / this.totalDuration) * 100
          });
        }
        
        // Stop when duration is reached
        if (this.currentTime >= this.totalDuration) {
          this.stop();
        }
      }
    }, 100);
  }

  // Play the generated music
  async playMusic(patterns, instructions) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const dittyCode = this.generateDittytoyCode(patterns, instructions);
      await this.playDittytoyCode(dittyCode, instructions.duration || 60, patterns, instructions);
    } catch (error) {
      console.error('Error playing music:', error);
      throw error;
    }
  }

  // Stop playback
  stop() {
    if (this.dittytoy && this.isPlaying) {
      this.dittytoy.stop();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentTime = 0;
      
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      
      console.log('🎵 Playback stopped');
    }
  }

  // Pause playback
  pause() {
    if (this.dittytoy && this.isPlaying && !this.isPaused) {
      this.dittytoy.pause();
      this.isPaused = true;
      console.log('🎵 Playback paused');
    }
  }

  // Resume playback
  resume() {
    if (this.dittytoy && this.isPlaying && this.isPaused) {
      this.dittytoy.play();
      this.isPaused = false;
      console.log('🎵 Playback resumed');
    }
  }

  // Set callbacks
  setNoteCallback(callback) {
    this.noteCallback = callback;
  }

  setErrorCallback(callback) {
    this.errorCallback = callback;
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  // Get current state
  getCurrentTime() {
    return this.currentTime;
  }

  getTotalDuration() {
    return this.totalDuration;
  }

  isCurrentlyPlaying() {
    return this.isPlaying && !this.isPaused;
  }

  // Set volume (dittytoy uses amp)
  setVolume(volume) {
    if (this.dittytoy) {
      // Dittytoy doesn't have a global volume control, but we can adjust individual synth amps
      console.log('Volume control not directly supported in Dittytoy, adjust individual synth amps');
    }
  }

  // Start recording the current audio
  async startRecording() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const destination = this.audioContext.createMediaStreamDestination();
      
      // Create a MediaRecorder to record the audio
      this.mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  // Stop recording and return the audio blob
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedAudio = audioBlob;
        this.isRecording = false;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Save track to Cloudinary and Firestore
  async saveTrack(trackData, userId) {
    try {
      if (!this.recordedAudio) {
        throw new Error('No recorded audio to save');
      }

      // Convert webm to mp3-like format
      const audioFile = new File([this.recordedAudio], `${trackData.title || 'untitled'}.webm`, {
        type: 'audio/webm'
      });

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(audioFile, 'chordara/tracks');
      
      // Prepare track metadata
      const trackMetadata = {
        title: trackData.title || 'Untitled Track',
        description: trackData.description || '',
        style: trackData.style || 'electronic',
        tempo: trackData.tempo || 120,
        key: trackData.key || 'C',
        duration: trackData.duration || 60,
        cloudinaryUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        userId: userId,
        createdAt: new Date(),
        dittytoyCode: trackData.dittytoyCode || '',
        patterns: trackData.patterns || {}
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'tracks'), trackMetadata);
      
      return {
        id: docRef.id,
        ...trackMetadata
      };
    } catch (error) {
      console.error('Error saving track:', error);
      throw error;
    }
  }

  // Get user's tracks from Firestore
  async getUserTracks(userId) {
    try {
      const q = query(
        collection(db, 'tracks'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tracks = [];
      
      querySnapshot.forEach((doc) => {
        tracks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tracks;
    } catch (error) {
      console.error('Error fetching tracks:', error);
      throw error;
    }
  }

  // Delete track from Firestore and Cloudinary
  async deleteTrack(trackId, cloudinaryPublicId) {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'tracks', trackId));
      
      // Delete from Cloudinary
      if (cloudinaryPublicId) {
        await deleteAudioFromCloudinary(cloudinaryPublicId);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error;
    }
  }

  // Download track as MP3
  downloadTrack(trackData, filename) {
    if (!this.recordedAudio) {
      console.error('No recorded audio to download');
      return;
    }

    const url = URL.createObjectURL(this.recordedAudio);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${trackData.title || 'untitled'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Play music with automatic recording and saving
  async playMusicWithRecording(patterns, instructions, userId) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Start recording
      await this.startRecording();
      
      // Generate and play music
      const dittyCode = this.generateDittytoyCode(patterns, instructions);
      await this.playDittytoyCode(dittyCode, instructions.duration || 60, patterns, instructions);
      
      // Wait for the duration of the track
      const duration = (instructions.duration || 60) * 1000; // Convert to milliseconds
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Stop recording
      const recordedAudio = await this.stopRecording();
      
      if (recordedAudio) {
        // Save track automatically
        const trackData = {
          title: `Generated Track - ${new Date().toLocaleString()}`,
          style: instructions.style || 'electronic',
          tempo: instructions.tempo || 120,
          key: instructions.key || 'C',
          duration: instructions.duration || 60,
          dittytoyCode: dittyCode,
          patterns: patterns
        };
        
        const savedTrack = await this.saveTrack(trackData, userId);
        return savedTrack;
      }
      
      return null;
    } catch (error) {
      console.error('Error playing music with recording:', error);
      throw error;
    }
  }

  // Cleanup
  dispose() {
    this.stop();
    if (this.dittytoy) {
      this.dittytoy = null;
    }
    this.isInitialized = false;
    this.isRecording = false;
    this.recordedAudio = null;
    this.recordedChunks = [];
  }
}

export default new DittytoyService();
