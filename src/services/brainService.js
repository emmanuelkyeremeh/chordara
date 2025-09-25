// Brain.js service for generating musical patterns optimized for Dittytoy
import * as brain from 'brain.js';

// Enhanced neural networks with better architecture for complex music generation
const melodyNet = new brain.NeuralNetwork({
  hiddenLayers: [16, 12, 8],
  learningRate: 0.2,
  activation: 'sigmoid'
});

const drumNet = new brain.NeuralNetwork({
  hiddenLayers: [12, 8, 6],
  learningRate: 0.25,
  activation: 'sigmoid'
});

const bassNet = new brain.NeuralNetwork({
  hiddenLayers: [10, 8, 6],
  learningRate: 0.2,
  activation: 'sigmoid'
});

// Enhanced training data with sophisticated musical patterns inspired by working dittytoy code
const melodyTrainingData = [
  // Electronic/Techno styles - complex arpeggiated patterns
  { input: { tempo: 0.8, style: 0.1, key: 0.1, mood: 0.9, complexity: 0.8, phrase: 0.1 }, output: { note1: 0.2, note2: 0.4, note3: 0.6, note4: 0.8, note5: 0.3, note6: 0.7, note7: 0.1, note8: 0.9, note9: 0.5, note10: 0.2, note11: 0.8, note12: 0.4, note13: 0.6, note14: 0.3, note15: 0.9, note16: 0.1 } },
  { input: { tempo: 0.9, style: 0.1, key: 0.3, mood: 0.7, complexity: 0.9, phrase: 0.3 }, output: { note1: 0.1, note2: 0.3, note3: 0.7, note4: 0.9, note5: 0.2, note6: 0.8, note7: 0.4, note8: 0.6, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.7, note13: 0.5, note14: 0.2, note15: 0.8, note16: 0.4 } },
  { input: { tempo: 0.7, style: 0.1, key: 0.5, mood: 0.5, complexity: 0.6, phrase: 0.5 }, output: { note1: 0.4, note2: 0.6, note3: 0.2, note4: 0.8, note5: 0.5, note6: 0.1, note7: 0.9, note8: 0.3, note9: 0.7, note10: 0.4, note11: 0.2, note12: 0.8, note13: 0.6, note14: 0.3, note15: 0.7, note16: 0.1 } },
  
  // Jazz styles - sophisticated voice leading and chromaticism
  { input: { tempo: 0.6, style: 0.3, key: 0.7, mood: 0.8, complexity: 0.9, phrase: 0.2 }, output: { note1: 0.3, note2: 0.7, note3: 0.5, note4: 0.1, note5: 0.8, note6: 0.2, note7: 0.6, note8: 0.4, note9: 0.9, note10: 0.1, note11: 0.5, note12: 0.7, note13: 0.3, note14: 0.8, note15: 0.2, note16: 0.6 } },
  { input: { tempo: 0.5, style: 0.3, key: 0.9, mood: 0.6, complexity: 0.8, phrase: 0.4 }, output: { note1: 0.6, note2: 0.2, note3: 0.8, note4: 0.4, note5: 0.1, note6: 0.9, note7: 0.3, note8: 0.7, note9: 0.4, note10: 0.8, note11: 0.2, note12: 0.6, note13: 0.9, note14: 0.1, note15: 0.5, note16: 0.7 } },
  
  // Rock styles - aggressive and driving patterns
  { input: { tempo: 0.9, style: 0.5, key: 0.2, mood: 0.9, complexity: 0.7, phrase: 0.3 }, output: { note1: 0.8, note2: 0.2, note3: 0.6, note4: 0.4, note5: 0.9, note6: 0.1, note7: 0.7, note8: 0.3, note9: 0.5, note10: 0.9, note11: 0.1, note12: 0.6, note13: 0.8, note14: 0.2, note15: 0.7, note16: 0.3 } },
  { input: { tempo: 0.8, style: 0.5, key: 0.4, mood: 0.7, complexity: 0.8, phrase: 0.5 }, output: { note1: 0.7, note2: 0.3, note3: 0.9, note4: 0.1, note5: 0.4, note6: 0.8, note7: 0.2, note8: 0.6, note9: 0.8, note10: 0.2, note11: 0.5, note12: 0.9, note13: 0.1, note14: 0.7, note15: 0.3, note16: 0.8 } },
  
  // Ambient styles - ethereal and spacious
  { input: { tempo: 0.3, style: 0.7, key: 0.6, mood: 0.3, complexity: 0.5, phrase: 0.1 }, output: { note1: 0.5, note2: 0.1, note3: 0.3, note4: 0.7, note5: 0.2, note6: 0.8, note7: 0.4, note8: 0.6, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.5, note13: 0.7, note14: 0.2, note15: 0.6, note16: 0.4 } },
  { input: { tempo: 0.4, style: 0.7, key: 0.8, mood: 0.4, complexity: 0.6, phrase: 0.3 }, output: { note1: 0.2, note2: 0.6, note3: 0.4, note4: 0.8, note5: 0.1, note6: 0.5, note7: 0.9, note8: 0.3, note9: 0.7, note10: 0.2, note11: 0.8, note12: 0.4, note13: 0.6, note14: 0.1, note15: 0.5, note16: 0.9 } },
  
  // Pop styles - catchy and memorable
  { input: { tempo: 0.7, style: 0.9, key: 0.1, mood: 0.8, complexity: 0.6, phrase: 0.2 }, output: { note1: 0.3, note2: 0.7, note3: 0.5, note4: 0.9, note5: 0.2, note6: 0.6, note7: 0.8, note8: 0.4, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.7, note13: 0.5, note14: 0.2, note15: 0.8, note16: 0.4 } },
  { input: { tempo: 0.8, style: 0.9, key: 0.3, mood: 0.9, complexity: 0.7, phrase: 0.4 }, output: { note1: 0.6, note2: 0.2, note3: 0.8, note4: 0.4, note5: 0.7, note6: 0.1, note7: 0.5, note8: 0.9, note9: 0.2, note10: 0.8, note11: 0.4, note12: 0.6, note13: 0.3, note14: 0.9, note15: 0.1, note16: 0.7 } },
  
  // Classical styles - structured and harmonic
  { input: { tempo: 0.6, style: 0.2, key: 0.5, mood: 0.7, complexity: 0.9, phrase: 0.1 }, output: { note1: 0.4, note2: 0.8, note3: 0.2, note4: 0.6, note5: 0.9, note6: 0.1, note7: 0.5, note8: 0.7, note9: 0.3, note10: 0.9, note11: 0.1, note12: 0.5, note13: 0.7, note14: 0.3, note15: 0.8, note16: 0.2 } },
  { input: { tempo: 0.5, style: 0.2, key: 0.7, mood: 0.5, complexity: 0.8, phrase: 0.3 }, output: { note1: 0.7, note2: 0.3, note3: 0.9, note4: 0.1, note5: 0.6, note6: 0.8, note7: 0.2, note8: 0.4, note9: 0.9, note10: 0.1, note11: 0.7, note12: 0.3, note13: 0.5, note14: 0.8, note15: 0.2, note16: 0.6 } },
  
  // Blues styles - soulful and expressive
  { input: { tempo: 0.6, style: 0.4, key: 0.3, mood: 0.6, complexity: 0.7, phrase: 0.2 }, output: { note1: 0.5, note2: 0.1, note3: 0.7, note4: 0.3, note5: 0.9, note6: 0.2, note7: 0.6, note8: 0.4, note9: 0.8, note10: 0.1, note11: 0.5, note12: 0.7, note13: 0.3, note14: 0.9, note15: 0.2, note16: 0.6 } },
  { input: { tempo: 0.7, style: 0.4, key: 0.5, mood: 0.8, complexity: 0.8, phrase: 0.4 }, output: { note1: 0.2, note2: 0.8, note3: 0.4, note4: 0.6, note5: 0.1, note6: 0.9, note7: 0.3, note8: 0.7, note9: 0.5, note10: 0.2, note11: 0.8, note12: 0.4, note13: 0.6, note14: 0.1, note15: 0.7, note16: 0.3 } },
  
  // Techno/Minimal styles - hypnotic and repetitive
  { input: { tempo: 0.9, style: 0.0, key: 0.2, mood: 0.8, complexity: 0.6, phrase: 0.5 }, output: { note1: 0.3, note2: 0.7, note3: 0.3, note4: 0.7, note5: 0.3, note6: 0.7, note7: 0.3, note8: 0.7, note9: 0.3, note10: 0.7, note11: 0.3, note12: 0.7, note13: 0.3, note14: 0.7, note15: 0.3, note16: 0.7 } },
  { input: { tempo: 0.8, style: 0.0, key: 0.4, mood: 0.7, complexity: 0.5, phrase: 0.3 }, output: { note1: 0.6, note2: 0.4, note3: 0.6, note4: 0.4, note5: 0.6, note6: 0.4, note7: 0.6, note8: 0.4, note9: 0.6, note10: 0.4, note11: 0.6, note12: 0.4, note13: 0.6, note14: 0.4, note15: 0.6, note16: 0.4 } }
];

