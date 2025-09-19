import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { generateMusicInstructions } from "../services/openRouter";
import {
  generateMelody,
  generateBassLine,
  generateDrumPattern,
} from "../services/brainService";
import { uploadToCloudinary, compressAudioFile } from "../services/cloudinary";
import toneService from "../services/toneService";
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
    // Initialize Tone.js when component mounts
    toneService.initialize().catch(console.error);

    // Cleanup function to stop playback when leaving the page
    return () => {
      console.log(
        "🎵 MusicStudio: Cleaning up - stopping playback and recording"
      );
      toneService.stop();
      // Stop any active recording
      if (toneService.isRecording) {
        toneService.stopRecording().catch(console.error);
      }
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

      // Generate musical patterns
      const melody = generateMelody(aiInstructions, 60); // 1 minute for demo
      const bass = generateBassLine(aiInstructions, 60);
      const drums = generateDrumPattern(aiInstructions, 60);

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

      // Start recording
      console.log("🎵 Starting recording for auto-save...");
      try {
        await toneService.startRecording();
      } catch (error) {
        console.error("🎵 Failed to start recording for auto-save:", error);
        throw error;
      }

      // Play the track
      console.log("🎵 Playing track for auto-save...");
      await toneService.playAll(patterns, patterns.instructions.tempo);

      // Wait for track to finish (60 seconds)
      setTimeout(async () => {
        try {
          console.log("🎵 Stopping recording...");
          const recording = await toneService.stopRecording();
          toneService.stop();

          if (recording) {
            console.log("🎵 Recording completed, processing audio...");
            // Compress the audio
            console.log("🎵 Compressing audio...");
            const compressedBlob = await compressAudioFile(recording);

            // Upload to Cloudinary
            console.log("🎵 Uploading to Cloudinary...");
            const uploadResult = await uploadToCloudinary(
              compressedBlob,
              `chordara/tracks/${currentUser.uid}`
            );
            console.log("🎵 Cloudinary upload result:", uploadResult);

            // Save track info to Firestore
            const trackData = {
              userId: currentUser.uid,
              name: `Track ${new Date().toLocaleDateString()}`,
              description: patterns.instructions?.style || "AI Generated Track",
              style: patterns.instructions?.style || "electronic",
              tempo: patterns.instructions?.tempo || 120,
              downloadUrl: uploadResult.url,
              publicId: uploadResult.publicId,
              format: "mp3",
              createdAt: new Date(),
              fileSize: uploadResult.bytes,
            };

            console.log("🎵 Saving track to Firestore:", trackData);
            const docRef = await addDoc(collection(db, "tracks"), trackData);
            console.log("🎵 Track saved with ID:", docRef.id);

            setSavedTrackId(docRef.id);
            alert("Track automatically saved to your library!");
          }
        } catch (error) {
          console.error("Auto-save failed:", error);
          alert("Failed to auto-save track, but you can still play it.");
        } finally {
          setSaving(false);
        }
      }, 60000);
    } catch (error) {
      console.error("Auto-save setup failed:", error);
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
      toneService.stop();
    }
  };

  const handlePlay = async () => {
    if (patterns) {
      await toneService.playAll(patterns, patterns.instructions.tempo);
    }
  };

  const handleStop = () => {
    toneService.stop();
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
                {instructions.instruments.join(", ")}
              </div>
              <div className="instruction-item">
                <strong>Chord Progression:</strong>{" "}
                {instructions.chordProgression.join(" - ")}
              </div>
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
