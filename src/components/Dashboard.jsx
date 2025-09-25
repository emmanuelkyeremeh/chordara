import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { deleteAudioFromCloudinary } from "../services/cloudinary";
import dittytoyService from "../services/dittytoyService";
import Header from "./Header";
import SEO from "./SEO";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query tracks for the current user only
    const q = query(
      collection(db, "tracks"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tracksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTracks(tracksData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error fetching tracks:", error);
        setError(
          "Failed to load tracks. This might be due to an ad blocker or network issue."
        );
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const formatDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handleStartNewTrack = () => {
    navigate("/studio");
  };

  const handlePlayTrack = async (track) => {
    try {
      console.log("🎵 Playing track from dashboard:", track.title);

      // Navigate to MusicPlayer with track data
      navigate("/player", {
        state: {
          track: track,
          patterns: track.patterns,
          instructions: track.patterns?.instructions || {
            tempo: track.tempo || 120,
            key: "C",
            style: track.style || "electronic",
            mood: "energetic",
            duration: track.duration || 60,
          },
        },
      });
    } catch (error) {
      console.error("Error playing track:", error);
      alert("Error playing track. Please try again.");
    }
  };

  const handleDeleteTrack = async (trackId, cloudinaryPublicId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Use Dittytoy service to delete track
      await dittytoyService.deleteTrack(trackId, cloudinaryPublicId);
      alert("Track deleted successfully!");
    } catch (error) {
      console.error("Error deleting track:", error);
      alert("Failed to delete track. Please try again.");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Force a page refresh to reload tracks
    window.location.reload();
  };

  const handleDownloadTrack = async (track) => {
    if (track.isSilentExport) {
      alert(
        "This track was saved as data only and cannot be downloaded as audio. Use the Studio to generate and download audio files."
      );
      return;
    }

    if (track.cloudinaryUrl) {
      // Download from Cloudinary URL
      const link = document.createElement("a");
      link.href = track.cloudinaryUrl;
      link.download = `${track.title || "untitled"}.${
        track.fileFormat || "webm"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Download URL not available for this track.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your tracks...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <SEO
        title="My Music Dashboard"
        description="Manage your AI-generated music tracks. Play, download, and organize your unique songs created with Chordara's AI music generator."
        canonicalUrl="https://chordara.com/dashboard"
      />
      <Header />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Tracks</h1>
          <div className="dashboard-actions">
            <button onClick={handleRefresh} className="refresh-button">
              🔄 Refresh
            </button>
            <button onClick={handleStartNewTrack} className="new-track-button">
              + New Track
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <br />
            <small>Try refreshing the page or disabling ad blockers.</small>
          </div>
        )}

        {tracks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h2>No tracks yet</h2>
            <p>Create your first AI-generated track to get started!</p>
            <button onClick={handleStartNewTrack} className="cta-primary">
              Create Your First Track
            </button>
          </div>
        ) : (
          <div className="tracks-grid">
            {tracks.map((track) => (
              <div key={track.id} className="track-card">
                <div className="track-info">
                  <h3>{track.title || track.name || "Untitled Track"}</h3>
                  <p className="track-description">{track.description}</p>
                  <div className="track-meta">
                    <span className="track-style">{track.style}</span>
                    <span className="track-tempo">{track.tempo} BPM</span>
                    <span className="track-date">
                      {formatDate(track.createdAt)}
                    </span>
                    {track.isSilentExport && (
                      <span className="track-type">📝 Data Only</span>
                    )}
                  </div>
                </div>
                <div className="track-actions">
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="action-button play"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => handleDownloadTrack(track)}
                    className="action-button download"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteTrack(track.id, track.cloudinaryPublicId)
                    }
                    className="action-button delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