// Enhanced drum patterns with sophisticated rhythms inspired by dittytoy
const drumTrainingData = [
  // Electronic/Techno patterns - four-on-floor with variations
  { input: { tempo: 0.8, style: 0.1, mood: 0.9, complexity: 0.8, phrase: 0.1 }, output: { kick: 0.9, snare: 0.6, hihat: 0.7, crash: 0.2, openhat: 0.1, clap: 0.3 } },
  { input: { tempo: 0.9, style: 0.1, mood: 0.7, complexity: 0.9, phrase: 0.3 }, output: { kick: 0.8, snare: 0.7, hihat: 0.8, crash: 0.3, openhat: 0.2, clap: 0.4 } },
  { input: { tempo: 0.7, style: 0.1, mood: 0.5, complexity: 0.6, phrase: 0.5 }, output: { kick: 0.7, snare: 0.5, hihat: 0.6, crash: 0.1, openhat: 0.1, clap: 0.2 } },
  
  // Rock patterns - driving and aggressive
  { input: { tempo: 0.9, style: 0.5, mood: 0.9, complexity: 0.7, phrase: 0.3 }, output: { kick: 0.9, snare: 0.8, hihat: 0.5, crash: 0.6, openhat: 0.3, clap: 0.1 } },
  { input: { tempo: 0.8, style: 0.5, mood: 0.7, complexity: 0.8, phrase: 0.5 }, output: { kick: 0.8, snare: 0.9, hihat: 0.6, crash: 0.4, openhat: 0.2, clap: 0.2 } },
  
  // Jazz patterns - complex and syncopated
  { input: { tempo: 0.6, style: 0.3, mood: 0.8, complexity: 0.9, phrase: 0.2 }, output: { kick: 0.4, snare: 0.6, hihat: 0.8, crash: 0.2, openhat: 0.4, clap: 0.1 } },
  { input: { tempo: 0.5, style: 0.3, mood: 0.6, complexity: 0.8, phrase: 0.4 }, output: { kick: 0.3, snare: 0.7, hihat: 0.9, crash: 0.1, openhat: 0.5, clap: 0.1 } },
  
  // Ambient patterns - minimal and spacious
  { input: { tempo: 0.3, style: 0.7, mood: 0.3, complexity: 0.5, phrase: 0.1 }, output: { kick: 0.2, snare: 0.3, hihat: 0.7, crash: 0.1, openhat: 0.6, clap: 0.1 } },
  { input: { tempo: 0.4, style: 0.7, mood: 0.4, complexity: 0.6, phrase: 0.3 }, output: { kick: 0.3, snare: 0.4, hihat: 0.8, crash: 0.1, openhat: 0.7, clap: 0.1 } },
  
  // Pop patterns - steady and accessible
  { input: { tempo: 0.7, style: 0.9, mood: 0.8, complexity: 0.6, phrase: 0.2 }, output: { kick: 0.7, snare: 0.6, hihat: 0.5, crash: 0.3, openhat: 0.2, clap: 0.3 } },
  { input: { tempo: 0.8, style: 0.9, mood: 0.9, complexity: 0.7, phrase: 0.4 }, output: { kick: 0.8, snare: 0.7, hihat: 0.6, crash: 0.4, openhat: 0.3, clap: 0.4 } },
  
  // Classical patterns - structured and controlled
  { input: { tempo: 0.6, style: 0.2, mood: 0.7, complexity: 0.9, phrase: 0.1 }, output: { kick: 0.5, snare: 0.5, hihat: 0.4, crash: 0.2, openhat: 0.2, clap: 0.1 } },
  { input: { tempo: 0.5, style: 0.2, mood: 0.5, complexity: 0.8, phrase: 0.3 }, output: { kick: 0.4, snare: 0.6, hihat: 0.5, crash: 0.1, openhat: 0.3, clap: 0.1 } },
  
  // Blues patterns - soulful and groovy
  { input: { tempo: 0.6, style: 0.4, mood: 0.6, complexity: 0.7, phrase: 0.2 }, output: { kick: 0.6, snare: 0.5, hihat: 0.6, crash: 0.2, openhat: 0.3, clap: 0.2 } },
  { input: { tempo: 0.7, style: 0.4, mood: 0.8, complexity: 0.8, phrase: 0.4 }, output: { kick: 0.7, snare: 0.6, hihat: 0.7, crash: 0.3, openhat: 0.4, clap: 0.3 } },
  
  // Breakbeat patterns - complex and syncopated
  { input: { tempo: 0.8, style: 0.6, mood: 0.8, complexity: 0.9, phrase: 0.3 }, output: { kick: 0.6, snare: 0.8, hihat: 0.9, crash: 0.4, openhat: 0.5, clap: 0.6 } },
  { input: { tempo: 0.7, style: 0.6, mood: 0.7, complexity: 0.8, phrase: 0.5 }, output: { kick: 0.5, snare: 0.9, hihat: 0.8, crash: 0.3, openhat: 0.6, clap: 0.5 } }
];

