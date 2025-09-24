const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to extract JSON from various response formats
const extractJSON = (content) => {
  // First, try to find JSON in markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // Try to find JSON object boundaries
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0].trim();
  }
  
  // If no special formatting, return the content as-is
  return content.trim();
};

// Helper function to validate and fix incomplete JSON
const validateAndFixJSON = (jsonString) => {
  try {
    // First, try to parse as-is
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parsing failed, attempting to fix:', error.message);
    
    // Try to fix common issues
    let fixed = jsonString;
    
    // Count brackets and braces to see if we need to close them
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    // Add missing closing brackets
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed += ']';
    }
    
    // Add missing closing braces
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixed += '}';
    }
    
    try {
      return JSON.parse(fixed);
    } catch (fixError) {
      console.warn('Failed to fix JSON:', fixError.message);
      throw fixError;
    }
  }
};

export const generateMusicInstructions = async (prompt) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chordara Music App'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are an expert music producer and composer with deep knowledge of music theory, production techniques, and genre characteristics. Your task is to analyze user prompts and create highly specific, unique musical instructions that will generate distinctive and fitting music.

IMPORTANT: Each response must be unique and tailored to the specific prompt. Avoid generic responses. Be creative and specific.

Return a JSON object with these fields:

- tempo: number (60-200 BPM) - Choose based on mood and style
- key: string - Choose from: "C major", "G major", "D major", "A major", "E major", "F major", "Bb major", "A minor", "E minor", "B minor", "F# minor", "C# minor", "F minor", "C minor", "G minor", "D minor"
- style: string - Be specific: "electronic", "ambient", "jazz", "rock", "classical", "pop", "blues", "funk", "reggae", "hip-hop", "folk", "country", "metal", "punk", "disco", "house", "techno", "dubstep", "trap", "lo-fi", "chill", "experimental"
- mood: string - Be descriptive: "energetic", "melancholic", "uplifting", "calm", "aggressive", "peaceful", "happy", "sad", "dramatic", "relaxed", "nostalgic", "mysterious", "romantic", "triumphant", "contemplative", "playful", "intense", "dreamy", "dark", "bright"
- instruments: array of strings - REQUIRED field with instruments like ["synth", "drums", "bass", "piano", "strings", "guitar"]
- chordProgression: array of 4-8 chord names - Use sophisticated progressions like ["Cmaj7", "Am7", "Fmaj7", "G7"] or ["Dm", "Bb", "F", "C"] or ["Em", "C", "G", "D"]
- melodyStyle: string - Be specific: "simple", "complex", "arpeggiated", "melodic", "rhythmic", "syncopated", "legato", "staccato", "ornamented", "minimal", "virtuosic", "call-and-response"
- drumPattern: string - Be specific: "four-on-floor", "breakbeat", "minimal", "complex", "swing", "shuffle", "latin", "afro-cuban", "trap", "drum-and-bass", "jazz", "rock", "funk", "reggae"
- bassStyle: string - "walking", "syncopated", "driving", "melodic", "minimal", "funk", "slap", "arpeggiated", "pedal-tone"
- harmonyComplexity: string - "simple", "moderate", "complex", "jazz", "classical", "modal"
- texture: string - "sparse", "dense", "layered", "minimal", "orchestral", "electronic", "acoustic", "hybrid"
- energy: string - "low", "medium", "high", "building", "dynamic", "steady"
- duration: number (60-300 seconds)

ANALYSIS GUIDELINES:
1. Extract emotional content, genre hints, tempo suggestions, and mood indicators
2. Consider the user's intent (background music, dance track, ambient, etc.)
3. Create unique combinations that avoid clichés
4. Use sophisticated chord progressions and musical elements
5. Ensure all elements work together cohesively

EXAMPLES:
- "upbeat electronic dance music" → tempo: 128, style: "house", mood: "energetic", chordProgression: ["Fmaj7", "Dm7", "Bb", "C"]
- "sad piano ballad" → tempo: 70, style: "classical", mood: "melancholic", chordProgression: ["Am", "F", "C", "G"]
- "mysterious ambient soundscape" → tempo: 60, style: "ambient", mood: "mysterious", chordProgression: ["Dm", "Bb", "F", "C"]

Be creative and make each song unique!

IMPORTANT: Return ONLY valid JSON without any markdown formatting, explanations, or additional text.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('🎵 OpenRouter raw response:', content);
    
    // Extract JSON from the response
    const jsonContent = extractJSON(content);
    console.log('🎵 Extracted JSON:', jsonContent);
    
    // Try to parse JSON from the response
    try {
      const parsed = validateAndFixJSON(jsonContent);
      console.log('🎵 Parsed instructions:', parsed);
      return parsed;
    } catch (parseError) {
      // If JSON parsing fails, return a default structure
      console.warn('Failed to parse JSON from OpenRouter response:', parseError);
      console.warn('Raw content that failed to parse:', content);
      return {
        tempo: 120,
        key: "C major",
        style: "electronic",
        instruments: ["synth", "drums", "bass"],
        mood: "energetic",
        chordProgression: ["C", "Am", "F", "G"],
        melodyStyle: "simple",
        drumPattern: "four-on-floor",
        bassStyle: "driving",
        harmonyComplexity: "moderate",
        texture: "layered",
        energy: "medium",
        duration: 120
      };
    }
  } catch (error) {
    console.error('Error generating music instructions:', error);
    throw error;
  }
};

