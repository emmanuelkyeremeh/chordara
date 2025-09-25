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

    // Check if this is a techno style and use specialized generator
    if (this.isTechnoStyle(style)) {
      return this.generateTechnoDittytoyCode(patterns, instructions);
    }

    // Set BPM and add utility functions
    let dittyCode = `ditty.bpm = ${tempo};

// Utility functions for better sound shaping - enhanced from working code
function softclip(x) {
    return x<-1?-1:x>1?1:1.5*(1-x*x/3)*x;
}

function varsaw(p, formant) {
    let x = p-~~p;
    return (x - 0.5) * softclip(formant*x*(1-x));
}

const fract = (x) => x - Math.floor(x);
const triangle01 = x => Math.abs(fract(x + .5) - .5) * 2;
const triangle11 = x => Math.abs(fract(x + .75) - .5) * 4 - 1;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function signed(x, l) {
    return x > 0 ? l(x) : -l(-x);
}

function nonlin(x) {
    return Math.min(x - (clamp(x, .4, .6)-.4)*2, .6);
}

function clamp01(x) {
    return Math.min(Math.max(x, 0), 1);
}

// Saturation function for wave shaping
let sat = x => Math.max(Math.min(x, 1), -1);

`;

    // Add advanced effects
    dittyCode += this.generateAdvancedEffects();
    
    // Add custom synth definitions
    dittyCode += this.generateCustomSynths();

    // Generate melody loop with enhanced lead synth
    if (melody && melody.length > 0) {
      dittyCode += `// Enhanced melody loop with lead synth
loop((lc) => {
  var melodyLoopNotes = [${this.generateMelodyPattern(melody, 0)}];
  var melodyLoopDurations = [${this.generateDurationPattern(melody, 0)}];
  
  for(var i = 0; i < melodyLoopNotes.length; ++i) {
    var note = melodyLoopNotes[i];
    var duration = melodyLoopDurations[i];
    var amp = xrand(0.3, 0.7);
    
    lead.play(note, {
      attack: rand(0.01, 0.1),
      release: rand(0.1, 0.5),
      duration: duration,
      amp: amp,
      detune: rand(0.1, 0.3),
      fm12: rand(10, 30)
    });
    
    sleep(duration + rand(-0.05, 0.05)); // Human-like timing variation
  }
`;
      
      dittyCode += `}, { name: 'melody' }).connect(echo.create());

`;
    }

    // Generate bass loop with enhanced bass synth
    if (bass && bass.length > 0) {
      dittyCode += `// Enhanced bass loop with bass synth
loop((lc) => {
  var bassLoopNotes = [${this.generateBassPattern(bass, 0)}];
  var bassLoopDurations = [${this.generateBassDurationPattern(bass, 0)}];
  
  for(var i = 0; i < bassLoopNotes.length; ++i) {
    var note = bassLoopNotes[i];
    var duration = bassLoopDurations[i];
    var amp = xrand(0.6, 1.0);
    
    bass.play(note, {
      attack: rand(0.001, 0.01),
      release: rand(0.3, 1.0),
      duration: duration,
      amp: amp,
      detune: rand(0.01, 0.05),
      timbre1: 2
    });
    
    sleep(duration + rand(-0.02, 0.02));
  }
}, { name: 'bass' }).connect(echo.create());

`;
    }

    // Add harmony layer for more realistic sound
    if (melody && melody.length > 0) {
      dittyCode += `// Harmony layer with strings
loop((lc) => {
  var harmonyPatterns = [
    {p:[${this.generateHarmonyPattern(melody, 0)}]},
    {p:[${this.generateHarmonyPattern(melody, 1)}]},
    {p:[${this.generateHarmonyPattern(melody, 2)}]}
  ];
  var pattern = harmonyPatterns[lc % harmonyPatterns.length];
  
  if(pattern && pattern.p.length > 0) {
    for(var i = 0; i < pattern.p.length; ++i) {
      strings.play(pattern.p[i]-12, {duration: 8});
      sleep(.05);
    }
    sleep(8-pattern.p.length*.05);
  } else {
    sleep(8);
  }
}, { name: 'harmony' }).connect(reverb.create()).connect(phaser.create()).connect(echo.create());

`;
    }

    // Add enhanced drum patterns with improved synthesis
    if (drums && drums.length > 0) {
      dittyCode += `// Enhanced drum patterns with improved synthesis
loop((i) => {
    var beat = i % 4;
    
    // Kick drum
    if(beat === 0 || beat === 2) {
        kick.play(c4, { amp: xrand(0.8, 1.2) });
    }
    
    // Snare
    if(beat === 1 || beat === 3) {
        snare.play(c4, { amp: xrand(0.6, 0.9) });
    }
    
    // Hi-hat
    clhat.play(c4, { amp: xrand(0.3, 0.6) });
    
    sleep(0.5);
}, { name: 'drums' }).connect(echo.create());

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
  var pluckPatterns = [
    {p:[${this.generatePluckPattern(melody, 0)}], a:[${this.generatePluckAccentPattern(melody, 0)}]},
    {p:[${this.generatePluckPattern(melody, 1)}], a:[${this.generatePluckAccentPattern(melody, 1)}]},
    {p:[${this.generatePluckPattern(melody, 2)}], a:[${this.generatePluckAccentPattern(melody, 2)}]}
  ];
  var pattern = pluckPatterns[(lc>>1) % pluckPatterns.length];
  
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

  // Generate techno-specific Dittytoy code
  generateTechnoDittytoyCode(patterns, instructions) {
    const { tempo, style, mood } = instructions;
    
    let technoCode = `ditty.bpm = ${tempo};

// Utility functions for better sound shaping - enhanced from working code
function softclip(x) {
    return x<-1?-1:x>1?1:1.5*(1-x*x/3)*x;
}

function varsaw(p, formant) {
    let x = p-~~p;
    return (x - 0.5) * softclip(formant*x*(1-x));
}

const fract = (x) => x - Math.floor(x);
const triangle01 = x => Math.abs(fract(x + .5) - .5) * 2;
const triangle11 = x => Math.abs(fract(x + .75) - .5) * 4 - 1;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

function signed(x, l) {
    return x > 0 ? l(x) : -l(-x);
}

function nonlin(x) {
    return Math.min(x - (clamp(x, .4, .6)-.4)*2, .6);
}

function clamp01(x) {
    return Math.min(Math.max(x, 0), 1);
}

// Saturation function for wave shaping
let sat = x => Math.max(Math.min(x, 1), -1);

`;

    // Add advanced effects
    technoCode += this.generateAdvancedEffects();
    
    // Add custom synth definitions
    technoCode += this.generateCustomSynths();

    technoCode += `
// Advanced techno kick pattern with bpfSaw
loop((lc) => {
    for(var i = 0; i < 16; ++i) {
        var beat = i % 4;
        
        // Main kick on beats 1 and 3
        if(beat === 0 || beat === 2) {
            bpfSaw.play(hz_to_midi(1/16), {
                cf: xrand(38, 55),
                Q: xrand(100, 300),
                attack: 0.001,
                release: xrand(0.2, 0.6),
                amp: xrand(0.8, 1.2),
                shimFreq: xrand(0.1, 1),
                shimAmp: xrand(0.05, 0.15)
            });
        }
        
        // Ghost kicks
        if(Math.random() > 0.7) {
            bpfSaw.play(hz_to_midi(1/16), {
                cf: xrand(40, 60),
                Q: xrand(50, 150),
                attack: 0.001,
                release: xrand(0.1, 0.3),
                amp: xrand(0.1, 0.3),
                shimFreq: xrand(0.5, 2),
                shimAmp: xrand(0.1, 0.3)
            });
        }
        
        sleep(.5);
    }
}, { name: 'bd', amp: .6 }).connect(echo.create());

// Complex percussion patterns with randomization
const series = (n, lambda) => {
    var r = []
    for(var i = 0; i < n; ++i)
        r.push(lambda(i));
    return r;
}

loop(() => {
    var series0 = series(16, x=>Math.random()**2);
    var series1 = series(16, x=>Math.random()**2);
    var series2 = series(16, x=>Math.random()**2);
    for(var k = 0; k < 16; ++k) {
        var swing = .04;
        for(var i = 0; i < 16; ++i) {
            var nr = i == 6 ? 2 : 1;
            var p = i;
            for(var j = 0; j < nr; ++j) {
                perc.play(g4, {filter: series0[p], duration:series1[p]*.2, amp:series2[p]*.5+.2, pan:(series2[p]*2-1)*.5, amtBody:.1});
                sleep((i&1?.25-swing:.25+swing)/nr);
            }
        }
    }
}, { name: 'perc', amp: .8 }).connect(reverb.create({wet:.2})).connect(post.create()).connect(compressor);

// Hi-hat pattern
loop(() => {
    sleep(.5);
    perc.play(gs4, {ampBody:0, attack: .01, release:.15, mode:'hp', fcBase:4000, amp:.6});
    sleep(.5);
}, { name: 'hat' }).connect(reverb.create({wet:.2})).connect(post.create()).connect(compressor);

// Atmospheric noise layer
loop(() => {
    sleep(.5);
    perc.play(gs4, {duration: 1, ampBody:0, attack: .1, release:14, mode:'hp', fcBase:1, fcEnv:8000, fcEnvSpeed:.2 });
    sleep(16+15);
}, { name: 'noise', amp: .1 }).connect(reverb.create({wet:.2})).connect(post.create()).connect(compressor);

// Advanced techno bass with bpfSaw
loop((lc) => {
    var technoBassNotes = [c2, g2, a2, f2, d2, e2];
    var technoBassPatterns = [
        [0, 1, 0, 2, 0, 1, 0, 3],
        [0, 1, 2, 1, 0, 3, 2, 1],
        [0, 2, 1, 3, 0, 2, 1, 0],
        [1, 0, 3, 0, 2, 0, 1, 2]
    ];
    var pattern = technoBassPatterns[lc % technoBassPatterns.length];
    
    for(var i = 0; i < 8; ++i) {
        var noteIndex = pattern[i];
        var note = technoBassNotes[noteIndex];
        var cf = xrand(80, 200);
        var Q = xrand(3, 8);
        var amp = xrand(0.6, 0.9);
        var duration = xrand(0.4, 0.6);
        
        // Add occasional octave jumps
        if(Math.random() > 0.8) {
            note = note + 12;
        }
        
        bpfSaw.play(note, {
            cf: cf,
            Q: Q,
            attack: 0.01,
            release: xrand(0.2, 0.5),
            duration: duration,
            amp: amp,
            shimFreq: xrand(0.1, 1),
            shimAmp: xrand(0.05, 0.2)
        });
        
        sleep(.5);
    }
}, { name: 'bass' }).connect(echo.create());

// Advanced techno melody with bpfSaw
loop((lc) => {
    var technoMelodyPatterns = [
        [c4, e4, g4, c5, g4, e4, c4, g4],
        [d4, f4, a4, d5, a4, f4, d4, a4],
        [e4, g4, b4, e5, b4, g4, e4, b4],
        [f4, a4, c5, f5, c5, a4, f4, c5]
    ];
    var pattern = technoMelodyPatterns[lc % technoMelodyPatterns.length];
    
    for(var i = 0; i < 8; ++i) {
        var note = pattern[i];
        var cf = xrand(1500, 4000);
        var Q = xrand(8, 20);
        var amp = xrand(0.2, 0.5);
        var duration = xrand(0.2, 0.4);
        
        // Add occasional harmony notes
        if(Math.random() > 0.7) {
            bpfSaw.play(note, {
                cf: cf,
                Q: Q,
                attack: 0.01,
                release: xrand(0.1, 0.3),
                duration: duration,
                amp: amp,
                shimFreq: xrand(1, 5),
                shimAmp: xrand(0.1, 0.3)
            });
            sleep(.1);
            bpfSaw.play(note + 7, {
                cf: cf * 1.2,
                Q: Q * 0.8,
                attack: 0.01,
                release: xrand(0.1, 0.3),
                duration: duration * 0.8,
                amp: amp * 0.6,
                shimFreq: xrand(1, 5),
                shimAmp: xrand(0.1, 0.3)
            });
            sleep(.15);
        } else {
            bpfSaw.play(note, {
                cf: cf,
                Q: Q,
                attack: 0.01,
                release: xrand(0.1, 0.3),
                duration: duration,
                amp: amp,
                shimFreq: xrand(1, 5),
                shimAmp: xrand(0.1, 0.3)
            });
            sleep(.25);
        }
    }
    sleep(8);
}, { name: 'melody' }).connect(echo.create());`;

    console.log('🎵 Generated techno Dittytoy code');
    return technoCode;
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
    // Basic validation - check for common syntax issues
    // Note: bassdrum.play(), snare.play(), hihat.play() are correct Dittytoy syntax
    
    // Check for potential undefined variables or syntax errors
    const potentialIssues = [
      { pattern: /undefined/, message: 'Found undefined variable' },
      { pattern: /null\./, message: 'Found null reference' },
      { pattern: /\.play\(\)\.play\(\)/, message: 'Found double .play() calls' }
    ];
    
    potentialIssues.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        console.warn(`🎵 ${message}: ${pattern.source}`);
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

  // Check if the style is techno-related
  isTechnoStyle(style) {
    if (!style) return false;
    
    const technoStyles = [
      'techno', 'tech-house', 'minimal', 'deep-techno', 'industrial',
      'detroit-techno', 'berlin-techno', 'acid-techno', 'progressive-techno'
    ];
    
    const styleLower = style.toLowerCase();
    return technoStyles.some(technoStyle => 
      styleLower.includes(technoStyle) || 
      styleLower.includes('techno') ||
      styleLower.includes('tech')
    );
  }

  // Generate advanced effects (echo, phaser, filters)
  generateAdvancedEffects() {
    return `
// Professional DSP utilities and filters
const cos = Math.cos, sin = Math.sin, PI = Math.PI, sqrt = Math.sqrt;

// Advanced randomization functions for musical variation
const rand = (a,b) => a + (b-a) * Math.random();
const xrand = (a,b) => a * (b/a)**Math.random();

// Anti-aliasing sawtooth oscillator
const aaSaw = (p, dp) => (2 * p - 1) * clamp01(p * (1-p)/dp);

// Second-order section in Transposed Direct Form II
// https://ccrma.stanford.edu/~jos/filters/Transposed_Direct_Forms.html
class TDF2 {
    constructor(a1,a2,b0,b1,b2) {
        this.set_coefs(a1,a2,b0,b1,b2);
        this.s1 = 0; this.s2 = 0;
    }
    set_coefs(a1,a2,b0,b1,b2){
        this.a1 = a1; this.a2 = a2; this.b0 = b0; this.b1 = b1; this.b2 = b2;
    }
    process(xn) {
        var yn  = this.s1                + this.b0 * xn;
        this.s1 = this.s2 - this.a1 * yn + this.b1 * xn;
        this.s2 =         - this.a2 * yn + this.b2 * xn;
        return yn;
    }
}

// Biquad filter coefficients from the Audio EQ Cookbook
// https://www.w3.org/TR/audio-eq-cookbook/
function calc_biquad_coefs(opt) {
    var w0 = 2*PI*opt.f0*ditty.dt; var cw0 = cos(w0); var alpha = sin(w0)/(2*opt.Q);
    if(opt.type == "LPF") { // Low pass filter
        var b0 =  (1 - cw0)/2, b1 =   1 - cw0, b2 =  (1 - cw0)/2, a0 =   1 + alpha, a1 =  -2*cw0, a2 =   1 - alpha;
    } else if (opt.type == "HPF") { // High pass filter
        var b0 =  (1 + cw0)/2, b1 =  -1 - cw0, b2 =  (1 + cw0)/2, a0 =   1 + alpha, a1 =  -2*cw0, a2 =   1 - alpha;
    } else if(opt.type == "resonance") { // Band pass filter (constant skirt gain, peak gain = Q)
        var b0 =  opt.Q*alpha, b1 =  0, b2 = -opt.Q*alpha, a0 =   1 + alpha, a1 =  -2*cw0, a2 =   1 - alpha;
    } else if(opt.type == "BPF") { // Band pass filter (constant 0 dB peak gain)
        var b0 = alpha, b1 =  0, b2 = -alpha, a0 =   1 + alpha, a1 =  -2*cw0, a2 = 1 - alpha;
    } else if(opt.type == "notch") { // Notch filter (removes frequency f0)
        var b0 = 1, b1 = -2*cw0, b2 = 1, a0 =   1 + alpha, a1 =  -2*cw0, a2 = 1 - alpha;
    } else if(opt.type == "APF") { // All pass filter (constant gain, phase shift around f0)
        var b0 = 1 - alpha, b1 = -2*cw0, b2 = 1 + alpha, a0 =   1 + alpha, a1 =  -2*cw0, a2 = 1 - alpha;
    } else if(opt.type == "peak") { // Peaking EQ (requires dBgain)
        var A = 10**(opt.dBgain/40);
        var b0 = 1 + alpha*A, b1 = -2*cw0, b2 = 1 - alpha*A, a0 =   1 + alpha/A, a1 =  -2*cw0, a2 = 1 - alpha/A;
    } else if(opt.type == "lowShelf") { // Low shelf (requires dBgain)
        var A = 10**(opt.dBgain/40);
        var b0 = A*( (A+1) - (A-1)*cw0 + 2*sqrt(A)*alpha ), b1 =  2*A*( (A-1) - (A+1)*cw0), b2 = A*( (A+1) - (A-1)*cw0 - 2*sqrt(A)*alpha ),
            a0 = (A+1) + (A-1)*cos(w0) + 2*sqrt(A)*alpha,   a1 =   -2*( (A-1) + (A+1)*cw0), a2 = (A+1) + (A-1)*cos(w0) - 2*sqrt(A)*alpha;
    } else if(opt.type == "highShelf") { // High shelf (requires dBgain)
        var A = 10**(opt.dBgain/40);
        var b0 =    A*( (A+1) + (A-1)*cos(w0) + 2*sqrt(A)*alpha ),
            b1 = -2*A*( (A-1) + (A+1)*cos(w0)                   ),
            b2 =    A*( (A+1) + (A-1)*cos(w0) - 2*sqrt(A)*alpha ),
            a0 =        (A+1) - (A-1)*cos(w0) + 2*sqrt(A)*alpha,
            a1 =    2*( (A-1) - (A+1)*cos(w0)                   ),
            a2 =        (A+1) - (A-1)*cos(w0) - 2*sqrt(A)*alpha;
    } else {
        console.error("Unknown filter type");
    }
    return [a1/a0, a2/a0, b0/a0, b1/a0, b2/a0];
}

// State Variable Filter based on cytomic Sound Music Software - enhanced implementation
// https://cytomic.com/files/dsp/SvfLinearTrapOptimised2.pdf
class SVF {
    constructor(opt)
    {
        this.stages = [];
        this.mode = opt ? opt.mode || 'lp' : 'lp';
        this.fc = 0;
        this.q = 1;
        this.num = opt ? opt.num || 1 : 1;
        // g parameter determines cutoff
        // k parameter = 1/Q
        for(var i = 0; i < this.num; ++i) {
            this.stages.push({lp:0, bp:0, hp:0, ap:0, ic1eq:0, ic2eq:0});
        }
        this.q = opt && isFinite(opt.q) ? opt.q : 1;
        this.fc = opt && isFinite(opt.fc) ? opt.fc : .25;
    }
    _run(s, input, a1, a2, a3, k) {
        var v1, v2, v3;
        v3 = input - s.ic2eq;
        v1 = a1 * s.ic1eq + a2 * v3;
        v2 = s.ic2eq + a2 * s.ic1eq + a3 * v3;
        s.ic1eq = 2 * v1 - s.ic1eq;
        s.ic2eq = 2 * v2 - s.ic2eq;
        s.lp = v2;
        s.bp = v1;
        s.hp = input - k * v1 - v2;
        s.ap = s.lp + s.hp - k * s.bp;
    }
    process(input)
    {
        if(this.fc != this._fc) {
            this._fc = this.fc;
            this._q = this.q;
            var fc = this.fc * .5;
            if (fc >= 0 && fc < .5) {
                this.g = Math.tan(Math.PI * fc);
                this.k = 1 / this.q;
                this.a1 = 1 / (1 + this.g * (this.g + this.k));
                this.a2 = this.g * this.a1;
                this.a3 = this.g * this.a2;
            }
        }
        if(this.q != this._q) {
            this._q = this.q;
            this.k = 1 / this.q;
            this.a1 = 1 / (1 + this.g * (this.g + this.k));
            this.a2 = this.g * this.a1;
            this.a3 = this.g * this.a2;
        }

        for(var i = 0; i < this.num; ++i) {
            this._run(this.stages[i], input, this.a1, this.a2, this.a3, this.k);
            this._run(this.stages[i], input, this.a1, this.a2, this.a3, this.k);
            input = this.stages[i][this.mode];
        }
        return input;
    }
}

// Professional compressor with threshold and gain control
input.compressorThreshold = -15;
input.compressorGain = 4;
input.compressorEn = 1;

const dB2gain = v => 10 ** (v / 20);
const gain2dB = v => Math.log10(v) * 20;
const compressor = filter.def(class Compressor {
    constructor(opt) {
        this.gain = 1;
        this.threshold = -40;
        this.ratio = .9;
        this.peak = 0.01;
        this.active = 1;
    }
    process(inv, opt) {
        this.threshold = input.compressorThreshold;
        this.gain = input.compressorGain;
        this.active = input.compressorEn;
        var inputLevel = Math.max(Math.abs(inv[0]), Math.abs(inv[1]));
        if(inputLevel > this.peak)
            this.peak = inputLevel;
        else
            this.peak *= .9999;
        
        inputLevel = gain2dB(this.peak);
        var compression = Math.max(0, inputLevel - this.threshold);
        var dgain = compression ? dB2gain(-compression * this.ratio) : 1;
        dgain *= this.gain;
        
        if(this.active > .5)
            return [inv[0] * dgain, inv[1] * dgain];
        else
            return inv;
    }
}).createShared();

// Advanced delay line for reverb and echo - improved implementation
class Delayline {
    constructor(n) {
        this.n = ~~n;
        this.p = 0;
        this.lastOut = 0;
        this.data = new Float32Array(n);
    }
    process(input) {
        this.lastOut = this.data[this.p];
        this.data[this.p] = input;
        if(++this.p >= this.n)
            this.p = 0;
        return this.lastOut;
    }
    tap(offset) {
        var x = this.p - offset - 1;
        x %= this.n;
        if(x < 0)
            x += this.n;
        return this.data[x];
    }
}

function allpass(delayline, x, k) {
    var delayin = x - delayline.lastOut * k;
    var y = delayline.lastOut + k * delayin;
    delayline.process(delayin);
    return y;
}

// Simple allpass reverberator - enhanced implementation
const reverb = filter.def(class {
    constructor(opt) {
        this.lastReturn = 0;
        this.density = opt.density || .5;
        this.delaylines = [];
        // Create several delay lines with random lengths
        [263,863,1319,1433,439,359,887,1399,233,1367,4253,2903].forEach((dl) => this.delaylines.push(new Delayline(dl)));
        this.tap = [111,2250,311,1150,511,50,4411,540];
        this.dry = 1-(opt.mix || .1);
        this.wet = (opt.mix || .1)*.25;
        this.pred = new Delayline((opt.pred || .01) / ditty.dt);
    }
    allpass(delayline, x, k) {
        var delayin = x - delayline.lastOut * k;
        var y = delayline.lastOut + k * delayin;
        delayline.process(delayin);
        return y;
    }
    process(input, options) {
        var inv = input[0] + input[1];
        if(this.pred.n > 0)
            inv = this.pred.process(inv);
        var v = this.lastReturn;
        var dls = this.delaylines;
        // Let the signal pass through the loop of delay lines. Inject input signal at multiple locations.
        v = this.allpass(dls[0], v + inv, .5);
        v = this.allpass(dls[1], v, .5);
        dls[2].process(v);
        v = dls[2].lastOut * this.density;
        v = this.allpass(dls[3], v + inv, .5);
        v = this.allpass(dls[4], v, .5);
        dls[5].process(v);
        v = dls[5].lastOut * this.density;
        v = this.allpass(dls[6], v + inv, .5);
        v = this.allpass(dls[7], v, .5);
        dls[8].process(v);
        v = dls[8].lastOut * this.density;
        v = this.allpass(dls[9], v + inv, .5);
        v = this.allpass(dls[10], v, .5);
        dls[11].process(v);
        v = dls[11].lastOut * this.density;
        this.lastReturn = v;
        // Tap the delay lines at randomized locations and accumulate the output signal.
        var ret = [0, 0];
        ret[0] += dls[2].tap(this.tap[0]);
        ret[1] += dls[2].tap(this.tap[1]);
        ret[0] += dls[5].tap(this.tap[2]);
        ret[1] += dls[5].tap(this.tap[3]);
        ret[0] += dls[8].tap(this.tap[4]);
        ret[1] += dls[8].tap(this.tap[5]);
        ret[0] += dls[11].tap(this.tap[6]);
        ret[1] += dls[11].tap(this.tap[7]);
        // Mix wet + dry signal.
        ret[0] = ret[0] * this.wet + input[0] * this.dry;
        ret[1] = ret[1] * this.wet + input[1] * this.dry;
        // Stereo widening:
        var m = (ret[0]+ret[1]) * .5;
        var s = (ret[1]-ret[0]) * .5;
        ret[0] = m + s * 1.5;
        ret[1] = m - s * 1.5;
        return ret;
    }
}, {mix: .1, density: .5, pred: .01});

// Wave shaping and distortion
input.ws0 = 0.5;
input.kickWs1 = 0.58;
input.kickWsAsym = 0.52;
const fold01 = (x, a) => x > a ? a-(x-a) : x;
const fold11 = (x, a) => x > 0 ? fold01(x,a) : -fold01(-x,a);

// Advanced distortion filter
const distructor = filter.def(class {
    constructor(opt) {
        this.stages = [];
        for(var i = 0; i < 1; ++i) {
            this.stages.push({flt: new SVF({num: 2, mode: 'bp', fc: .008, q:2}), flt2:new SVF({num: 2, mode: 'bp', fc: .02, q:2})});
        }
    }
    process(inn, opt) {
        var stage = this.stages[0];
        var v = signed((inn[0]*input.ws0+input.ws1)*10, x=>nonlin(x)**.5);
        v = v+stage.flt.process(v)*.4+stage.flt2.process(v)*.8;
        v = signed((v*input.ws0+input.ws1), x=>nonlin(x)**.5);
        return [v, v];
    }
});

// Post-processing filter
const post = filter.def(class {
   constructor(opt) {
       this.flt = [new SVF({mode:'hp', num:2}), new SVF({mode:'hp', num:2})];
   }
   process(inn, opt) {
       var x = ditty.tick%64;
       this.flt[0].fc = this.flt[1].fc = clamp01((16-x) * 2) * .006 * (1 + Math.max(0,x-8)*.1) + .0005;
       inn[0] = this.flt[0].process(inn[0]);
       inn[1] = this.flt[1].process(inn[1]);
       return inn;
   }
});

// Professional stereo echo filter - enhanced implementation
const echo = filter.def(class {
    constructor(opt) {
        this.lastOut = [0, 0];
        var division = opt.division || 3/4;
        var pan = clamp01((opt.pan || 0)*.5+.5);
        var sidetime = (opt.sidetime || 0) / ditty.dt;
        var time = 60 * division / ditty.bpm;
        this.fb = clamp(opt.feedback || 0, -1, 1);
        this.kl = 1-pan;
        this.kr = pan;
        this.wet = opt.wet || .5;
        this.stereo = isFinite(opt.stereo) ? opt.stereo : 1;
        var n = ~~(time / ditty.dt);
        this.delay = [new Delayline(n), new Delayline(n)];
        this.dside = new Delayline(~~sidetime);
    }
    process(inv, opt) {
        this.dside.process(inv[0]);
        var l = this.dside.lastOut * this.kl;
        var r = inv[1] * this.kr;
        var nextl = l + this.delay[1].lastOut * this.fb;
        var nextr = r + this.delay[0].lastOut * this.fb;
        this.lastOut[0] = inv[0] + this.delay[0].lastOut * this.wet;
        this.lastOut[1] = inv[1] + this.delay[1].lastOut * this.wet;
        this.delay[0].process(nextl);
        this.delay[1].process(nextr);
        if(this.stereo != 1) {
            var m = (this.lastOut[0] + this.lastOut[1])*.5;
            var s = (this.lastOut[0] - this.lastOut[1])*.5;
            s *= this.stereo;
            this.lastOut[0] = m+s;
            this.lastOut[1] = m-s;
        }
        return this.lastOut;
    }
}, {sidetime: .01, division: 1/2, pan: .5, wet: .5, feedback: .6, stereo: 2});

// Phaser effect
const phaser = filter.def(class {
    constructor(opt) {
        this.rate = opt.rate || 0.5;
        this.depth = opt.depth || 0.8;
        this.feedback = opt.feedback || 0.3;
        this.stages = opt.stages || 4;
        this.allpassFilters = [];
        this.lfo = 0;
        
        for(var i = 0; i < this.stages; i++) {
            this.allpassFilters.push({
                delay: new Delayline(1),
                coeff: 0
            });
        }
    }
    process(input, opt) {
        this.lfo += this.rate * 0.001; // Use fixed time step instead of ditty.dt
        var lfoValue = Math.sin(this.lfo * Math.PI * 2) * this.depth;
        var coeff = lfoValue * 0.5 + 0.5;
        
        var signal = input[0];
        for(var i = 0; i < this.stages; i++) {
            var filter = this.allpassFilters[i];
            filter.coeff = coeff;
            var delayed = filter.delay.process(signal);
            signal = delayed * filter.coeff + signal * (1 - filter.coeff);
        }
        
        var output = signal + input[0] * this.feedback;
        return [output, output];
    }
});

`;
  }

  // Generate custom synth definitions
  generateCustomSynths() {
    return `
// Professional techno synthesizers based on advanced DSP techniques

// Advanced kick drum with wave shaping and filtering
const bd = synth.def(class {
    constructor(opt) {
        this.t = 0;
        this.p = 0;
        this.svf = new SVF({num:2});
        this.svfw = new SVF({num:1, fc:.03, q: 2, mode:'bp'});
    }
    process(note, env, tick, opt) {
        var v = Math.sin(this.p * Math.PI * 2);
        this.p += lerp(700, midi_to_hz(note), clamp01(this.t * 50) ** .25) * ditty.dt;
        this.t += ditty.dt;
        var nse = (Math.random() - .5) * 2;
        this.svf.fc = lerp(350, 200, clamp01(this.t * 10)) * ditty.dt;
        v += this.svf.process(nse);
        v += this.svfw.process(Math.random()) * Math.exp(this.t * -20) * .5;
        v += (Math.random()) * Math.exp(this.t * -80) * .4;
        return fold11((v+input.kickWsAsym-.5) * env.value, input.kickWs1);
    }
}, {duration: .02, release: .6, attack: .0001});

// Advanced percussion with stereo processing
const perc = synth.def(class {
    constructor(opt) {
        this.t = 0;
        this.p = 0;
        this.amtBody = opt.amtBody||0;
        this.amtBurst = .4;
        this.fDrop = 200;
        this.fcEnv = opt.fcEnv||500;
        this.fcBase = opt.fcBase||3000 + (opt.filter||0) * 2000;
        this.fcEnvSpeed = opt.fcEnvSpeed||100;
        this.svfl = new SVF({num:2, q: opt.q||1, mode:opt.mode||'bp'});
        this.svfr = new SVF({num:2, q: opt.q||1, mode:opt.mode||'bp'});
    }
    process(note, env, tick, opt) {
        var v = Math.sin(this.p * Math.PI * 2) * this.amtBody;
        this.p += (midi_to_hz(note) + this.fDrop * clamp01(1 - this.t * 50)) * ditty.dt;
        this.t += ditty.dt;
        this.svfr.fc = this.svfl.fc = lerp(this.fcBase+this.fcEnv, this.fcBase, clamp01(this.t * this.fcEnvSpeed)) * ditty.dt;
        var vl = v + this.svfl.process(Math.random() - .5);
        var vr = v + this.svfr.process(Math.random() - .5);
        vl += (Math.random()-.5) * Math.exp(this.t * -20) * this.amtBurst;
        vr += (Math.random()-.5) * Math.exp(this.t * -20) * this.amtBurst;
        var sidec = ditty.tick%1;
        vl *= sidec;
        vr *= sidec;
        return [vl * env.value, vr * env.value];
    }
}, {duration: .01, release: .1, attack: .0001});

// Enhanced Analog synthesizer with better unison, detune, and shimmer effects
class Analog {
    constructor(opt) {
        var def = {nunison:1,spread:.9,detune:.1,flt1:.5,flt2:.02,fm12:0,fshimmer:0,pw:.3};
        for(const x in def)
            if(!isFinite(opt[x]))
                opt[x]=def[x];
        this.ops = [];
        var vol = opt.nunison > 1 ? 1 / opt.nunison : 1;
        for(var i = 0; i < opt.nunison; ++i) {
            var t = opt.nunison > 1 ? i / (opt.nunison-1) : .5;
            var x = t*2-1;
            var pan = x * opt.spread;
            this.ops.push({
                pha1:Math.random(),
                pha2:Math.random(),
                pitch: 2 ** (Math.sin(x * 12) * opt.detune / 12),
                fl: (pan>0?1-pan:1) * vol,
                fr: (pan<0?1+pan:1) * vol
            });
        }
        this.tshimmer = 0;
        this.fshimmer = opt.fshimmer;
        this.timbre1 = opt.timbre1;
        this.timbre2 = opt.timbre2;
        this.tupd = 0;
        this.kupd = 100 * ditty.dtick;
        this.pw = opt.pw;
    }
    process(note, env, tick, opt) {
        if(this.tupd <= 0) {
            this.tupd += 1;
            var pitch = opt.pitch||0;
            this.pinc = midi_to_hz(note + pitch) * ditty.dt;
            this.o1flt = opt.flt1;
            this.o2flt = opt.flt2;
            this.fm12 = opt.fm12;
        }
        this.tupd -= this.kupd;
        if(this.tshimmer >= 1) {
            for(var i = 0; i < this.ops.length; ++i) {
                var op = this.ops[i];
                op.pitch = 2 ** ((Math.random()*2-1) * opt.detune / 12);
            }
            this.tshimmer -= 1;
        }
        this.tshimmer += ditty.dt * this.fshimmer;
        
        var vl=0, vr=0;
        for(var i = 0; i < this.ops.length; ++i) {
            var op = this.ops[i];
            var fbase = this.pinc * op.pitch;
            var osc1 = varsaw(op.pha1, this.o1flt / fbase);
            if(this.timbre1==1)
                osc1 = triangle11(op.pha1);
            else if(this.timbre1==2)
                osc1 -= varsaw(op.pha1+this.pw, this.o1flt / fbase);
            
            var osc2 = varsaw(op.pha2, this.o2flt / fbase);
            vl += osc1 * op.fl;
            vr += osc1 * op.fr;
            op.pha1 += fbase * (1+osc2*this.fm12);
            op.pha2 += fbase * .99;
        }
        return [vl*env.value, vr*env.value];
    }
}

// Enhanced bass synth with advanced filtering
const bassSynth = synth.def(class {
    constructor() {
        this.p = Math.random();
        this.c = 100 + 100 * Math.random();
        this.svf = new SVF({num: 2, mode: 'lp'});
    }
    process(note, env, tick, options) {
        this.p += midi_to_hz(note) * ditty.dt;
        var v = varsaw(this.p, 4 + (500 * Math.exp(-tick * 5) + 10 * env.value) * .1);
        this.svf.fc = lerp(0.1, 0.3, env.value) * ditty.dt;
        v = this.svf.process(v);
        return v * env.value;
    }
}, {attack:.01});

// Analog2 synth for complex interactions
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
        this.flt = new SVF({q: .7, mode: 'bp'});
    }
    process(note, env, tick, opt) {
        this.flt.fc = 2 ** (-1+Math.min(1, tick * 2) * .7 - tick * .4) * ditty.dt;
        return this.flt.process(Math.random() - .5) * env.value;
    }
}, {attack: .01, release: 8, cutoff: .3, amp: .12});