// Bass training data for harmonic movement
const bassTrainingData = [
  // Root movement patterns
  { input: { tempo: 0.7, style: 0.3, mood: 0.6, complexity: 0.7, phrase: 0.2 }, output: { root: 0.8, fifth: 0.2, octave: 0.1, passing: 0.1, chromatic: 0.1 } },
  { input: { tempo: 0.8, style: 0.5, mood: 0.8, complexity: 0.8, phrase: 0.4 }, output: { root: 0.6, fifth: 0.3, octave: 0.2, passing: 0.2, chromatic: 0.2 } },
  { input: { tempo: 0.6, style: 0.3, mood: 0.7, complexity: 0.9, phrase: 0.3 }, output: { root: 0.5, fifth: 0.4, octave: 0.3, passing: 0.3, chromatic: 0.3 } },
  
  // Walking bass patterns
  { input: { tempo: 0.5, style: 0.3, mood: 0.6, complexity: 0.8, phrase: 0.2 }, output: { root: 0.4, fifth: 0.3, octave: 0.2, passing: 0.4, chromatic: 0.3 } },
  { input: { tempo: 0.6, style: 0.4, mood: 0.8, complexity: 0.9, phrase: 0.4 }, output: { root: 0.3, fifth: 0.3, octave: 0.2, passing: 0.5, chromatic: 0.4 } },
  
  // Electronic bass patterns
  { input: { tempo: 0.9, style: 0.1, mood: 0.9, complexity: 0.6, phrase: 0.3 }, output: { root: 0.9, fifth: 0.1, octave: 0.2, passing: 0.1, chromatic: 0.1 } },
  { input: { tempo: 0.8, style: 0.1, mood: 0.7, complexity: 0.7, phrase: 0.5 }, output: { root: 0.8, fifth: 0.2, octave: 0.3, passing: 0.2, chromatic: 0.2 } }
];

// Train the networks
melodyNet.train(melodyTrainingData);
drumNet.train(drumTrainingData);
bassNet.train(bassTrainingData);