// Generate AI-powered musical patterns based on instructions
export const generateAIPatterns = async (instructions) => {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Chordara Music App'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are a music theory expert and composer. Generate specific musical patterns based on the given instructions.

Return a JSON object with these fields:

- melodyPattern: array of note objects with {note: "C4", duration: "4n", velocity: 0.8, time: 0}
- bassPattern: array of note objects with {note: "C2", duration: "2n", velocity: 0.9, time: 0}
- drumPattern: array of drum objects with {instrument: "kick", time: 0, velocity: 0.8}

NOTES:
- Use standard note names: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Octaves: 1-7 (e.g., C4 is middle C)
- Durations: "1n" (whole), "2n" (half), "4n" (quarter), "8n" (eighth), "16n" (sixteenth)
- Velocities: 0.1-1.0 (0.1 = very soft, 1.0 = very loud)
- Time: position in beats (0, 0.5, 1, 1.5, etc.)
- Drum instruments: "kick", "snare", "hihat", "openhat", "crash", "ride"

Create patterns that:
1. Match the specified style, mood, and tempo
2. Use the provided chord progression
3. Are musically coherent and interesting
4. Have appropriate complexity for the style
5. Include variations and musical interest

Generate EXACTLY 8 notes for melody, 4 notes for bass, and 8 drum hits to ensure complete JSON.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON without any markdown formatting, explanations, or additional text
- Ensure all arrays are properly closed with ]
- Ensure all objects are properly closed with }
- Do not truncate the response - keep it concise but complete
- Test that your JSON is valid before returning it`
          },
          {
            role: 'user',
            content: `Generate musical patterns for:
- Style: ${instructions.style}
- Mood: ${instructions.mood}
- Tempo: ${instructions.tempo} BPM
- Key: ${instructions.key}
- Chord Progression: ${JSON.stringify(instructions.chordProgression)}
- Melody Style: ${instructions.melodyStyle}
- Bass Style: ${instructions.bassStyle}
- Drum Pattern: ${instructions.drumPattern}
- Energy: ${instructions.energy}
- Duration: ${instructions.duration} seconds`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('🎵 AI Patterns raw response:', content);
    
    // Extract JSON from the response
    const jsonContent = extractJSON(content);
    console.log('🎵 Extracted JSON:', jsonContent);
    
    try {
      const parsed = validateAndFixJSON(jsonContent);
      console.log('🎵 Parsed AI patterns:', parsed);
      return parsed;
    } catch (parseError) {
      console.warn('Failed to parse AI patterns JSON:', parseError);
      console.warn('Raw patterns content that failed to parse:', content);
      // Return fallback patterns
      return generateFallbackPatterns(instructions);
    }
  } catch (error) {
    console.error('Error generating AI patterns:', error);
    return generateFallbackPatterns(instructions);
  }
};

// Generate fallback patterns when AI fails
const generateFallbackPatterns = (instructions) => {
  const { tempo, key, style, mood, chordProgression } = instructions;
  
  // Concise melody pattern (8 notes)
  const melodyPattern = [
    { note: "C4", duration: "4n", velocity: 0.8, time: 0 },
    { note: "E4", duration: "4n", velocity: 0.7, time: 1 },
    { note: "G4", duration: "4n", velocity: 0.8, time: 2 },
    { note: "C5", duration: "4n", velocity: 0.9, time: 3 },
    { note: "G4", duration: "4n", velocity: 0.7, time: 4 },
    { note: "E4", duration: "4n", velocity: 0.8, time: 5 },
    { note: "C4", duration: "4n", velocity: 0.9, time: 6 },
    { note: "G4", duration: "4n", velocity: 0.8, time: 7 }
  ];
  
  // Concise bass pattern (4 notes)
  const bassPattern = [
    { note: "C2", duration: "2n", velocity: 0.9, time: 0 },
    { note: "G2", duration: "2n", velocity: 0.8, time: 2 },
    { note: "C2", duration: "2n", velocity: 0.9, time: 4 },
    { note: "G2", duration: "2n", velocity: 0.8, time: 6 }
  ];
  
  // Concise drum pattern (8 hits)
  const drumPattern = [
    { instrument: "kick", time: 0, velocity: 0.9 },
    { instrument: "hihat", time: 0.5, velocity: 0.6 },
    { instrument: "snare", time: 1, velocity: 0.8 },
    { instrument: "hihat", time: 1.5, velocity: 0.6 },
    { instrument: "kick", time: 2, velocity: 0.9 },
    { instrument: "hihat", time: 2.5, velocity: 0.6 },
    { instrument: "snare", time: 3, velocity: 0.8 },
    { instrument: "hihat", time: 3.5, velocity: 0.6 }
  ];
  
  return {
    melodyPattern,
    bassPattern,
    drumPattern
  };
};
