// Brain.js service for generating musical patterns
import * as brain from 'brain.js';

// Initialize neural networks for different musical elements
const melodyNet = new brain.NeuralNetwork({
  hiddenLayers: [8, 6],
  learningRate: 0.3
});

const drumNet = new brain.NeuralNetwork({
  hiddenLayers: [6, 4],
  learningRate: 0.3
});

// Enhanced training data for more diverse and complex music generation
const melodyTrainingData = [
  // Electronic styles - more complex patterns
  { input: { tempo: 0.8, style: 0.1, key: 0.1, mood: 0.9, complexity: 0.8 }, output: { note1: 0.2, note2: 0.4, note3: 0.6, note4: 0.8, note5: 0.3, note6: 0.7, note7: 0.1, note8: 0.9, note9: 0.5, note10: 0.2, note11: 0.8, note12: 0.4 } },
  { input: { tempo: 0.9, style: 0.1, key: 0.3, mood: 0.7, complexity: 0.9 }, output: { note1: 0.1, note2: 0.3, note3: 0.7, note4: 0.9, note5: 0.2, note6: 0.8, note7: 0.4, note8: 0.6, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.7 } },
  { input: { tempo: 0.7, style: 0.1, key: 0.5, mood: 0.5, complexity: 0.6 }, output: { note1: 0.4, note2: 0.6, note3: 0.2, note4: 0.8, note5: 0.5, note6: 0.1, note7: 0.9, note8: 0.3, note9: 0.7, note10: 0.4, note11: 0.2, note12: 0.8 } },
  
  // Jazz styles - more sophisticated
  { input: { tempo: 0.6, style: 0.3, key: 0.7, mood: 0.8, complexity: 0.9 }, output: { note1: 0.3, note2: 0.7, note3: 0.5, note4: 0.1, note5: 0.8, note6: 0.2, note7: 0.6, note8: 0.4, note9: 0.9, note10: 0.1, note11: 0.5, note12: 0.7 } },
  { input: { tempo: 0.5, style: 0.3, key: 0.9, mood: 0.6, complexity: 0.8 }, output: { note1: 0.6, note2: 0.2, note3: 0.8, note4: 0.4, note5: 0.1, note6: 0.9, note7: 0.3, note8: 0.7, note9: 0.4, note10: 0.8, note11: 0.2, note12: 0.6 } },
  
  // Rock styles - more aggressive
  { input: { tempo: 0.9, style: 0.5, key: 0.2, mood: 0.9, complexity: 0.7 }, output: { note1: 0.8, note2: 0.2, note3: 0.6, note4: 0.4, note5: 0.9, note6: 0.1, note7: 0.7, note8: 0.3, note9: 0.5, note10: 0.9, note11: 0.1, note12: 0.6 } },
  { input: { tempo: 0.8, style: 0.5, key: 0.4, mood: 0.7, complexity: 0.8 }, output: { note1: 0.7, note2: 0.3, note3: 0.9, note4: 0.1, note5: 0.4, note6: 0.8, note7: 0.2, note8: 0.6, note9: 0.8, note10: 0.2, note11: 0.5, note12: 0.9 } },
  
  // Ambient styles - more ethereal
  { input: { tempo: 0.3, style: 0.7, key: 0.6, mood: 0.3, complexity: 0.5 }, output: { note1: 0.5, note2: 0.1, note3: 0.3, note4: 0.7, note5: 0.2, note6: 0.8, note7: 0.4, note8: 0.6, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.5 } },
  { input: { tempo: 0.4, style: 0.7, key: 0.8, mood: 0.4, complexity: 0.6 }, output: { note1: 0.2, note2: 0.6, note3: 0.4, note4: 0.8, note5: 0.1, note6: 0.5, note7: 0.9, note8: 0.3, note9: 0.7, note10: 0.2, note11: 0.8, note12: 0.4 } },
  
  // Pop styles - more catchy
  { input: { tempo: 0.7, style: 0.9, key: 0.1, mood: 0.8, complexity: 0.6 }, output: { note1: 0.3, note2: 0.7, note3: 0.5, note4: 0.9, note5: 0.2, note6: 0.6, note7: 0.8, note8: 0.4, note9: 0.1, note10: 0.9, note11: 0.3, note12: 0.7 } },
  { input: { tempo: 0.8, style: 0.9, key: 0.3, mood: 0.9, complexity: 0.7 }, output: { note1: 0.6, note2: 0.2, note3: 0.8, note4: 0.4, note5: 0.7, note6: 0.1, note7: 0.5, note8: 0.9, note9: 0.2, note10: 0.8, note11: 0.4, note12: 0.6 } },
  
  // Classical styles - more structured
  { input: { tempo: 0.6, style: 0.2, key: 0.5, mood: 0.7, complexity: 0.9 }, output: { note1: 0.4, note2: 0.8, note3: 0.2, note4: 0.6, note5: 0.9, note6: 0.1, note7: 0.5, note8: 0.7, note9: 0.3, note10: 0.9, note11: 0.1, note12: 0.5 } },
  { input: { tempo: 0.5, style: 0.2, key: 0.7, mood: 0.5, complexity: 0.8 }, output: { note1: 0.7, note2: 0.3, note3: 0.9, note4: 0.1, note5: 0.6, note6: 0.8, note7: 0.2, note8: 0.4, note9: 0.9, note10: 0.1, note11: 0.7, note12: 0.3 } },
  
  // Blues styles - more soulful
  { input: { tempo: 0.6, style: 0.4, key: 0.3, mood: 0.6, complexity: 0.7 }, output: { note1: 0.5, note2: 0.1, note3: 0.7, note4: 0.3, note5: 0.9, note6: 0.2, note7: 0.6, note8: 0.4, note9: 0.8, note10: 0.1, note11: 0.5, note12: 0.7 } },
  { input: { tempo: 0.7, style: 0.4, key: 0.5, mood: 0.8, complexity: 0.8 }, output: { note1: 0.2, note2: 0.8, note3: 0.4, note4: 0.6, note5: 0.1, note6: 0.9, note7: 0.3, note8: 0.7, note9: 0.5, note10: 0.2, note11: 0.8, note12: 0.4 } }
];