export const generateMelody = (instructions, duration = 60) => {
  const { tempo, key, melodyStyle, chordProgression, mood, style } = instructions;
  const beatsPerSecond = tempo / 60;
  const totalBeats = duration * beatsPerSecond;
  
  // Enhanced normalization with phrase awareness
  const normalizedTempo = Math.min(tempo / 200, 1);
  const normalizedStyle = style === 'electronic' ? 0.1 : 
                         style === 'jazz' ? 0.3 : 
                         style === 'rock' ? 0.5 : 
                         style === 'ambient' ? 0.7 : 
                         style === 'pop' ? 0.9 : 
                         style === 'classical' ? 0.2 :
                         style === 'blues' ? 0.4 : 
                         style === 'techno' ? 0.0 : 0.5;
  const normalizedKey = key === 'C' ? 0.1 : key === 'G' ? 0.3 : key === 'F' ? 0.5 : 
                       key === 'D' ? 0.7 : key === 'A' ? 0.9 : 0.5;
  const normalizedMood = mood === 'energetic' ? 0.9 : 
                        mood === 'melancholic' ? 0.2 : 
                        mood === 'uplifting' ? 0.8 : 
                        mood === 'calm' ? 0.3 : 0.5;
  const normalizedComplexity = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
  
  console.log(`🎵 Generating melody for ${duration}s track:`, {
    tempo, key, style, mood, complexity: normalizedComplexity
  });
  
  // Enhanced chord progressions with sophisticated voicings and extensions
  const chordNotes = {
    'C': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'B5', 'D6'],
    'Am': ['A2', 'C3', 'E3', 'A3', 'C4', 'E4', 'A4', 'C5', 'E5', 'G5', 'B5'],
    'F': ['F2', 'A2', 'C3', 'F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'E5', 'G5'],
    'G': ['G2', 'B2', 'D3', 'G3', 'B3', 'D4', 'G4', 'B4', 'D5', 'F#5', 'A5'],
    'D': ['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'C#6', 'E6'],
    'Em': ['E2', 'G2', 'B2', 'E3', 'G3', 'B3', 'E4', 'G4', 'B4', 'D5', 'F#5'],
    'Dm': ['D3', 'F3', 'A3', 'D4', 'F4', 'A4', 'D5', 'F5', 'A5', 'C6', 'E6'],
    'Bb': ['Bb2', 'D3', 'F3', 'Bb3', 'D4', 'F4', 'Bb4', 'D5', 'F5', 'A5', 'C6'],
    'Gm': ['G2', 'Bb2', 'D3', 'G3', 'Bb3', 'D4', 'G4', 'Bb4', 'D5', 'F5', 'A5'],
    // Add more sophisticated chords
    'Cmaj7': ['C3', 'E3', 'G3', 'B3', 'C4', 'E4', 'G4', 'B4', 'C5', 'E5', 'G5'],
    'Am7': ['A2', 'C3', 'E3', 'G3', 'A3', 'C4', 'E4', 'G4', 'A4', 'C5', 'E5'],
    'Fmaj7': ['F2', 'A2', 'C3', 'E3', 'F3', 'A3', 'C4', 'E4', 'F4', 'A4', 'C5'],
    'G7': ['G2', 'B2', 'D3', 'F3', 'G3', 'B3', 'D4', 'F4', 'G4', 'B4', 'D5'],
    'Dm7': ['D3', 'F3', 'A3', 'C4', 'D4', 'F4', 'A4', 'C5', 'D5', 'F5', 'A5'],
    'Em7': ['E2', 'G2', 'B2', 'D3', 'E3', 'G3', 'B3', 'D4', 'E4', 'G4', 'B4']
  };
  
  // Add passing tones and chromatic notes for more realistic melodies
  const passingTones = ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 'C#4', 'D#4', 'F#4', 'G#4', 'A#4'];
  const chromaticNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const melody = [];
  const beatsPerChord = totalBeats / chordProgression.length;
  
  // Add some randomness for uniqueness
  const randomSeed = Math.random();
  let previousNote = null;
  
    // Create more sophisticated phrase structure
    const phraseStructure = ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'];
    const phraseLength = chordProgression.length / phraseStructure.length;
    
    // Add dynamic intensity mapping
    const intensityMap = {
      'intro': 0.3,
      'verse': 0.5,
      'pre-chorus': 0.7,
      'chorus': 1.0,
      'bridge': 0.4,
      'outro': 0.2
    };
  
  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i];
    const notes = chordNotes[chord] || chordNotes['C'];
    const currentPhrase = phraseStructure[Math.floor(i / phraseLength)] || 'verse';
    
    // Use neural network with phrase awareness and enhanced parameters
    const normalizedPhrase = currentPhrase === 'intro' ? 0.1 : 
                            currentPhrase === 'verse' ? 0.2 : 
                            currentPhrase === 'pre-chorus' ? 0.3 : 
                            currentPhrase === 'chorus' ? 0.4 : 
                            currentPhrase === 'bridge' ? 0.5 : 0.6;
    
    const prediction = melodyNet.run({
      tempo: normalizedTempo,
      style: normalizedStyle,
      key: normalizedKey,
      mood: normalizedMood,
      complexity: normalizedComplexity,
      phrase: normalizedPhrase
    });
    
    // Create more complex note patterns (16 notes for more variety)
    const notePattern = [
      Math.floor(prediction.note1 * notes.length),
      Math.floor(prediction.note2 * notes.length),
      Math.floor(prediction.note3 * notes.length),
      Math.floor(prediction.note4 * notes.length),
      Math.floor(prediction.note5 * notes.length),
      Math.floor(prediction.note6 * notes.length),
      Math.floor(prediction.note7 * notes.length),
      Math.floor(prediction.note8 * notes.length),
      Math.floor(prediction.note9 * notes.length),
      Math.floor(prediction.note10 * notes.length),
      Math.floor(prediction.note11 * notes.length),
      Math.floor(prediction.note12 * notes.length),
      Math.floor(prediction.note1 * notes.length * 0.5), // Add variation
      Math.floor(prediction.note2 * notes.length * 0.7),
      Math.floor(prediction.note3 * notes.length * 0.9),
      Math.floor(prediction.note4 * notes.length * 1.2) % notes.length
    ];
    
    // More sophisticated rhythmic patterns based on phrase and style
    let rhythmPattern;
    const currentIntensity = intensityMap[currentPhrase] || 0.5;
    
    if (currentPhrase === 'intro') {
      rhythmPattern = ['2n', '4n', '4n', '8n', '8n', '4n', '8n', '4n', '2n', '4n', '8n', '8n', '4n', '8n', '4n', '2n'];
    } else if (currentPhrase === 'pre-chorus') {
      rhythmPattern = ['8n', '8n', '4n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '4n', '8n', '8n', '4n'];
    } else if (currentPhrase === 'chorus') {
      if (style === 'electronic' || style === 'rock') {
        rhythmPattern = ['4n', '4n', '8n', '8n', '4n', '4n', '8n', '8n', '4n', '4n', '8n', '8n', '4n', '4n', '8n', '8n'];
      } else {
        rhythmPattern = ['8n', '8n', '4n', '4n', '8n', '8n', '4n', '4n', '8n', '8n', '4n', '4n', '8n', '8n', '4n', '4n'];
      }
    } else if (currentPhrase === 'verse') {
      rhythmPattern = ['8n', '8n', '4n', '8n', '8n', '4n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '4n'];
    } else if (currentPhrase === 'bridge') {
      rhythmPattern = ['4n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n', '8n', '8n', '4n'];
    } else { // outro
      rhythmPattern = ['2n', '4n', '4n', '2n', '4n', '4n', '2n', '4n', '4n', '2n', '4n', '4n', '2n', '4n', '4n', '1n'];
    }
    
    for (let beat = 0; beat < beatsPerChord; beat++) {
      const patternIndex = beat % notePattern.length;
      let noteIndex = notePattern[patternIndex];
      
      // Add melodic contour and avoid jumps
      if (previousNote && Math.random() > 0.3) {
        const prevOctave = parseInt(previousNote.match(/\d+/)?.[0] || '4');
        const prevNote = previousNote.replace(/\d+/, '');
        const currentOctave = parseInt(notes[noteIndex].match(/\d+/)?.[0] || '4');
        
        // Create smoother melodic lines
        if (Math.abs(currentOctave - prevOctave) > 1) {
          noteIndex = Math.floor(noteIndex * 0.7) % notes.length;
        }
      }
      
      let note = notes[noteIndex];
      
      // Add passing tones occasionally (10% chance)
      if (Math.random() < 0.1) {
        const passingTone = passingTones[Math.floor(Math.random() * passingTones.length)];
        if (Math.random() < 0.5) {
          note = passingTone;
        }
      }
      
      // Add some octave variation based on phrase (optimized for Dittytoy)
      let octaveVariation = 0;
      if (currentPhrase === 'chorus') {
        octaveVariation = Math.floor((prediction[`note${(patternIndex % 8) + 1}`] - 0.5) * 2);
      } else {
        octaveVariation = Math.floor((prediction[`note${(patternIndex % 8) + 1}`] - 0.5) * 1);
      }
      
      const finalNote = note.replace(/\d+/, (match) => {
        const octave = parseInt(match) + octaveVariation;
        return Math.max(3, Math.min(6, octave)); // Keep within Dittytoy-friendly range
      });
      
      // Calculate velocity based on phrase, mood, and intensity
      let velocity = 0.6 + (prediction[`note${(patternIndex % 8) + 1}`] * 0.4);
      
      // Apply phrase-based intensity
      velocity *= currentIntensity;
      
      // Apply mood-based adjustments
      if (mood === 'energetic') velocity *= 1.2;
      else if (mood === 'melancholic' || mood === 'calm') velocity *= 0.7;
      
      // Apply style-based adjustments
      if (style === 'electronic' || style === 'rock') velocity *= 1.1;
      else if (style === 'ambient' || style === 'classical') velocity *= 0.8;
      
      velocity = Math.min(1, Math.max(0.2, velocity));
      
      // Add advanced note characteristics optimized for Dittytoy
      const noteData = {
        note: finalNote,
        duration: rhythmPattern[patternIndex],
        time: (i * beatsPerChord + beat) / beatsPerSecond,
        velocity: velocity,
        // Dittytoy-specific characteristics with advanced features
        attack: 0.01 + (prediction[`note${(patternIndex % 8) + 1}`] * 0.05),
        release: 0.2 + (prediction[`note${(patternIndex % 8) + 1}`] * 0.4),
        // Advanced expression and dynamics
        expression: currentIntensity,
        // Voice leading and tension
        tension: Math.abs(prediction[`note${(patternIndex % 8) + 1}`] - 0.5) * 2,
        // Harmonic function
        harmonicFunction: currentPhrase === 'chorus' ? 'tonic' : 
                         currentPhrase === 'verse' ? 'subdominant' : 'dominant',
        // Dittytoy-compatible legato and articulation
        legato: beat % 2 === 0 && patternIndex % 2 === 0 ? 0.8 : 0.3,
        // Advanced articulation
        articulation: style === 'jazz' ? 'staccato' : 
                     style === 'classical' ? 'legato' : 'normal',
        // Micro-timing for human feel
        microTiming: (Math.random() - 0.5) * 0.02
      };
      
      melody.push(noteData);
      
      previousNote = finalNote;
    }
  }
  
  console.log(`🎵 Generated ${melody.length} melody notes`);
  return melody;
};