// Karplus-Strong plucked string synthesis
const ks = synth.def(class {
    constructor(options) {
        let freq = midi_to_hz(options.note);
        let delay_samples = 1 / (freq * ditty.dt);
        this.len = Math.floor(delay_samples) + 1;
        this.fd = delay_samples % 1;
        this.buf = new Float32Array(this.len);
        this.pos = 0;
        this.a1 = clamp(2 * Math.PI * options.cutoff * ditty.dt, 0, 1);
        this.s0 = 0;
        let offs = Math.floor(this.len * (0.2 + 0.2*Math.random()));
        
        for(let i=0; i < 70 && i < this.len; i++){
            this.buf[i] = Math.random();
            this.buf[(i+offs)%this.len] += -this.buf[i];
        }
    }
    process(note, env, tick, options) {
        let pos = this.pos;
        let value = lerp(this.buf[pos], this.buf[(pos+1)%this.len], this.fd);
        this.s0 += this.a1 * (value - this.s0);
        this.buf[pos] = lerp(value, this.s0, options.lowpass_amt);
        this.pos = (pos+1)%this.len;
        return this.s0 * env.value;
    }
}, {env:adsr, release:2.75, cutoff:2500, lowpass_amt:0.1});

// Advanced band-pass filtered sawtooth synth (from Rainy Night)
const bpfSaw = synth.def(class {
    constructor(opt) {
        this.freq = midi_to_hz(opt.note);
        var coefs = calc_biquad_coefs({type:"resonance", f0:opt.cf, Q:opt.Q});
        this.filt = new TDF2(...coefs);
        this.p = opt.p0 || 0;
        this.dp = ditty.dt * this.freq;
        this.shimt = 0;
    }
    process(note, env, tick, opt) {
        this.shimt -= ditty.dt * opt.shimFreq;
        if(this.shimt <= 0) {
            var freq = this.freq * (1 + 0.06*rand(-1,1)*opt.shimAmp);
            this.dp = ditty.dt * freq;
            this.shimt = 1;
        }
        this.p += this.dp; this.p -= ~~this.p;
        return this.filt.process(aaSaw(this.p, this.dp)) * env.value * 0.05;
    }
}, {attack:0.01, release:0.3, cf:2500, Q:3, shimFreq:10, shimAmp:0});

