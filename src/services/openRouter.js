const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper function to format moderation error messages
// OpenRouter 403 errors include ModerationErrorMetadata with:
// - reasons: string[] - Why the input was flagged
// - flagged_input: string - The text segment that was flagged (max 100 chars)
// - provider_name: string - The provider that requested moderation
// - model_slug: string - The model that was being used
const formatModerationError = (errorData) => {
  const metadata = errorData.error?.metadata;
  if (!metadata) {
    return 'Content flagged by moderation system';
  }
  
  const reasons = metadata.reasons || [];
  const flaggedInput = metadata.flagged_input || '';
  const providerName = metadata.provider_name || 'Unknown provider';
  
  let message = `Content moderation violation`;
  if (reasons.length > 0) {
    message += `: ${reasons.join(', ')}`;
  }
  if (flaggedInput) {
    message += ` (flagged: "${flaggedInput}")`;
  }
  if (providerName) {
    message += ` [${providerName}]`;
  }
  
  return message;
};

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
- style: string - Be specific: "electronic", "ambient", "jazz", "rock", "classical", "pop", "blues", "funk", "reggae", "hip-hop", "folk", "country", "metal", "punk", "disco", "house", "techno", "tech-house", "minimal", "deep-techno", "industrial", "detroit-techno", "berlin-techno", "acid-techno", "progressive-techno", "dubstep", "trap", "lo-fi", "chill", "experimental"
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
- "dark techno track" → tempo: 138, style: "techno", mood: "dark", chordProgression: ["Am", "F", "C", "G"], drumPattern: "four-on-floor"
- "minimal techno" → tempo: 125, style: "minimal", mood: "hypnotic", chordProgression: ["Dm", "Bb", "F", "C"], drumPattern: "minimal"
- "industrial techno" → tempo: 140, style: "industrial", mood: "aggressive", chordProgression: ["Em", "C", "G", "D"], drumPattern: "complex"

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
      // Handle 403 errors specifically (moderation/content policy violations)
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          console.error('🚫 OpenRouter 403 Error - Content Moderation:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            // Log moderation metadata if available
            moderationMetadata: errorData.error?.metadata || null,
            reasons: errorData.error?.metadata?.reasons || [],
            flaggedInput: errorData.error?.metadata?.flagged_input || null,
            providerName: errorData.error?.metadata?.provider_name || null,
            modelSlug: errorData.error?.metadata?.model_slug || null
          });
          
          // Log specific moderation reasons
          if (errorData.error?.metadata?.reasons) {
            console.error('🚫 Moderation Reasons:', errorData.error.metadata.reasons);
          }
          
          // Log flagged input (truncated for safety)
          if (errorData.error?.metadata?.flagged_input) {
            console.error('🚫 Flagged Input:', errorData.error.metadata.flagged_input);
          }
          
          throw new Error(formatModerationError(errorData));
        } catch (parseError) {
          console.error('🚫 OpenRouter 403 Error (failed to parse error response):', {
            status: response.status,
            statusText: response.statusText,
            parseError: parseError.message
          });
          throw new Error(`OpenRouter 403 error: Content moderation violation`);
        }
      }
      
      // Handle other HTTP errors
      console.error('🚫 OpenRouter API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
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

// Note: generateAIPatterns function removed - now using enhanced brain.js service
// The enhanced brain.js neural networks provide superior pattern generation
// with sophisticated musical features, phrase structure, and dittytoy optimization
