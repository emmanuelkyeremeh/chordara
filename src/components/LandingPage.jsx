import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import SEO from "./SEO";

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };
  return (
    <div className="landing-page">
      <SEO
        title="AI Music Generator - Create Unique Songs"
        description="Transform your ideas into music with Chordara's AI-powered music generator. Create unique songs in any style - electronic, rock, jazz, pop, and more. No musical experience required!"
        keywords="AI music generator, music creation, artificial intelligence music, song generator, music composer, AI composer, music maker, electronic music, music production, creative AI"
        canonicalUrl="https://chordara.com/"
      />
      <header className="hero">
        <div className="hero-content">
          <h1>Chordara</h1>
          <p className="hero-subtitle">
            AI-Powered Music Production in Your Browser
          </p>
          <p className="hero-description">
            Describe your music in natural language, and let AI generate
            beautiful melodies, chord progressions, and drum patterns. Create,
            play, and export your tracks all in one place.
          </p>
          <div className="cta-buttons">
            <button onClick={handleGetStarted} className="cta-primary">
              Start Creating Music
            </button>
            <button className="cta-secondary">Watch Demo</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="music-visualizer">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </header>

      <section className="features">
        <div className="container">
          <h2>Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3>AI Music Generation</h3>
              <p>
                Describe your musical vision in plain English and watch AI
                create the perfect soundtrack.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎹</div>
              <h3>Real-time Playback</h3>
              <p>
                Hear your creations instantly with high-quality synthesizers and
                drum machines.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Browser-Based</h3>
              <p>
                No downloads required. Create music anywhere, anytime, on any
                device.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Export & Save</h3>
              <p>
                Download your tracks as MP3 or WAV files and save them to your
                personal library.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Describe Your Music</h3>
              <p>
                Tell us what kind of music you want to create. Be as specific or
                general as you like.
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Generates Patterns</h3>
              <p>
                Our AI analyzes your description and creates melodies, chords,
                and drum patterns.
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Play & Refine</h3>
              <p>
                Listen to your creation in real-time and make adjustments as
                needed.
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Export & Share</h3>
              <p>Download your finished track and share it with the world.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Chordara. Made with ❤️ for music creators.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
