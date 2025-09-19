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
import Header from "./Header";
import SEO from "./SEO";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log("📊 Dashboard: Setting up tracks listener", {
      hasUser: !!currentUser,
      userId: currentUser?.uid,
    });

    if (!currentUser) {
      console.log("📊 Dashboard: No user, setting loading to false");
      setLoading(false);
      return;
    }

    // Query tracks for the current user only
    const q = query(
      collection(db, "tracks"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    console.log("📊 Dashboard: Creating Firestore query");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "📊 Dashboard: Firestore snapshot received:",
          snapshot.docs.length,
          "user tracks"
        );

        const tracksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("📊 Dashboard: User tracks:", tracksData);
        setTracks(tracksData);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("📊 Dashboard: Error fetching tracks:", error);
        setError(
          "Failed to load tracks. This might be due to an ad blocker or network issue."
        );
        setLoading(false);
      }
    );

    return () => {
      console.log("📊 Dashboard: Unsubscribing from tracks listener");
      unsubscribe();
    };
  }, [currentUser]);

  const formatDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const handleStartNewTrack = () => {
    navigate("/studio");
  };

  const handlePlayTrack = (track) => {
    // Navigate to player with track data
    navigate("/player", { state: { track } });
  };

  const handleDeleteTrack = async (trackId, publicId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this track? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Delete from Cloudinary first
      if (publicId) {
        await deleteAudioFromCloudinary(publicId);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "tracks", trackId));

      alert("Track deleted successfully!");
    } catch (error) {
      console.error("Error deleting track:", error);
      alert("Failed to delete track. Please try again.");
    }
  };

  const handleRefresh = () => {
    console.log("📊 Dashboard: Refreshing tracks...");
    setLoading(true);
    setError(null);
    // Force a page refresh to reload tracks
    window.location.reload();
  };

  // Test function to create a track directly in Firestore
  const handleTestFirestoreSave = async () => {
    if (!currentUser) {
      alert("No user logged in");
      return;
    }

    try {
      console.log("🧪 Testing Firestore save...");
      const testTrackData = {
        userId: currentUser.uid,
        name: `Test Track ${new Date().toLocaleTimeString()}`,
        description: "Test track for debugging Firestore",
        style: "electronic",
        tempo: 120,
        downloadUrl: "https://example.com/test.mp3",
        publicId: "test-id",
        format: "mp3",
        createdAt: new Date(),
        fileSize: 1024,
        duration: 120,
        key: "C",
        mood: "energetic",
        chordProgression: ["C", "G", "Am", "F"],
      };

      console.log("🧪 Creating test track:", testTrackData);
      const docRef = await addDoc(collection(db, "tracks"), testTrackData);
      console.log("🧪 Test track created with ID:", docRef.id);
      alert("Test track created! Check dashboard and console for details.");
    } catch (error) {
      console.error("🧪 Test track creation failed:", error);
      alert(`Test track creation failed: ${error.message}`);
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
            <button onClick={handleTestFirestoreSave} className="test-button">
              🧪 Test Firestore
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
                  <h3>{track.name || "Untitled Track"}</h3>
                  <p className="track-description">{track.description}</p>
                  <div className="track-meta">
                    <span className="track-style">{track.style}</span>
                    <span className="track-tempo">{track.tempo} BPM</span>
                    <span className="track-date">
                      {formatDate(track.createdAt)}
                    </span>
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
                    onClick={() => window.open(track.downloadUrl, "_blank")}
                    className="action-button download"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => handleDeleteTrack(track.id, track.publicId)}
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