export const generateDrumPattern = (instructions, duration = 60) => {
  const { tempo, drumPattern, style, mood } = instructions;
  const beatsPerSecond = tempo / 60;
  const totalBeats = duration * beatsPerSecond;
  
  console.log(`🥁 Generating drum pattern for ${duration}s track:`, {
    tempo, drumPattern, style, mood
  });
  
  // Enhanced normalization for drum patterns
  const normalizedTempo = Math.min(tempo / 200, 1);
  const normalizedStyle = drumPattern === 'four-on-floor' ? 0.2 : 
                         drumPattern === 'breakbeat' ? 0.5 : 
                         drumPattern === 'minimal' ? 0.8 : 
                         style === 'electronic' ? 0.1 :
                         style === 'rock' ? 0.5 :
                         style === 'jazz' ? 0.3 :
                         style === 'ambient' ? 0.7 :
                         style === 'pop' ? 0.9 : 0.5;
  const normalizedMood = mood === 'energetic' ? 0.9 : 
                        mood === 'melancholic' ? 0.2 : 
                        mood === 'uplifting' ? 0.8 : 
                        mood === 'calm' ? 0.3 : 0.5;
  const normalizedComplexity = Math.random() * 0.4 + 0.6;
  
  const drums = [];
  
    // Create more sophisticated drum patterns based on style and mood
    const phraseLength = Math.floor(totalBeats / 8); // 8 phrases in a song
    
    for (let beat = 0; beat < totalBeats; beat++) {
      const beatInMeasure = beat % 4;
      const beatInSong = beat % 16; // For longer patterns
      const phraseIndex = Math.floor(beat / phraseLength);
      const phraseType = ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'][phraseIndex] || 'verse';
      const normalizedBeat = beatInMeasure / 4;
      
      // Dynamic intensity based on phrase
      const phraseIntensity = {
        'intro': 0.4,
        'verse': 0.6,
        'pre-chorus': 0.8,
        'chorus': 1.0,
        'bridge': 0.5,
        'outro': 0.3
      }[phraseType] || 0.6;
    
    // Use enhanced neural network to determine drum hits
    const normalizedPhrase = phraseType === 'intro' ? 0.1 : 
                            phraseType === 'verse' ? 0.2 : 
                            phraseType === 'pre-chorus' ? 0.3 : 
                            phraseType === 'chorus' ? 0.4 : 
                            phraseType === 'bridge' ? 0.5 : 0.6;
    
    const prediction = drumNet.run({
      tempo: normalizedTempo,
      style: normalizedStyle,
      mood: normalizedMood,
      complexity: normalizedComplexity,
      phrase: normalizedPhrase
    });
    
    // Apply enhanced neural network predictions with sophisticated style-specific logic
    let kickThreshold, snareThreshold, hihatThreshold, crashThreshold, openhatThreshold, clapThreshold;
    
    if (style === 'electronic' || style === 'techno') {
      kickThreshold = prediction.kick * 0.9;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.7;
      crashThreshold = prediction.crash * 0.2;
      openhatThreshold = prediction.openhat * 0.1;
      clapThreshold = prediction.clap * 0.3;
    } else if (style === 'rock') {
      kickThreshold = prediction.kick * 0.9;
      snareThreshold = prediction.snare * 0.8;
      hihatThreshold = prediction.hihat * 0.5;
      crashThreshold = prediction.crash * 0.6;
      openhatThreshold = prediction.openhat * 0.3;
      clapThreshold = prediction.clap * 0.1;
    } else if (style === 'jazz') {
      kickThreshold = prediction.kick * 0.4;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.8;
      crashThreshold = prediction.crash * 0.2;
      openhatThreshold = prediction.openhat * 0.4;
      clapThreshold = prediction.clap * 0.1;
    } else if (style === 'ambient') {
      kickThreshold = prediction.kick * 0.2;
      snareThreshold = prediction.snare * 0.3;
      hihatThreshold = prediction.hihat * 0.7;
      crashThreshold = prediction.crash * 0.1;
      openhatThreshold = prediction.openhat * 0.6;
      clapThreshold = prediction.clap * 0.1;
    } else if (style === 'pop') {
      kickThreshold = prediction.kick * 0.7;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.5;
      crashThreshold = prediction.crash * 0.3;
      openhatThreshold = prediction.openhat * 0.2;
      clapThreshold = prediction.clap * 0.3;
    } else {
      kickThreshold = prediction.kick * 0.7;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.4;
      crashThreshold = prediction.crash * 0.2;
      openhatThreshold = prediction.openhat * 0.2;
      clapThreshold = prediction.clap * 0.2;
    }
    
    // More sophisticated pattern-based logic
    let kickPattern, snarePattern, hihatPattern;
    
    if (drumPattern === 'four-on-floor') {
      kickPattern = [1, 0.3, 0.8, 0.2];
      snarePattern = [0.1, 1, 0.2, 0.9];
      hihatPattern = [0.8, 0.6, 0.9, 0.7];
    } else if (drumPattern === 'breakbeat') {
      kickPattern = [1, 0.4, 0.6, 0.3, 0.8, 0.2, 0.7, 0.4];
      snarePattern = [0.2, 0.8, 0.3, 0.9, 0.1, 0.7, 0.4, 0.6];
      hihatPattern = [0.9, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6];
    } else if (drumPattern === 'minimal') {
      kickPattern = [1, 0.1, 0.8, 0.1];
      snarePattern = [0.1, 0.8, 0.1, 0.6];
      hihatPattern = [0.6, 0.4, 0.7, 0.3];
    } else {
      kickPattern = [1, 0.3, 0.8, 0.2];
      snarePattern = [0.1, 1, 0.2, 0.9];
      hihatPattern = [0.8, 0.6, 0.9, 0.7];
    }
    
    // Apply mood-based and phrase-based variations
    const moodMultiplier = normalizedMood > 0.7 ? 1.1 : normalizedMood < 0.3 ? 0.8 : 1.0;
    const phraseMultiplier = phraseIntensity;
    
    const kickValue = kickPattern[beatInMeasure % kickPattern.length] * kickThreshold * moodMultiplier * phraseMultiplier;
    const snareValue = snarePattern[beatInMeasure % snarePattern.length] * snareThreshold * moodMultiplier * phraseMultiplier;
    const hihatValue = hihatPattern[beatInMeasure % hihatPattern.length] * hihatThreshold * moodMultiplier * phraseMultiplier;
    
    // Add ghost notes and accents with phrase awareness
    const isGhostNote = Math.random() < (phraseType === 'verse' ? 0.2 : 0.1);
    const isAccent = beatInMeasure === 0 || (beatInMeasure === 2 && phraseType === 'chorus');
    const isFill = beatInMeasure === 3 && Math.random() < 0.3 && phraseType !== 'intro' && phraseType !== 'outro';
    
    if (kickValue > 0.4) {
      drums.push({
        instrument: 'kick',
        time: beat / beatsPerSecond,
        velocity: isGhostNote ? Math.min(kickValue * 0.3, 0.4) : 
                 isAccent ? Math.min(kickValue * 1.3, 1) : Math.min(kickValue, 1)
      });
    }
    
    if (snareValue > 0.3) {
      drums.push({
        instrument: 'snare',
        time: beat / beatsPerSecond,
        velocity: isGhostNote ? Math.min(snareValue * 0.3, 0.4) : 
                 isAccent ? Math.min(snareValue * 1.3, 1) : Math.min(snareValue, 1)
      });
      
      // Add snare rolls for fills
      if (isFill && Math.random() < 0.5) {
        for (let roll = 0; roll < 3; roll++) {
          drums.push({
            instrument: 'snare',
            time: (beat + roll * 0.1) / beatsPerSecond,
            velocity: 0.4 + Math.random() * 0.3
          });
        }
      }
    }
    
    if (hihatValue > 0.2) {
      // Vary between closed and open hi-hat
      const instrument = isAccent && Math.random() < 0.3 ? 'openhat' : 'hihat';
      drums.push({
        instrument: instrument,
        time: beat / beatsPerSecond,
        velocity: isGhostNote ? Math.min(hihatValue * 0.3, 0.4) : 
                 isAccent ? Math.min(hihatValue * 1.2, 0.9) : Math.min(hihatValue, 0.8)
      });
    }
    
    // Add crash cymbal with enhanced phrase awareness
    if (crashThreshold > 0.3) {
      const crashVelocity = isAccent ? Math.min(crashThreshold * 1.3, 1) : Math.min(crashThreshold, 0.8);
      if (beatInMeasure === 0 && phraseType === 'chorus' && Math.random() < 0.4) {
        drums.push({
          instrument: 'crash',
          time: beat / beatsPerSecond,
          velocity: crashVelocity
        });
      } else if (beatInMeasure === 0 && Math.random() < 0.1) {
        drums.push({
          instrument: 'crash',
          time: beat / beatsPerSecond,
          velocity: crashVelocity * 0.8
        });
      }
    }
    
    // Add open hi-hat with sophisticated patterns
    if (openhatThreshold > 0.2 && Math.random() < 0.3) {
      const openhatVelocity = isAccent ? Math.min(openhatThreshold * 1.2, 0.9) : Math.min(openhatThreshold, 0.7);
      drums.push({
        instrument: 'openhat',
        time: beat / beatsPerSecond,
        velocity: openhatVelocity
      });
    }
    
    // Add clap with style-specific patterns
    if (clapThreshold > 0.2 && (style === 'electronic' || style === 'pop') && Math.random() < 0.4) {
      const clapVelocity = isAccent ? Math.min(clapThreshold * 1.2, 0.9) : Math.min(clapThreshold, 0.7);
      drums.push({
        instrument: 'clap',
        time: beat / beatsPerSecond,
        velocity: clapVelocity
      });
    }
  }
  
  console.log(`🥁 Generated ${drums.length} drum hits`);
  return drums;
};

