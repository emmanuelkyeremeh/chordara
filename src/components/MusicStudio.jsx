import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { generateMusicInstructions } from "../services/openRouter";
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
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [prompt, setPrompt] = useState("");
  const [instructions, setInstructions] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [savedTrackId, setSavedTrackId] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("mp3");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [trackName, setTrackName] = useState("");

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

      // Clean up previous song state
      console.log("🎵 Cleaning up previous song state...");

      // Stop any current playback
      dittytoyService.stop();

      // Reset DittyBoy service for new generation
      console.log("🎵 Resetting DittyBoy service for new generation...");
      dittytoyService.reset();

      // Clear previous patterns and instructions
      setPatterns(null);
      setInstructions(null);
      setSavedTrackId(null);
      setSaving(false);
      setDownloading(false);

      // Clear any previous errors
      setError("");

      // Generate AI instructions
      console.log("🎵 Generating new music instructions...");
      const aiInstructions = await generateMusicInstructions(prompt);
      setInstructions(aiInstructions);

      // Generate musical patterns using enhanced brain.js service
      console.log(
        "🎵 Generating patterns with enhanced brain.js neural networks..."
      );
      const melody = generateMelody(aiInstructions, 60);
      const bass = generateBassLine(aiInstructions, 60);
      const drums = generateDrumPattern(aiInstructions, 60);

      const generatedPatterns = {
        melody,
        bass,
        drums,
        instructions: aiInstructions,
      };

      setPatterns(generatedPatterns);

      // Auto-save disabled - user must manually save tracks
      console.log(
        "🎵 New music generated successfully - use Save button to save track"
      );

      // Show success notification
      showSuccess(
        "New music generated successfully! You can now play, save, or download it."
      );
    } catch (err) {
      console.error("Error generating music:", err);
      setError("Failed to generate music: " + err.message);
      showError("Failed to generate music: " + err.message);
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
      showSuccess("Track automatically saved to your library!");
    } catch (error) {
      console.error("Auto-save failed:", error);
      showWarning("Failed to auto-save track, but you can still play it.");
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
      // Clean up all state
      setPatterns(null);
      setInstructions(null);
      setPrompt("");
      setSavedTrackId(null);
      setSaving(false);
      setDownloading(false);
      setError("");

      // Stop and reset DittyBoy service
      dittytoyService.stop();
      dittytoyService.reset();

      console.log("🎵 Track discarded and service reset for new generation");
    }
  };

  const handlePlay = async () => {
    if (patterns) {
      try {
        console.log("🎵 Starting music playback...");
        // Just play the music without any automatic saving
        await dittytoyService.playMusic(patterns, patterns.instructions);
        console.log("🎵 Music playback started successfully");
      } catch (error) {
        console.error("Error playing music:", error);
        console.log(
          "🎵 Playback failed - user can use save button to save manually"
        );
        // Don't show alerts, just log to console for development
      }
    } else {
      console.log("🎵 No patterns available to play");
    }
  };

  const handleStop = () => {
    dittytoyService.stop();
  };

  const handleSave = () => {
    console.log("🎵 Save button clicked", {
      patterns: !!patterns,
      currentUser: !!currentUser,
    });
    if (patterns && currentUser) {
      const defaultName = `My Track - ${new Date().toLocaleDateString()}`;
      setTrackName(defaultName);
      setShowSaveModal(true);
      console.log("🎵 Save modal should be showing now", {
        showSaveModal: true,
        trackName: defaultName,
      });
    } else {
      showWarning(
        "Please generate music first and make sure you're logged in."
      );
    }
  };

  const handleSaveConfirm = async () => {
    if (!trackName.trim()) {
      showWarning("Please enter a track name.");
      return;
    }

    try {
      setSaving(true);
      setShowSaveModal(false);
      console.log("🎵 Starting track save...", {
        trackName: trackName.trim(),
        hasPatterns: !!patterns,
        hasInstructions: !!patterns.instructions,
        userId: currentUser.uid,
      });

      // Use silent export to save track data
      const savedTrack = await dittytoyService.silentExport(
        patterns,
        patterns.instructions,
        currentUser.uid,
        trackName.trim()
      );

      console.log("🎵 Track saved successfully:", savedTrack);

      if (savedTrack) {
        setSavedTrackId(savedTrack.id);
        showSuccess(`Track saved successfully! Title: ${savedTrack.title}`);
      }
    } catch (error) {
      console.error("Error saving track:", error);
      showError("Error saving track. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (patterns && currentUser) {
      setTrackName(`My Track - ${new Date().toLocaleDateString()}`);
      setShowDownloadModal(true);
    } else {
      showWarning(
        "Please generate music first and make sure you're logged in."
      );
    }
  };

  const handleDownloadConfirm = async () => {
    if (!trackName.trim()) {
      showWarning("Please enter a track name.");
      return;
    }

    try {
      setDownloading(true);
      setShowDownloadModal(false);
      console.log("🎵 Starting track download...", {
        trackName: trackName.trim(),
        format: selectedFormat,
        hasPatterns: !!patterns,
        hasInstructions: !!patterns.instructions,
        userId: currentUser.uid,
      });

      // Generate and record audio for download
      const savedTrack = await dittytoyService.exportTrack(
        patterns,
        patterns.instructions,
        currentUser.uid,
        trackName.trim()
      );

      console.log("🎵 Track exported for download:", savedTrack);

      if (
        savedTrack &&
        (savedTrack.audioBlob || dittytoyService.recordedAudio)
      ) {
        // Download the recorded audio using the service method
        console.log("🎵 Triggering download...");
        dittytoyService.downloadTrack(
          savedTrack,
          `${trackName.trim()}.${selectedFormat}`,
          selectedFormat
        );

        // Restore playback capability after download
        await dittytoyService.restorePlayback();

        showSuccess(
          `Track downloaded successfully! Format: ${selectedFormat.toUpperCase()}`
        );
      } else {
        console.error("No recorded audio available for download");
        showError("Failed to generate audio for download. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading track:", error);
      showError("Error downloading track. Please try again.");
    } finally {
      setDownloading(false);
    }
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
                <button
                  onClick={handleSave}
                  className="save-button"
                  disabled={!patterns || !currentUser || saving}
                >
                  {saving ? "💾 Saving..." : "💾 Save Track"}
                </button>
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

        {/* Save Track Modal */}
        {showSaveModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal">
              <h3>Save Track</h3>
              <p>Enter a name for your track:</p>
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Track name"
                className="modal-input"
                autoFocus
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    console.log("🎵 Cancel button clicked");
                    setShowSaveModal(false);
                  }}
                  className="modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfirm}
                  className="modal-confirm"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Track"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Download Track Modal */}
        {showDownloadModal && (
          <div className="modal-overlay" style={{ zIndex: 9999 }}>
            <div className="modal">
              <h3>Download Track</h3>
              <p>Enter a name for your download:</p>
              <input
                type="text"
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Track name"
                className="modal-input"
                autoFocus
              />
              <div className="format-selection">
                <label>Format:</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="modal-select"
                >
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="webm">WebM</option>
                  <option value="ogg">OGG</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="modal-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDownloadConfirm}
                  className="modal-confirm"
                  disabled={downloading}
                >
                  {downloading ? "Downloading..." : "Download Track"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicStudio;
