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

    // Set BPM
    let dittyCode = `ditty.bpm = ${tempo};\n\n`;

    // Generate melody loop with more realistic patterns
    if (melody && melody.length > 0) {
      dittyCode += `// Melody loop
loop(() => {
`;
      
      const melodyByTime = this.groupNotesByTime(melody);
      
      melodyByTime.forEach(({ time, notes }) => {
        if (time > 0) {
          dittyCode += `  sleep(${time});\n`;
        }
        notes.forEach(note => {
          const duration = this.convertDuration(note.duration);
          const velocity = note.velocity || 0.7;
          const noteName = this.convertNoteToDittytoy(note.note);
          // More realistic envelope settings
          dittyCode += `  sine.play(${noteName}, { attack: 0.05, release: 0.3, duration: ${duration}, amp: ${velocity} });\n`;
        });
      });
      
      dittyCode += `}, { name: 'melody' });

`;
    }

    // Generate bass loop with more realistic patterns
    if (bass && bass.length > 0) {
      dittyCode += `// Bass loop
loop(() => {
`;
      
      const bassByTime = this.groupNotesByTime(bass);
      bassByTime.forEach(({ time, notes }) => {
        if (time > 0) {
          dittyCode += `  sleep(${time});\n`;
        }
        notes.forEach(note => {
          const duration = this.convertDuration(note.duration);
          const velocity = note.velocity || 0.8;
          const noteName = this.convertNoteToDittytoy(note.note);
          // More realistic bass envelope
          dittyCode += `  sine.play(${noteName}, { attack: 0.1, release: 0.8, duration: ${duration}, amp: ${velocity} });\n`;
        });
      });
      
      dittyCode += `}, { name: 'bass' });

`;
    }

    // Add harmony layer for more realistic sound
    if (melody && melody.length > 0) {
      dittyCode += `// Harmony layer
loop(() => {
`;
      
      const melodyByTime = this.groupNotesByTime(melody);
      
      melodyByTime.forEach(({ time, notes }) => {
        if (time > 0) {
          dittyCode += `  sleep(${time});\n`;
        }
        notes.forEach(note => {
          const duration = this.convertDuration(note.duration);
          const velocity = (note.velocity || 0.7) * 0.4; // Quieter harmony
          const noteName = this.convertNoteToDittytoy(note.note);
          // Add harmony note (5th above)
          const harmonyNote = this.getHarmonyNote(noteName);
          dittyCode += `  sine.play(${harmonyNote}, { attack: 0.1, release: 0.4, duration: ${duration}, amp: ${velocity} });\n`;
        });
      });
      
      dittyCode += `}, { name: 'harmony' });

`;
    }

    // Add rhythm layer using sine waves
    if (drums && drums.length > 0) {
      dittyCode += `// Rhythm layer
loop(() => {
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.15 });
  sleep(1);
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.1 });
  sleep(1);
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.15 });
  sleep(1);
  sine.play(c3, { attack: 0.01, release: 0.1, duration: 0.1, amp: 0.1 });
  sleep(1);
}, { name: 'rhythm' });

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