export const generateBassLine = (instructions, duration = 60) => {
  const { tempo, chordProgression, style, mood } = instructions;
  const beatsPerSecond = tempo / 60;
  const totalBeats = duration * beatsPerSecond;
  
  console.log(`🎸 Generating bass line for ${duration}s track:`, {
    tempo, chordProgression, style, mood
  });
  
  // Enhanced bass notes with sophisticated chord options and inversions
  const bassNotes = {
    'C': ['C2', 'E2', 'G2', 'C3'],
    'Am': ['A2', 'C3', 'E3', 'A3'],
    'F': ['F2', 'A2', 'C3', 'F3'],
    'G': ['G2', 'B2', 'D3', 'G3'],
    'D': ['D2', 'F#2', 'A2', 'D3'],
    'Em': ['E2', 'G2', 'B2', 'E3'],
    'Dm': ['D2', 'F2', 'A2', 'D3'],
    'Bb': ['Bb2', 'D3', 'F3', 'Bb3'],
    'Gm': ['G2', 'Bb2', 'D3', 'G3'],
    // Add sophisticated chords
    'Cmaj7': ['C2', 'E2', 'G2', 'B2', 'C3'],
    'Am7': ['A2', 'C3', 'E3', 'G3', 'A3'],
    'Fmaj7': ['F2', 'A2', 'C3', 'E3', 'F3'],
    'G7': ['G2', 'B2', 'D3', 'F3', 'G3'],
    'Dm7': ['D2', 'F2', 'A2', 'C3', 'D3'],
    'Em7': ['E2', 'G2', 'B2', 'D3', 'E3']
  };
  
  // Add passing tones and chromatic bass notes
  const bassPassingTones = ['C#2', 'D#2', 'F#2', 'G#2', 'A#2'];
  
  // Enhanced normalization for bass patterns
  const normalizedTempo = Math.min(tempo / 200, 1);
  const normalizedStyle = style === 'electronic' ? 0.1 : 
                         style === 'jazz' ? 0.3 : 
                         style === 'rock' ? 0.5 : 
                         style === 'ambient' ? 0.7 : 
                         style === 'pop' ? 0.9 : 
                         style === 'classical' ? 0.2 :
                         style === 'blues' ? 0.4 : 0.5;
  const normalizedMood = mood === 'energetic' ? 0.9 : 
                        mood === 'melancholic' ? 0.2 : 
                        mood === 'uplifting' ? 0.8 : 
                        mood === 'calm' ? 0.3 : 0.5;
  const normalizedComplexity = Math.random() * 0.4 + 0.6;
  
  const bass = [];
  const beatsPerChord = totalBeats / chordProgression.length;
  
  // Create phrase structure for bass
  const phraseStructure = ['intro', 'verse', 'pre-chorus', 'chorus', 'verse', 'pre-chorus', 'chorus', 'bridge', 'chorus', 'outro'];
  const phraseLength = chordProgression.length / phraseStructure.length;
  
  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i];
    const chordNotes = bassNotes[chord] || bassNotes['C'];
    const currentPhrase = phraseStructure[Math.floor(i / phraseLength)] || 'verse';
    
    // Use bass neural network for harmonic movement
    const normalizedPhrase = currentPhrase === 'intro' ? 0.1 : 
                            currentPhrase === 'verse' ? 0.2 : 
                            currentPhrase === 'pre-chorus' ? 0.3 : 
                            currentPhrase === 'chorus' ? 0.4 : 
                            currentPhrase === 'bridge' ? 0.5 : 0.6;
    
    const prediction = bassNet.run({
      tempo: normalizedTempo,
      style: normalizedStyle,
      mood: normalizedMood,
      complexity: normalizedComplexity,
      phrase: normalizedPhrase
    });
    
    // Create more interesting bass patterns
    const patternLength = Math.floor(beatsPerChord * 2); // More subdivisions
    
    for (let subdivision = 0; subdivision < patternLength; subdivision++) {
      // Use neural network predictions to determine note selection
      let noteIndex = 0;
      if (prediction.root > 0.5) {
        noteIndex = 0; // Root note
      } else if (prediction.fifth > 0.4) {
        noteIndex = Math.min(2, chordNotes.length - 1); // Fifth
      } else if (prediction.octave > 0.3) {
        noteIndex = Math.min(3, chordNotes.length - 1); // Octave
      } else if (prediction.passing > 0.3) {
        // Use passing tone
        const passingTone = bassPassingTones[Math.floor(Math.random() * bassPassingTones.length)];
        noteIndex = -1; // Special case for passing tones
      } else if (prediction.chromatic > 0.2) {
        // Use chromatic movement
        noteIndex = Math.floor(Math.random() * chordNotes.length);
      } else {
        noteIndex = Math.floor(Math.random() * chordNotes.length);
      }
      
      let note = noteIndex === -1 ? bassPassingTones[Math.floor(Math.random() * bassPassingTones.length)] : chordNotes[noteIndex];
      let duration = '4n';
      let velocity = 0.8;
      
      // Add rhythmic variations based on style
      if (style === 'electronic' || style === 'rock') {
        // More aggressive, syncopated patterns
        if (subdivision % 2 === 0) {
          duration = '8n';
          velocity = 0.9;
        } else if (subdivision % 3 === 0) {
          duration = '16n';
          velocity = 0.6;
          // Add passing tones occasionally
          if (Math.random() < 0.3) {
            note = bassPassingTones[Math.floor(Math.random() * bassPassingTones.length)];
          }
        }
      } else if (style === 'jazz') {
        // Walking bass patterns
        if (subdivision % 2 === 0) {
          duration = '8n';
          velocity = 0.7;
        } else {
          duration = '8n';
          velocity = 0.6;
          // More chromatic movement
          if (Math.random() < 0.4) {
            note = bassPassingTones[Math.floor(Math.random() * bassPassingTones.length)];
          }
        }
      } else if (style === 'ambient') {
        // Longer, sustained notes
        duration = '2n';
        velocity = 0.6;
      } else {
        // Pop/classical - steady quarter notes with occasional variations
        duration = '4n';
        velocity = 0.8;
        if (subdivision % 4 === 0 && Math.random() < 0.2) {
          duration = '8n';
          velocity = 0.7;
        }
      }
      
      // Apply mood-based velocity adjustments
      if (mood === 'energetic') {
        velocity *= 1.1;
      } else if (mood === 'melancholic' || mood === 'calm') {
        velocity *= 0.8;
      }
      
      // Add advanced bass characteristics optimized for Dittytoy
      bass.push({
        note: note,
        duration: duration,
        time: (i * beatsPerChord + subdivision * 0.5) / beatsPerSecond,
        velocity: Math.min(1, Math.max(0.3, velocity)),
        // Dittytoy-specific bass characteristics
        attack: style === 'jazz' ? 0.01 : style === 'rock' ? 0.001 : 0.005,
        release: style === 'ambient' ? 1.0 : style === 'jazz' ? 0.3 : 0.5,
        // Advanced harmonic features
        harmonicFunction: currentPhrase === 'chorus' ? 'tonic' : 
                         currentPhrase === 'verse' ? 'subdominant' : 'dominant',
        // Voice leading
        voiceLeading: prediction.root > 0.5 ? 'root' : 
                     prediction.fifth > 0.4 ? 'fifth' : 'chromatic',
        // Dittytoy-compatible articulation
        articulation: style === 'jazz' ? 'walking' : 
                     style === 'electronic' ? 'staccato' : 'normal',
        // Micro-timing for human feel
        microTiming: (Math.random() - 0.5) * 0.01,
        // Bass-specific effects
        subBass: style === 'electronic' ? 0.8 : 0.3,
        // Harmonic tension
        tension: Math.abs(prediction.root - 0.5) * 2
      });
    }
  }
  
  console.log(`🎸 Generated ${bass.length} bass notes`);
  return bass;
};