// Enhanced synth definitions with improved parameters
const lead = synth.def(Analog, {nunison:4, detune:.2, attack: .01, fm12:20, amp: 1.3,
    pitch: (tick, opt)=>triangle11(Math.max(tick-.25,0)*3)});
const arpbass = synth.def(Analog, {nunison:4, detune:.2, attack: .01, fm12:(tick,opt)=>20+(ditty.tick%16)*4, amp: 1.3,
    pitch: (tick, opt)=>triangle11(Math.max(tick-.25,0)*3)});
const lead2 = synth.def(Analog, {nunison:4, detune:.2, attack: .01, timbre1:1, amp: 1,
    pitch: (tick, opt)=>12+triangle11(Math.max(tick-.25,0)*3)});
const bass = synth.def(Analog, {nunison:1, detune:.01, attack: .001, timbre1:2, sustain: 1, amp: 1, fm12:0,
    flt1:(tick, opt)=>2**Math.max(-tick * 24, -5)});
const bassLead = synth.def(Analog, {nunison:1, detune:.01, attack: .001, timbre1:2, sustain: 1, amp: 1, fm12:0,
    flt1:(tick, opt)=>2**Math.max(-tick * 24, -5)});
const pad = synth.def(Analog, {nunison:4, detune:.3, attack: .01, fm12:1, amp: 1, flt1: .15,
    pitch: 0, spread: 1, fshimmer: 30});