// Enhanced drum patterns
const drumTrainingData = [
  { input: { tempo: 0.5, style: 0.2, mood: 0.3 }, output: { kick: 0.8, snare: 0.6, hihat: 0.4, crash: 0.2 } },
  { input: { tempo: 0.7, style: 0.5, mood: 0.7 }, output: { kick: 0.6, snare: 0.8, hihat: 0.7, crash: 0.3 } },
  { input: { tempo: 0.3, style: 0.8, mood: 0.2 }, output: { kick: 0.4, snare: 0.3, hihat: 0.9, crash: 0.1 } },
  { input: { tempo: 0.9, style: 0.1, mood: 0.9 }, output: { kick: 0.9, snare: 0.5, hihat: 0.3, crash: 0.6 } },
  { input: { tempo: 0.6, style: 0.3, mood: 0.6 }, output: { kick: 0.7, snare: 0.4, hihat: 0.8, crash: 0.2 } },
  { input: { tempo: 0.8, style: 0.7, mood: 0.8 }, output: { kick: 0.5, snare: 0.9, hihat: 0.6, crash: 0.4 } }
];

// Train the networks
melodyNet.train(melodyTrainingData);
drumNet.train(drumTrainingData);

export const generateMelody = (instructions, duration = 60) => {
  const { tempo, key, melodyStyle, chordProgression, mood, style } = instructions;
  const beatsPerSecond = tempo / 60;
  const totalBeats = duration * beatsPerSecond;
  
  // Enhanced normalization for more variety
  const normalizedTempo = Math.min(tempo / 200, 1);
  const normalizedStyle = style === 'electronic' ? 0.1 : 
                         style === 'jazz' ? 0.3 : 
                         style === 'rock' ? 0.5 : 
                         style === 'ambient' ? 0.7 : 
                         style === 'pop' ? 0.9 : 
                         style === 'classical' ? 0.2 :
                         style === 'blues' ? 0.4 : 0.5;
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
  
  // Enhanced chord progressions with more variety and realistic voicings
  const chordNotes = {
    'C': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5'],
    'Am': ['A2', 'C3', 'E3', 'A3', 'C4', 'E4', 'A4', 'C5', 'E5'],
    'F': ['F2', 'A2', 'C3', 'F3', 'A3', 'C4', 'F4', 'A4', 'C5'],
    'G': ['G2', 'B2', 'D3', 'G3', 'B3', 'D4', 'G4', 'B4', 'D5'],
    'D': ['D3', 'F#3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5'],
    'Em': ['E2', 'G2', 'B2', 'E3', 'G3', 'B3', 'E4', 'G4', 'B4'],
    'Dm': ['D3', 'F3', 'A3', 'D4', 'F4', 'A4', 'D5', 'F5', 'A5'],
    'Bb': ['Bb2', 'D3', 'F3', 'Bb3', 'D4', 'F4', 'Bb4', 'D5', 'F5'],
    'Gm': ['G2', 'Bb2', 'D3', 'G3', 'Bb3', 'D4', 'G4', 'Bb4', 'D5']
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
    
    // Use neural network with mood, complexity and randomness
    const prediction = melodyNet.run({
      tempo: normalizedTempo,
      style: normalizedStyle,
      key: normalizedKey,
      mood: normalizedMood,
      complexity: normalizedComplexity
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
      
      // Add some octave variation based on phrase
      let octaveVariation = 0;
      if (currentPhrase === 'chorus') {
        octaveVariation = Math.floor((prediction[`note${(patternIndex % 8) + 1}`] - 0.5) * 3);
      } else {
        octaveVariation = Math.floor((prediction[`note${(patternIndex % 8) + 1}`] - 0.5) * 2);
      }
      
      const finalNote = note.replace(/\d+/, (match) => {
        const octave = parseInt(match) + octaveVariation;
        return Math.max(2, Math.min(6, octave)); // Keep within reasonable range
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
      
      // Add more realistic note characteristics
      const noteData = {
        note: finalNote,
        duration: rhythmPattern[patternIndex],
        time: (i * beatsPerChord + beat) / beatsPerSecond,
        velocity: velocity,
        // Add some unique characteristics
        pitchBend: (randomSeed + i + beat) % 1 > 0.9 ? (Math.random() - 0.5) * 0.3 : 0,
        attack: 0.02 + (prediction[`note${(patternIndex % 8) + 1}`] * 0.08),
        release: 0.3 + (prediction[`note${(patternIndex % 8) + 1}`] * 0.7),
        // Add expression and dynamics
        expression: currentIntensity,
        vibrato: currentPhrase === 'chorus' ? 0.1 : 0.05,
        // Add legato for smoother melodies
        legato: beat % 2 === 0 && patternIndex % 2 === 0 ? 0.8 : 0.3
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
  
  // Normalize inputs for neural network
  const normalizedTempo = Math.min(tempo / 200, 1);
  const normalizedStyle = drumPattern === 'four-on-floor' ? 0.2 : 
                         drumPattern === 'breakbeat' ? 0.5 : 
                         drumPattern === 'minimal' ? 0.8 : 0.5;
  const normalizedMood = mood === 'energetic' ? 0.9 : 
                        mood === 'melancholic' ? 0.2 : 
                        mood === 'uplifting' ? 0.8 : 
                        mood === 'calm' ? 0.3 : 0.5;
  
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
    
    // Use neural network to determine drum hits
    const prediction = drumNet.run({
      tempo: normalizedTempo,
      style: normalizedStyle,
      mood: normalizedMood
    });
    
    // Apply neural network predictions with style-specific logic
    let kickThreshold, snareThreshold, hihatThreshold;
    
    if (style === 'electronic') {
      kickThreshold = prediction.kick * 0.8;
      snareThreshold = prediction.snare * 0.7;
      hihatThreshold = prediction.hihat * 0.6;
    } else if (style === 'rock') {
      kickThreshold = prediction.kick * 0.9;
      snareThreshold = prediction.snare * 0.8;
      hihatThreshold = prediction.hihat * 0.5;
    } else if (style === 'jazz') {
      kickThreshold = prediction.kick * 0.4;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.8;
    } else if (style === 'ambient') {
      kickThreshold = prediction.kick * 0.2;
      snareThreshold = prediction.snare * 0.3;
      hihatThreshold = prediction.hihat * 0.7;
    } else {
      kickThreshold = prediction.kick * 0.7;
      snareThreshold = prediction.snare * 0.6;
      hihatThreshold = prediction.hihat * 0.4;
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
    
    // Add crash cymbal with phrase awareness
    if (beatInMeasure === 0 && phraseType === 'chorus' && Math.random() < 0.4) {
      drums.push({
        instrument: 'crash',
        time: beat / beatsPerSecond,
        velocity: 0.8 + Math.random() * 0.2
      });
    } else if (beatInMeasure === 0 && Math.random() < 0.1) {
      drums.push({
        instrument: 'crash',
        time: beat / beatsPerSecond,
        velocity: 0.6 + Math.random() * 0.3
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
  
  // Enhanced bass notes with more chord options
  const bassNotes = {
    'C': 'C2',
    'Am': 'A2',
    'F': 'F2',
    'G': 'G2',
    'D': 'D2',
    'Em': 'E2',
    'Dm': 'D2',
    'Bb': 'Bb2',
    'Gm': 'G2'
  };
  
  // Add passing tones and chromatic bass notes
  const bassPassingTones = ['C#2', 'D#2', 'F#2', 'G#2', 'A#2'];
  
  const bass = [];
  const beatsPerChord = totalBeats / chordProgression.length;
  
  for (let i = 0; i < chordProgression.length; i++) {
    const chord = chordProgression[i];
    const rootNote = bassNotes[chord] || bassNotes['C'];
    
    // Create more interesting bass patterns
    const patternLength = Math.floor(beatsPerChord * 2); // More subdivisions
    
    for (let subdivision = 0; subdivision < patternLength; subdivision++) {
      let note = rootNote;
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
      
      bass.push({
        note: note,
        duration: duration,
        time: (i * beatsPerChord + subdivision * 0.5) / beatsPerSecond,
        velocity: Math.min(1, Math.max(0.3, velocity))
      });
    }
  }
  
  console.log(`🎸 Generated ${bass.length} bass notes`);
  return bass;
};
