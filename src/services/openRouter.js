const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
            content: `You are a music production assistant. Convert user descriptions into structured music instructions for AI music generation. 
            Return a JSON object with these fields:
            - tempo: number (60-180 BPM, default 120)
            - key: string (e.g., "C major", "A minor", "G major", "F major", "D major", "A major", "E minor")
            - style: string (e.g., "electronic", "jazz", "rock", "ambient", "classical", "pop", "blues")
            - instruments: array of strings (e.g., ["synth", "drums", "bass", "piano"])
            - mood: string (e.g., "energetic", "melancholic", "uplifting", "calm", "aggressive", "peaceful", "happy", "sad", "dramatic", "relaxed")
            - chordProgression: array of chord names (e.g., ["C", "Am", "F", "G"])
            - melodyStyle: string (e.g., "simple", "complex", "arpeggiated", "melodic", "rhythmic")
            - drumPattern: string (e.g., "four-on-floor", "breakbeat", "minimal", "complex")
            - duration: number (30-300 seconds, default 120)
            
            Focus on creating instructions that will work well with AI music generation models. Keep the response concise and suitable for 5-minute maximum tracks.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse JSON from the response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, return a default structure
      console.warn('Failed to parse JSON from OpenRouter response:', parseError);
      return {
        tempo: 120,
        key: "C major",
        style: "electronic",
        instruments: ["synth", "drums", "bass"],
        mood: "energetic",
        chordProgression: ["C", "Am", "F", "G"],
        melodyStyle: "simple",
        drumPattern: "four-on-floor",
        duration: 120
      };
    }
  } catch (error) {
    console.error('Error generating music instructions:', error);
    throw error;
  }
};
