import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  generateMusicInstructions,
  generateAIPatterns,
} from "../services/openRouter";
import {
  generateMelody,
  generateBassLine,
  generateDrumPattern,
} from "../services/brainService";
import { uploadToCloudinary, compressAudioFile } from "../services/cloudinary";
import dittytoyService from "../services/dittytoyService";
import MusicPlayer from "./MusicPlayer";
import Header from "./Header";
import SEO from "./SEO";

const MusicStudio = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [instructions, setInstructions] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedTrackId, setSavedTrackId] = useState(null);

  useEffect(() => {
    // Initialize Dittytoy when component mounts
    dittytoyService.initialize().catch(console.error);

    // Cleanup function to stop playback when leaving the page
    return () => {
      console.log("🎵 MusicStudio: Cleaning up - stopping playback");
      dittytoyService.stop();
    };
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a music description");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Generate AI instructions
      const aiInstructions = await generateMusicInstructions(prompt);
      setInstructions(aiInstructions);

      // Generate AI-powered musical patterns
      console.log("🎵 Generating AI-powered patterns...");
      const aiPatterns = await generateAIPatterns(aiInstructions);

      // Use AI patterns if available, otherwise fall back to brain service
      const melody =
        aiPatterns.melodyPattern || generateMelody(aiInstructions, 60);
      const bass =
        aiPatterns.bassPattern || generateBassLine(aiInstructions, 60);
      const drums =
        aiPatterns.drumPattern || generateDrumPattern(aiInstructions, 60);

      const generatedPatterns = {
        melody,
        bass,
        drums,
        instructions: aiInstructions,
      };

      setPatterns(generatedPatterns);

      // Auto-save the track (disabled temporarily to fix recorder conflicts)
      console.log(
        "🎵 Auto-save disabled - use Export button in Music Player instead"
      );
      // await autoSaveTrack(generatedPatterns);
    } catch (err) {
      setError("Failed to generate music: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoSaveTrack = async (patterns) => {
    if (!currentUser || !patterns) {
      console.log("🎵 Auto-save skipped:", {
        hasUser: !!currentUser,
        hasPatterns: !!patterns,
      });
      return;
    }

    try {
      console.log("🎵 Starting auto-save process...");
      setSaving(true);

      // Since dittytoy doesn't have recording capabilities, we'll save the patterns directly
      // and generate a preview URL using the dittytoy code
      console.log("🎵 Saving track data directly...");

      // Generate dittytoy code for the track
      const dittytoyCode = dittytoyService.generateDittytoyCode(
        patterns,
        patterns.instructions
      );

      // Save track info to Firestore
      const trackData = {
        userId: currentUser.uid,
        name: `Track ${new Date().toLocaleDateString()}`,
        description: patterns.instructions?.style || "AI Generated Track",
        style: patterns.instructions?.style || "electronic",
        tempo: patterns.instructions?.tempo || 120,
        patterns: patterns,
        dittytoyCode: dittytoyCode,
        createdAt: new Date(),
        isAutoSaved: true,
      };

      console.log("🎵 Saving track to Firestore:", trackData);
      const docRef = await addDoc(collection(db, "tracks"), trackData);
      console.log("🎵 Track saved with ID:", docRef.id);

      setSavedTrackId(docRef.id);
      alert("Track automatically saved to your library!");
    } catch (error) {
      console.error("Auto-save failed:", error);
      alert("Failed to auto-save track, but you can still play it.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardTrack = () => {
    if (
      window.confirm(
        "Are you sure you want to discard this track? It will be lost forever."
      )
    ) {
      setPatterns(null);
      setInstructions(null);
      setPrompt("");
      setSavedTrackId(null);
      dittytoyService.stop();
    }
  };

  const handlePlay = async () => {
    if (patterns && currentUser) {
      try {
        // Use the new recording functionality
        const savedTrack = await dittytoyService.playMusicWithRecording(
          patterns,
          patterns.instructions,
          currentUser.uid
        );

        if (savedTrack) {
          alert(`Track saved successfully! Title: ${savedTrack.title}`);
        }
      } catch (error) {
        console.error("Error playing and saving music:", error);
        alert("Error playing music. Please try again.");
      }
    } else if (patterns) {
      // Fallback to regular play without recording
      await dittytoyService.playMusic(patterns, patterns.instructions);
    }
  };

  const handleStop = () => {
    dittytoyService.stop();
  };

  return (
    <div className="music-studio">
      <SEO
        title="Music Studio - Create AI Music"
        description="Create unique music with AI. Describe your musical vision and let Chordara's AI generate custom songs in any style - electronic, rock, jazz, pop, and more."
        canonicalUrl="https://chordara.com/studio"
      />
      <Header />
      <div className="studio-content">
        <div className="studio-header">
          <h1>Music Studio</h1>
        </div>

        <div className="prompt-section">
          <h2>Describe Your Music</h2>
          <div className="prompt-input">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Create an upbeat electronic track with a catchy melody and driving bass line'"
              rows={4}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="generate-button"
            >
              {loading ? "Generating..." : "Generate Music"}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        {instructions && (
          <div className="instructions-section">
            <h3>Generated Instructions</h3>
            <div className="instructions-grid">
              <div className="instruction-item">
                <strong>Tempo:</strong> {instructions.tempo} BPM
              </div>
              <div className="instruction-item">
                <strong>Key:</strong> {instructions.key}
              </div>
              <div className="instruction-item">
                <strong>Style:</strong> {instructions.style}
              </div>
              <div className="instruction-item">
                <strong>Mood:</strong> {instructions.mood}
              </div>
              <div className="instruction-item">
                <strong>Instruments:</strong>{" "}
                {instructions.instruments
                  ? instructions.instruments.join(", ")
                  : "synth, drums, bass"}
              </div>
              <div className="instruction-item">
                <strong>Chord Progression:</strong>{" "}
                {instructions.chordProgression
                  ? instructions.chordProgression.join(" - ")
                  : "C - Am - F - G"}
              </div>
              {instructions.bassStyle && (
                <div className="instruction-item">
                  <strong>Bass Style:</strong> {instructions.bassStyle}
                </div>
              )}
              {instructions.harmonyComplexity && (
                <div className="instruction-item">
                  <strong>Harmony:</strong> {instructions.harmonyComplexity}
                </div>
              )}
              {instructions.texture && (
                <div className="instruction-item">
                  <strong>Texture:</strong> {instructions.texture}
                </div>
              )}
              {instructions.energy && (
                <div className="instruction-item">
                  <strong>Energy:</strong> {instructions.energy}
                </div>
              )}
            </div>
          </div>
        )}

        {patterns && (
          <div className="player-section">
            <div className="player-header">
              <h3>Your Generated Track</h3>
              <div className="player-actions">
                {saving && (
                  <span className="saving-indicator">💾 Auto-saving...</span>
                )}
                <button onClick={handleDiscardTrack} className="discard-button">
                  🗑️ Discard Track
                </button>
              </div>
            </div>
            <MusicPlayer
              patterns={patterns}
              onPlay={handlePlay}
              onStop={handleStop}
              showRecordButton={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicStudio;
