import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { uploadToCloudinary, compressAudioFile } from "../services/cloudinary";
import { useAuth } from "../contexts/AuthContext";
import dittytoyService from "../services/dittytoyService";
import Header from "./Header";
import {
  PlayIcon,
  PauseIcon,
  PreviousIcon,
  NextIcon,
  ShuffleIcon,
  RepeatIcon,
  VolumeIcon,
  RecordIcon,
  DownloadIcon,
  MusicNoteIcon,
} from "./SVGIcons";

const MusicPlayer = ({
  patterns: propPatterns,
  onPlay: propOnPlay,
  onStop: propOnStop,
  showRecordButton = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const track = location.state?.track;
  const trackPatterns = location.state?.patterns;
  const trackInstructions = location.state?.instructions;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [patterns, setPatterns] = useState(propPatterns || trackPatterns);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const { currentUser } = useAuth();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // If patterns are passed as props, use them; otherwise use state or track patterns
  const currentPatterns = propPatterns || patterns || trackPatterns;

  useEffect(() => {
    // Initialize Dittytoy when component mounts
    dittytoyService.initialize().catch(console.error);

    // Cleanup function to stop playback when leaving the page
    return () => {
      console.log("🎵 MusicPlayer: Cleaning up - stopping playback");
      dittytoyService.stop();
    };
  }, []);

  useEffect(() => {
    // Generate simple waveform visualization data and calculate duration
    if (currentPatterns) {
      const data = Array.from({ length: 100 }, () => Math.random() * 100);
      setWaveformData(data);

      // Calculate actual duration from patterns or use track duration
      let maxTime = 0;

      if (currentPatterns.melody) {
        const melodyMax = Math.max(
          ...currentPatterns.melody.map(
            (note) => note.time + parseFloat(note.duration)
          )
        );
        maxTime = Math.max(maxTime, melodyMax);
      }

      if (currentPatterns.bass) {
        const bassMax = Math.max(
          ...currentPatterns.bass.map(
            (note) => note.time + parseFloat(note.duration)
          )
        );
        maxTime = Math.max(maxTime, bassMax);
      }

      if (currentPatterns.drums) {
        const drumsMax = Math.max(
          ...currentPatterns.drums.map((hit) => hit.time + 0.5)
        ); // Assume 0.5s duration for drum hits
        maxTime = Math.max(maxTime, drumsMax);
      }

      // Add some padding and ensure minimum duration
      const actualDuration = Math.max(maxTime + 2, track?.duration || 60); // Use track duration if available
      setDuration(actualDuration);

      console.log(
        `🎵 Calculated track duration: ${actualDuration}s (${Math.floor(
          actualDuration / 60
        )}:${(actualDuration % 60).toString().padStart(2, "0")})`
      );
    }
  }, [currentPatterns, track]);

  useEffect(() => {
    if (isPlaying) {
      animateWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest(".export-dropdown")) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportDropdown]);

  const animateWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#4f46e5";

      const barWidth = width / waveformData.length;

      waveformData.forEach((value, index) => {
        const barHeight = (value / 100) * height * 0.8;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;

        ctx.fillRect(x, y, barWidth - 2, barHeight);
      });

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
  };

  const handlePlay = async () => {
    console.log("🎵 Starting playback...");

    if (isPaused) {
      // Resume from pause
      dittytoyService.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startProgressTracking();
    } else {
      // Start playing
      setIsPlaying(true);
      setIsPaused(false);
      if (propOnPlay) {
        propOnPlay();
      } else if (currentPatterns) {
        console.log("🎵 Playing patterns:", {
          melody: currentPatterns.melody?.length || 0,
          bass: currentPatterns.bass?.length || 0,
          drums: currentPatterns.drums?.length || 0,
          tempo: currentPatterns.instructions?.tempo || 120,
          duration: duration,
        });

        await dittytoyService.playMusic(
          currentPatterns,
          currentPatterns.instructions
        );
      }
      startProgressTracking();
    }
  };

  const handlePause = () => {
    console.log("🎵 Pausing playback");
    dittytoyService.pause();
    setIsPaused(true);
    setIsPlaying(false);
    stopProgressTracking();
  };

  const handleStop = () => {
    console.log("🎵 Stopping playback");
    dittytoyService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setProgress(0);
    stopProgressTracking();
    if (propOnStop) {
      propOnStop();
    }
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      // Get actual time from Dittytoy service
      const toneTime = dittytoyService.getCurrentTime();

      if (toneTime > 0) {
        setCurrentTime(toneTime);
        const newProgress = (toneTime / duration) * 100;
        setProgress(Math.min(newProgress, 100));

        if (toneTime >= duration) {
          console.log("🎵 Track finished, stopping playback");
          handleStop();
        }
      } else {
        // Fallback to manual tracking
        setCurrentTime((prev) => {
          const newTime = prev + 0.1;
          const newProgress = (newTime / duration) * 100;
          setProgress(newProgress);
          if (newTime >= duration) {
            handleStop();
          }
          return newTime;
        });
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;

    console.log(
      `🎵 Seeking to ${newTime.toFixed(2)}s (${newProgress.toFixed(1)}%)`
    );

    setProgress(newProgress);
    setCurrentTime(newTime);

    // Seek in Dittytoy service
    // Note: Dittytoy doesn't support seeking, so we'll just update the display
    console.log("Seeking not supported in Dittytoy");

    // If we're paused, just update the position
    if (isPaused) {
      return;
    }

    // If we're playing, we need to restart from the new position
    if (isPlaying) {
      const wasPlaying = true;
      handleStop();

      // Restart from the new position after a brief delay
      setTimeout(() => {
        if (wasPlaying) {
          // Dittytoy doesn't support seeking, restart playback
          handlePlay();
        }
      }, 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    dittytoyService.setVolume(newVolume);
    console.log(`🔊 Volume changed to ${(newVolume * 100).toFixed(0)}%`);
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    console.log(`🔀 Shuffle ${isShuffled ? "disabled" : "enabled"}`);
    // TODO: Implement shuffle logic if multiple tracks
  };

  const handlePrevious = () => {
    console.log("⏮️ Previous track");
    // TODO: Implement previous track logic if multiple tracks
    // For now, restart current track
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  const handleNext = () => {
    console.log("⏭️ Next track");
    // TODO: Implement next track logic if multiple tracks
    // For now, restart current track
    handleStop();
    setTimeout(() => handlePlay(), 100);
  };

  const handleRepeat = () => {
    setIsRepeating(!isRepeating);
    console.log(`🔁 Repeat ${isRepeating ? "disabled" : "enabled"}`);
    // TODO: Implement repeat logic
  };

  const handleRecord = async () => {
    if (!isRecording) {
      setIsRecording(true);
      console.log(
        "Recording not supported with Dittytoy - saving patterns instead"
      );
    } else {
      setIsRecording(false);
      console.log("Recording stopped - patterns saved");
      return null; // No actual recording with Dittytoy
    }
  };

  const handleExport = async (format = "mp3") => {
    if (!currentPatterns || !currentUser) {
      console.error("Cannot export: missing patterns or user");
      return;
    }

    try {
      setIsExporting(true);
      setShowExportDropdown(false);

      console.log("🎵 Starting export from MusicPlayer...", { format });

      // Use the export track functionality from Dittytoy service
      const savedTrack = await dittytoyService.exportTrack(
        currentPatterns,
        currentPatterns.instructions,
        currentUser.uid,
        track?.title ||
          track?.name ||
          `Exported Track - ${new Date().toLocaleDateString()}`
      );

      if (savedTrack && dittytoyService.recordedAudio) {
        // Download the recorded audio
        dittytoyService.downloadTrack(
          savedTrack,
          `${track?.title || track?.name || "exported-track"}.${format}`,
          format
        );
        alert(
          `Track exported and downloaded successfully! Format: ${format.toUpperCase()}`
        );
      } else {
        alert("Track exported but failed to download. Please try again.");
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Failed to export track: ${error.message}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentPatterns) {
    return (
      <div className="music-player">
        <Header />
        <div className="player-content">
          <p>Generate music to see the player</p>
        </div>
      </div>
    );
  }

  return (
    <div className="music-player">
      <Header />
      <div className="player-content">
        {/* Professional Audio Player */}
        <div className="audio-player">
          <div className="track-info-header">
            <div className="track-artwork">
              <div className="artwork-placeholder">
                <MusicNoteIcon className="music-note-icon" />
              </div>
            </div>
            <div className="track-details-header">
              <h3 className="track-title">
                {track?.title ||
                  track?.name ||
                  currentPatterns.instructions?.style ||
                  "AI Generated Track"}
              </h3>
              <p className="track-artist">Chordara AI</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <span className="time-display">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleSeek}>
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
              <div
                className="progress-handle"
                style={{ left: `${progress}%` }}
              ></div>
            </div>
            <span className="time-display">{formatTime(duration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="player-controls">
            <button
              onClick={handleShuffle}
              className={`control-btn shuffle-btn ${
                isShuffled ? "active" : ""
              }`}
              title="Shuffle"
            >
              <ShuffleIcon className="icon" />
            </button>

            <button
              onClick={handlePrevious}
              className="control-btn prev-btn"
              title="Previous"
            >
              <PreviousIcon className="icon" />
            </button>

            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className={`control-btn main-play-btn ${
                isPlaying ? "playing" : ""
              }`}
            >
              {isPlaying ? (
                <PauseIcon className="icon main-icon" />
              ) : (
                <PlayIcon className="icon main-icon" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="control-btn next-btn"
              title="Next"
            >
              <NextIcon className="icon" />
            </button>

            <button
              onClick={handleRepeat}
              className={`control-btn repeat-btn ${
                isRepeating ? "active" : ""
              }`}
              title="Repeat"
            >
              <RepeatIcon className="icon" />
            </button>
          </div>

          {/* Volume and Export Controls */}
          <div className="player-actions">
            <div className="volume-control">
              <VolumeIcon className="volume-icon" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            {showRecordButton && (
              <button
                onClick={handleRecord}
                className={`action-btn record-btn ${
                  isRecording ? "recording" : ""
                }`}
                disabled={isExporting}
              >
                <RecordIcon className="icon" />
              </button>
            )}

            <div className="export-dropdown">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="action-btn export-btn"
                disabled={isExporting}
              >
                <DownloadIcon className="icon" />
                {isExporting ? "Downloading..." : "Download"}
              </button>

              {showExportDropdown && (
                <div className="export-menu">
                  <button
                    onClick={() => handleExport("mp3")}
                    className="export-option"
                  >
                    <DownloadIcon className="icon-small" />
                    Download as MP3
                  </button>
                  <button
                    onClick={() => handleExport("wav")}
                    className="export-option"
                  >
                    <DownloadIcon className="icon-small" />
                    Download as WAV
                  </button>
                  <button
                    onClick={() => handleExport("ogg")}
                    className="export-option"
                  >
                    <DownloadIcon className="icon-small" />
                    Download as OGG
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track Information */}
        <div className="track-info">
          <h4>Track Details</h4>
          <div className="track-details">
            <span>
              <strong>Style:</strong>{" "}
              {track?.style || currentPatterns.instructions?.style}
            </span>
            <span>
              <strong>Tempo:</strong>{" "}
              {track?.tempo || currentPatterns.instructions?.tempo} BPM
            </span>
            <span>
              <strong>Key:</strong> {currentPatterns.instructions?.key || "C"}
            </span>
            <span>
              <strong>Mood:</strong>{" "}
              {currentPatterns.instructions?.mood || "energetic"}
            </span>
            {track?.createdAt && (
              <span>
                <strong>Created:</strong>{" "}
                {new Date(track.createdAt.seconds * 1000).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