// Advanced optimization function for Dittytoy compatibility
export const optimizeForDittytoy = (patterns) => {
  const optimized = {
    melody: patterns.melody?.map(note => ({
      ...note,
      // Ensure Dittytoy-compatible note ranges
      note: note.note.replace(/\d+/, (match) => {
        const octave = parseInt(match);
        return Math.max(2, Math.min(6, octave)); // Dittytoy-friendly range
      }),
      // Optimize timing for Dittytoy
      time: Math.round(note.time * 1000) / 1000, // Round to millisecond precision
      // Ensure valid velocity range
      velocity: Math.max(0.1, Math.min(1.0, note.velocity)),
      // Dittytoy-specific optimizations
      attack: Math.max(0.001, Math.min(0.1, note.attack || 0.01)),
      release: Math.max(0.1, Math.min(2.0, note.release || 0.5))
    })),
    
    drums: patterns.drums?.map(drum => ({
      ...drum,
      // Optimize timing for Dittytoy
      time: Math.round(drum.time * 1000) / 1000,
      // Ensure valid velocity range
      velocity: Math.max(0.1, Math.min(1.0, drum.velocity)),
      // Dittytoy-compatible instrument mapping
      instrument: drum.instrument === 'openhat' ? 'ohat' : 
                 drum.instrument === 'clap' ? 'clhat' : drum.instrument
    })),
    
    bass: patterns.bass?.map(note => ({
      ...note,
      // Ensure Dittytoy-compatible bass note ranges
      note: note.note.replace(/\d+/, (match) => {
        const octave = parseInt(match);
        return Math.max(1, Math.min(4, octave)); // Bass range for Dittytoy
      }),
      // Optimize timing for Dittytoy
      time: Math.round(note.time * 1000) / 1000,
      // Ensure valid velocity range
      velocity: Math.max(0.1, Math.min(1.0, note.velocity)),
      // Dittytoy-specific bass optimizations
      attack: Math.max(0.001, Math.min(0.05, note.attack || 0.005)),
      release: Math.max(0.1, Math.min(1.5, note.release || 0.5))
    }))
  };
  
  console.log('🎛️ Optimized patterns for Dittytoy compatibility');
  return optimized;
};

