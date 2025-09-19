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
      
      // Create more realistic synthesizers
      this.synths.lead = new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.2 },
        filter: { frequency: 1200, type: 'lowpass' },
        filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8, baseFrequency: 1200, octaves: 2 }
      }).toDestination();

      this.synths.bass = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 1.5 },
        filter: { frequency: 800, type: 'lowpass' },
        filterEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.0, baseFrequency: 800, octaves: 1 }
      }).toDestination();

      this.synths.piano = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.0 },
        filter: { frequency: 2000, type: 'lowpass' }
      }).toDestination();
      
      // Add a pad synth for more texture
      this.synths.pad = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 3.0 },
        filter: { frequency: 800, type: 'lowpass' },
        filterEnvelope: { attack: 1.0, decay: 0.5, sustain: 0.6, release: 2.0, baseFrequency: 800, octaves: 1 }
      }).toDestination();

      // Create more realistic drum sounds
      this.drums.kick = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 12,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.8, sustain: 0.01, release: 0.8 }
      }).toDestination();

      this.drums.snare = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0.01, release: 0.3 },
        filter: { frequency: 1000, type: 'bandpass' },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2, baseFrequency: 1000, octaves: 2 }
      }).toDestination();

      this.drums.hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0.01, release: 0.15 },
        filter: { frequency: 8000, type: 'highpass' }
      }).toDestination();
      
      // Add crash cymbal
      this.drums.crash = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 1.5, sustain: 0.1, release: 1.5 },
        filter: { frequency: 6000, type: 'highpass' }
      }).toDestination();
      
      // Add open hi-hat
      this.drums.openhat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.4, sustain: 0.05, release: 0.4 },
        filter: { frequency: 10000, type: 'highpass' }
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

    // Sort melody by time to prevent timing conflicts
    const sortedMelody = melody.sort((a, b) => a.time - b.time);
    
    sortedMelody.forEach(({ note, time, duration, velocity = 0.7 }, index) => {
      // Add small offset to prevent exact timing conflicts
      const adjustedTime = time + (index * 0.001);
      
      Tone.Transport.schedule((scheduledTime) => {
        this.synths.lead.triggerAttackRelease(note, duration, scheduledTime, velocity);
      }, adjustedTime);
    });
  }

  playBass(bassLine, tempo = 120) {
    if (!this.isInitialized) return;

    Tone.Transport.bpm.value = tempo;

    // Sort bass line by time to prevent timing conflicts
    const sortedBass = bassLine.sort((a, b) => a.time - b.time);
    
    sortedBass.forEach(({ note, time, duration, velocity = 0.8 }, index) => {
      // Add small offset to prevent exact timing conflicts
      const adjustedTime = time + (index * 0.001);
      
      Tone.Transport.schedule((scheduledTime) => {
        this.synths.bass.triggerAttackRelease(note, duration, scheduledTime, velocity);
      }, adjustedTime);
    });
  }

  playDrums(drumPattern, tempo = 120) {
    if (!this.isInitialized) return;

    Tone.Transport.bpm.value = tempo;

    // Sort drum pattern by time to prevent timing conflicts
    const sortedDrums = drumPattern.sort((a, b) => a.time - b.time);
    
    sortedDrums.forEach(({ instrument, time, velocity = 0.6 }, index) => {
      // Add small offset to prevent exact timing conflicts
      const adjustedTime = time + (index * 0.001);
      
      Tone.Transport.schedule((scheduledTime) => {
        if (this.drums[instrument]) {
          this.drums[instrument].triggerAttackRelease('8n', scheduledTime, velocity);
        }
      }, adjustedTime);
    });
  }

  async playAll(patterns, tempo = 120) {
    if (!this.isInitialized) return;

    // Start audio context on first user interaction
    await this.startAudioContext();

    this.stop();
    Tone.Transport.bpm.value = tempo;
    
    // Reset transport to beginning
    Tone.Transport.position = 0;

    if (patterns.melody) this.playMelody(patterns.melody, tempo);
    if (patterns.bass) this.playBass(patterns.bass, tempo);
    if (patterns.drums) this.playDrums(patterns.drums, tempo);

    Tone.Transport.start();
  }

  stop() {
    if (this.isInitialized) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.position = 0;
    }
  }

  pause() {
    if (this.isInitialized) {
      Tone.Transport.pause();
    }
  }

  resume() {
    if (this.isInitialized) {
      Tone.Transport.start();
    }
  }

  // Add method to seek to specific time
  seekTo(timeInSeconds) {
    if (this.isInitialized) {
      Tone.Transport.seconds = timeInSeconds;
    }
  }

  // Add method to get current position
  getCurrentTime() {
    if (this.isInitialized) {
      return Tone.Transport.seconds;
    }
    return 0;
  }

  setVolume(volume) {
    if (this.isInitialized) {
      Tone.Destination.volume.value = Tone.gainToDb(volume);
    }
  }

  async startRecording() {
    if (!this.isInitialized) {
      console.error('Tone.js not initialized');
      return;
    }

    // If already recording, stop first
    if (this.isRecording) {
      console.log('🎵 Recorder already active, stopping first...');
      await this.stopRecording();
    }

    try {
      this.isRecording = true;
      this.recording = await this.recorder.start();
      console.log('🎵 Recording started successfully');
    } catch (error) {
      console.error('🎵 Failed to start recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  async stopRecording() {
    if (!this.isRecording) {
      console.log('🎵 No active recording to stop');
      return null;
    }

    try {
      this.isRecording = false;
      const recording = await this.recording;
      console.log('🎵 Recording stopped successfully');
      return recording;
    } catch (error) {
      console.error('🎵 Failed to stop recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  // Add method to get transport duration
  getDuration() {
    if (this.isInitialized) {
      // Calculate duration based on the longest pattern
      const events = Tone.Transport._events;
      let maxTime = 0;
      
      events.forEach(event => {
        if (event.time > maxTime) {
          maxTime = event.time;
        }
      });
      
      return maxTime;
    }
    return 0;
  }

  // Reset recorder state
  resetRecorder() {
    this.isRecording = false;
    this.recording = null;
    console.log('🎵 Recorder state reset');
  }

}

export default new ToneService();