const bell = synth.def((ph, env, tick, opt) => Math.sin(Math.PI*2*(ph+Math.sin(Math.PI*2*ph*3) * Math.exp(tick*-20))) * env.value);
const orchhit = synth.def(Analog, {nunison:5, detune:.2, attack: .001, timbre1:0, decay: .1, sustain: .4, amp: 2.5, release: .1, fm12:15,
    flt1:(tick, opt)=>.01+2**(-tick * 20)});

// Formant data for voice synthesis
const tenor = [
    {f:[650,1080,2650,2900,3250], a:[0,-6,-7,-8,-22]},
    {f:[400,1700,2600,3200,3580], a:[0,-14,-12,-14,-20]},
    {f:[290,1870,2800,3250,3540], a:[0,-15,-18,-20,-30]},
    {f:[400,800,2600,2800,3000], a:[0,-10,-12,-12,-26]},
    {f:[350,600,2700,2900,3300], a:[0,-20,-17,-14,-26]}
];

const soprano = [
    {f:[800,1150,2900,3900,4950], a:[0,-6,-32,-20,-50]},
    {f:[350,2000,2800,3600,4950], a:[0,-20,-15,-40,-56]},
    {f:[270,2140,2950,3900,4950], a:[0,-12,-26,-26,-44]},
    {f:[450,800,2830,3800,4950], a:[0,-11,-22,-22,-50]},
    {f:[325,700,2700,3800,4950], a:[0,-16,-35,-40,-60]}
];

