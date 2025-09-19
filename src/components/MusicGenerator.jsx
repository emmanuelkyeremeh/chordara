import React, { useState, useEffect, useRef } from "react";
import { generateMusicInstructions } from "../services/openRouter";
import {
  generateMelody,
  generateDrumPattern,
  generateBassLine,
} from "../services/brainService";
import toneService from "../services/toneService";
import * as Tone from "tone";

const MusicGenerator = ({ prompt, onGenerated }) => {
  const [generatedPatterns, setGeneratedPatterns] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const progressIntervalRef = useRef(null);
  const sequencesRef = useRef([]);

  // Initialize Tone.js service
  useEffect(() => {
    toneService.initialize();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      sequencesRef.current.forEach((seq) => seq.dispose());
    };
  }, []);

  // Async function to parse prompt via OpenRouter
  const parsePrompt = async (userPrompt) => {
    try {
      // Call OpenRouter API to get structured music data
      const instructions = await generateMusicInstructions(userPrompt);

      // Convert OpenRouter response to music generation format
      const parsed = {
        tempo: instructions.tempo || 120,
        duration: 180, // Default 3 minutes
        chordProgression: instructions.chordProgression || [
          "C",
          "G",
          "Am",
          "F",
        ],
        key: instructions.key || "C",
        style: instructions.style || "electronic",
        mood: instructions.mood || "energetic",
        melodyStyle: instructions.melodyStyle || "ai-generated",
        drumPattern: instructions.drumPattern || "four-on-floor",
      };

      console.log("🎵 Parsed music instructions:", parsed);

      // Adjust duration based on prompt keywords (1-5 minutes)
      if (
        userPrompt.toLowerCase().includes("short") ||
        userPrompt.toLowerCase().includes("1 minute") ||
        userPrompt.toLowerCase().includes("brief")
      ) {
        parsed.duration = 60; // 1 minute
      } else if (
        userPrompt.toLowerCase().includes("2 minute") ||
        userPrompt.toLowerCase().includes("quick")
      ) {
        parsed.duration = 120; // 2 minutes
      } else if (userPrompt.toLowerCase().includes("3 minute")) {
        parsed.duration = 180; // 3 minutes
      } else if (userPrompt.toLowerCase().includes("4 minute")) {
        parsed.duration = 240; // 4 minutes
      } else if (
        userPrompt.toLowerCase().includes("long") ||
        userPrompt.toLowerCase().includes("5 minute") ||
        userPrompt.toLowerCase().includes("extended")
      ) {
        parsed.duration = 300; // 5 minutes
      } else {
        // Random duration between 1-5 minutes if not specified
        const randomDuration = Math.floor(Math.random() * 4) + 1; // 1-5 minutes
        parsed.duration = randomDuration * 60;
      }

      // Clamp duration: min 60s (1 min), max 300s (5 min)
      parsed.duration = Math.max(60, Math.min(300, parsed.duration));

      console.log(
        `🎵 Final duration: ${parsed.duration}s (${Math.floor(
          parsed.duration / 60
        )}:${(parsed.duration % 60).toString().padStart(2, "0")})`
      );

      return parsed;
    } catch (error) {
      console.error("Error parsing prompt:", error);
      // Return fallback data
      return {
        tempo: 120,
        duration: 180, // 3 minutes default
        chordProgression: ["C", "G", "Am", "F"],
        key: "C",
        style: "electronic",
        mood: "energetic",
        melodyStyle: "ai-generated",
        drumPattern: "four-on-floor",
      };
    }
  };

  // Generate music using Tone.js patterns
  const generateMusic = async () => {
    if (!prompt || prompt.trim().length < 3) {
      setError("Please enter a longer prompt (at least 3 characters)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse prompt
      const parsed = await parsePrompt(prompt);
      setParsedData(parsed);
      setTotalDuration(parsed.duration);

      console.log(
        `🎵 Starting music generation for ${parsed.duration}s track...`
      );

      // Generate all musical patterns
      const melody = generateMelody(parsed, parsed.duration);
      const drums = generateDrumPattern(parsed, parsed.duration);
      const bass = generateBassLine(parsed, parsed.duration);

      console.log("🎵 Generated patterns:", {
        melody: melody.length,
        drums: drums.length,
        bass: bass.length,
      });

      const patterns = {
        melody,
        drums,
        bass,
        instructions: {
          tempo: parsed.tempo,
          key: parsed.key,
          style: parsed.style,
          mood: parsed.mood,
          chordProgression: parsed.chordProgression,
          instruments: ["synth", "bass", "drums"],
          melodyStyle: parsed.melodyStyle,
          drumPattern: parsed.drumPattern,
        },
      };

      setGeneratedPatterns(patterns);

      console.log("🎵 Music generation completed successfully!");

      // Notify parent component
      if (onGenerated) {
        console.log("🎵 Notifying parent component of generated music");
        onGenerated({
          patterns: patterns,
          parsedData: parsed,
        });
      }
    } catch (err) {
      setError(`Error generating music: ${err.message}`);
      console.error("Music generation error:", err);
    }
    setIsLoading(false);
  };

  // Play the generated music using Tone.js sequences
  const playMusic = async () => {
    if (!generatedPatterns || !parsedData) {
      console.warn("No patterns to play");
      return;
    }

    try {
      await Tone.start();

      // Stop any existing sequences
      stopMusic();

      // Set tempo
      Tone.Transport.bpm.value = parsedData.tempo;

      // Create synthesizers
      const leadSynth = new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 },
      }).toDestination();

      const bassSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.0 },
      }).toDestination();

      // Create drum sounds
      const kick = new Tone.MembraneSynth().toDestination();
      const snare = new Tone.NoiseSynth().toDestination();
      const hihat = new Tone.NoiseSynth().toDestination();
      const crash = new Tone.NoiseSynth().toDestination();
      const openhat = new Tone.NoiseSynth().toDestination();

      // Create sequences for each part
      const melodySequence = new Tone.Part((time, note) => {
        leadSynth.triggerAttackRelease(
          note.note,
          note.duration,
          time,
          note.velocity
        );
      }, generatedPatterns.melody).start(0);

      const bassSequence = new Tone.Part((time, note) => {
        bassSynth.triggerAttackRelease(
          note.note,
          note.duration,
          time,
          note.velocity
        );
      }, generatedPatterns.bass).start(0);

      const drumSequence = new Tone.Part((time, hit) => {
        const drumMap = { kick, snare, hihat, crash, openhat };
        const drum = drumMap[hit.instrument];
        if (drum) {
          drum.triggerAttackRelease("8n", time, hit.velocity);
        }
      }, generatedPatterns.drums).start(0);

      // Store sequences for cleanup
      sequencesRef.current = [melodySequence, bassSequence, drumSequence];

      // Start progress tracking
      startProgressTracking();

      // Start playback
      Tone.Transport.start();
      setIsPlaying(true);
    } catch (err) {
      setError(`Error playing music: ${err.message}`);
      console.error("Playback error:", err);
    }
  };

  // Start progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      const currentTime = Tone.Transport.seconds;
      setCurrentTime(currentTime);

      if (totalDuration > 0) {
        const progressPercent = (currentTime / totalDuration) * 100;
        setProgress(Math.min(progressPercent, 100));
      }

      // Stop when duration is reached
      if (currentTime >= totalDuration) {
        stopMusic();
      }
    }, 100); // Update every 100ms
  };

  // Stop the music
  const stopMusic = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Dispose sequences
    sequencesRef.current.forEach((seq) => seq.dispose());
    sequencesRef.current = [];

    // Clear progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  // Download MIDI function (simplified for Tone.js patterns)
  const downloadMIDI = () => {
    if (generatedPatterns) {
      // Create a simple MIDI-like data structure
      const midiData = {
        tempo: parsedData.tempo,
        tracks: [
          {
            name: "Melody",
            notes: generatedPatterns.melody.map((note) => ({
              pitch: note.note,
              startTime: note.time,
              duration: note.duration,
              velocity: note.velocity,
            })),
          },
          {
            name: "Bass",
            notes: generatedPatterns.bass.map((note) => ({
              pitch: note.note,
              startTime: note.time,
              duration: note.duration,
              velocity: note.velocity,
            })),
          },
        ],
      };

      const blob = new Blob([JSON.stringify(midiData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "generated-song.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="music-generator">
      {!generatedPatterns && !isLoading && (
        <div className="generate-section">
          <button
            onClick={generateMusic}
            disabled={!prompt || prompt.trim().length < 3}
            className="generate-music-button"
          >
            🎵 Generate Music with AI
          </button>
          {prompt && prompt.trim().length < 3 && (
            <p className="prompt-hint">
              Enter at least 3 characters to generate music
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="loading-state">
          <p>🎵 Generating {parsedData?.duration || 120}s track with AI...</p>
          <div className="loading-spinner">⏳</div>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p style={{ color: "red" }}>❌ {error}</p>
        </div>
      )}

      {generatedPatterns && parsedData && (
        <div className="generated-music">
          <div className="music-info">
            <h3>🎼 Generated Track</h3>
            <p>
              <strong>Duration:</strong> {Math.floor(parsedData.duration / 60)}:
              {(parsedData.duration % 60).toString().padStart(2, "0")}
            </p>
            <p>
              <strong>Tempo:</strong> {parsedData.tempo} BPM
            </p>
            <p>
              <strong>Key:</strong> {parsedData.key}
            </p>
            <p>
              <strong>Style:</strong> {parsedData.style}
            </p>
            <p>
              <strong>Mood:</strong> {parsedData.mood}
            </p>
            <p>
              <strong>Melody Notes:</strong> {generatedPatterns.melody.length}
            </p>
            <p>
              <strong>Drum Hits:</strong> {generatedPatterns.drums.length}
            </p>
            <p>
              <strong>Bass Notes:</strong> {generatedPatterns.bass.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-info">
              <span>
                {Math.floor(currentTime / 60)}:
                {(currentTime % 60).toFixed(0).padStart(2, "0")}
              </span>
              <span>
                {Math.floor(totalDuration / 60)}:
                {(totalDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="music-controls">
            {!isPlaying ? (
              <button onClick={playMusic} className="play-button">
                ▶️ Play Full Song
              </button>
            ) : (
              <button onClick={stopMusic} className="stop-button">
                ⏹️ Stop
              </button>
            )}
            <button onClick={downloadMIDI} className="download-button">
              📥 Download JSON
            </button>
            <button
              onClick={() => {
                setGeneratedPatterns(null);
                setParsedData(null);
                setError(null);
                setIsPlaying(false);
                setProgress(0);
                setCurrentTime(0);
                setTotalDuration(0);
                stopMusic();
              }}
              className="regenerate-button"
            >
              🔄 Generate New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicGenerator;