// Enhanced pattern generation with advanced musical features
export const generateAdvancedPatterns = (instructions, duration = 60) => {
  console.log('🎼 Generating advanced musical patterns with enhanced AI...');
  
  const patterns = {
    melody: generateMelody(instructions, duration),
    drums: generateDrumPattern(instructions, duration),
    bass: generateBassLine(instructions, duration)
  };
  
  // Apply advanced optimizations
  const optimizedPatterns = optimizeForDittytoy(patterns);
  
  // Add metadata for advanced features
  optimizedPatterns.metadata = {
    style: instructions.style,
    mood: instructions.mood,
    tempo: instructions.tempo,
    key: instructions.key,
    duration: duration,
    complexity: Math.random() * 0.4 + 0.6,
    // Advanced musical features
    harmonicComplexity: instructions.style === 'jazz' ? 0.9 : 
                       instructions.style === 'classical' ? 0.8 : 0.6,
    rhythmicComplexity: instructions.style === 'jazz' ? 0.8 : 
                       instructions.style === 'electronic' ? 0.7 : 0.5,
    melodicComplexity: instructions.style === 'classical' ? 0.9 : 
                      instructions.style === 'jazz' ? 0.8 : 0.6
  };
  
  console.log('🎼 Generated advanced patterns with enhanced musical features');
  return optimizedPatterns;
};