// Sophisticated voice synth with formant filtering and vowel synthesis
const voice = synth.def(class {
    constructor(opt) {
        this.f = [];
        for(var i = 0; i < 5; ++i)
            this.f.push(new SVF({mode:'bp', num:Math.floor(18-i*4), q:1}));
        this.p = 0;
    }
    process(note, env, tick, opt) {
        var k = Math.floor(opt.vowel);
        var inp = (Math.random()-.5) * .8;
        inp += (this.p-~~this.p)*2-1;
        this.p += ditty.dt * midi_to_hz(note - clamp01((.1-tick)*50)*.4 + Math.sin(tick*11)*.2);
        var v = 0;
        for(var i = 0; i < 5; ++i) {
            var freq = lerp(opt.vowels[k].f[i],opt.vowels[(k+1)%5].f[i], opt.vowel-k);
            var ampdb = lerp(opt.vowels[k].a[i],opt.vowels[(k+1)%5].a[i], opt.vowel-k);
            freq *= 2**opt.scale;
            this.f[i].fc = freq * ditty.dt;
            v += this.f[i].process(inp) * 10**(ampdb/20)
        }
        return v*env.value;
    }
});

// Melodic synths with advanced processing
const pluck = synth.def(Analog, {nunison:2, cutoff: 0, fa: .01, fd: 30, detune: .3, amp: .3, release: .1, attack:.005});
const synth1 = synth.def(Analog, {nunison:4, cutoff: .3, fa: .15, fd: 4, detune: .3, amp: .3});
const strings = synth.def(Analog, {nunison:4, attack: 1, release: 3, cutoff: .3, fa: .01, fd: 0, detune: .5, amp: .1});

