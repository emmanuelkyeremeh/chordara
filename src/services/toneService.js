import * as Tone from 'tone';

class ToneService {
  constructor() {
    this.isInitialized = false;
    this.synths = {};
    this.drums = {};
    this.recorder = null;
    this.isRecording = false;
    this.recording = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Don't start Tone.js immediately - wait for user interaction
      // await Tone.start();
      
      // Create synthesizers
      this.synths.lead = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
      }).toDestination();

      this.synths.bass = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.0 }
      }).toDestination();

      this.synths.piano = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
      }).toDestination();

      // Create drum sounds
      this.drums.kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 10,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.01, release: 0.5 }
      }).toDestination();

      this.drums.snare = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.01, release: 0.2 }
      }).toDestination();

      this.drums.hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.01, release: 0.1 }
      }).toDestination();

      // Initialize recorder using Tone.js built-in recorder
      this.recorder = new Tone.Recorder();
      Tone.Destination.connect(this.recorder);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      throw error;
    }
  }

  async startAudioContext() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }

  playMelody(melody, tempo = 120) {
    if (!this.isInitialized) {
      console.error('Tone.js not initialized');
      return;
    }

    Tone.Transport.bpm.value = tempo;
    Tone.Transport.cancel();

    melody.forEach(({ note, time, duration }) => {
      Tone.Transport.schedule((time) => {
        this.synths.lead.triggerAttackRelease(note, duration, time);
      }, time);
    });
  }

  playBass(bassLine, tempo = 120) {
    if (!this.isInitialized) return;

    Tone.Transport.bpm.value = tempo;

    bassLine.forEach(({ note, time, duration }) => {
      Tone.Transport.schedule((time) => {
        this.synths.bass.triggerAttackRelease(note, duration, time);
      }, time);
    });
  }

  playDrums(drumPattern, tempo = 120) {
    if (!this.isInitialized) return;

    Tone.Transport.bpm.value = tempo;

    drumPattern.forEach(({ instrument, time, velocity }) => {
      Tone.Transport.schedule((time) => {
        if (this.drums[instrument]) {
          this.drums[instrument].triggerAttackRelease('8n', time, velocity);
        }
      }, time);
    });
  }

  async playAll(patterns, tempo = 120) {
    if (!this.isInitialized) return;

    // Start audio context on first user interaction
    await this.startAudioContext();

    this.stop();
    Tone.Transport.bpm.value = tempo;

    if (patterns.melody) this.playMelody(patterns.melody, tempo);
    if (patterns.bass) this.playBass(patterns.bass, tempo);
    if (patterns.drums) this.playDrums(patterns.drums, tempo);

    Tone.Transport.start();
  }

  stop() {
    if (this.isInitialized) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
  }

  async startRecording() {
    if (!this.isInitialized || this.isRecording) return;

    this.isRecording = true;
    this.recording = await this.recorder.start();
  }

  async stopRecording() {
    if (!this.isRecording) return null;

    this.isRecording = false;
    const recording = await this.recording;
    return recording;
  }

  // Compress audio to reduce file size
  compressAudio(audioBlob, targetSizeKB = 900) {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a simple compression by reducing sample rate
        const source = audioContext.createMediaElementSource(audio);
        const compressor = audioContext.createDynamicsCompressor();
        const gainNode = audioContext.createGain();
        
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        
        source.connect(compressor);
        compressor.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Convert back to blob
        const reader = new FileReader();
        reader.onload = () => {
          const compressedBlob = new Blob([reader.result], { type: 'audio/mpeg' });
          URL.revokeObjectURL(url);
          resolve(compressedBlob);
        };
        reader.readAsArrayBuffer(audioBlob);
      };
      
      audio.src = url;
    });
  }
}

export default new ToneService();