// Enhanced drum sounds with better synthesis
var kick = synth.def((ph, env, tick, opt) => sat(Math.sin(Math.sqrt(ph) * 8 + ph * .5) * 2 * env.value), {note: c4, attack: .001, release: .2, duration: .1, amp: .6});
var snare = synth.def((ph, env, tick, opt) => sat(((Math.random() - .5) + Math.sin(Math.sqrt(ph) * 15 + ph * 3) * .5) * env.value), {note: c4, amp: 1.1, attack: 0, release: .3});
var clhat = synth.def((ph, env, tick, opt) => (Math.random()-.5) * env.value, {release: .05, amp: .5});
var ohat = synth.def((ph, env, tick, opt) => (Math.random()-.5) * env.value, {release: .2, amp: .6});
var woodblock = synth.def((ph, env, tick, opt) => Math.sin(ph * Math.PI * 2) * env.value, {note: hz_to_midi(537.8), amp: .4, duration: .013, release: .036});
var clave = synth.def((ph, env, tick, opt) => Math.sin(ph * Math.PI * 2) * env.value, {note: hz_to_midi(2100), amp: .4, duration: .013, release: .036});
var conga = synth.def((ph, env, tick, opt) => Math.sin(ph * Math.PI * 2) * env.value, {note: hz_to_midi(251), amp: .8, duration: .013, release: .1});
var crash = synth.def((ph, env, tick, opt) => (Math.random()-.5) * env.value, {amp: .8, duration: .013, release: 1.5});

// Traditional drum sounds for compatibility
var bassdrum = synth.def(class {
    constructor(opt) {
        this.t = 0;
    }
    process(note, env, tick, opt) {
        this.t += ditty.dt;
        return Math.sin(this.t * Math.PI * 2 * 65) * Math.exp(-this.t * 8) * env.value;
    }
}, {attack: .001, release: .165, duration: 0});

var hihat = synth.def((p, e, t, o) => (Math.random() - .5) * e.value, {release: .04, duration: 0, amp: .4});

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
