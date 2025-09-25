import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1
          className="logo"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          Chordara
        </h1>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <button onClick={() => navigate("/dashboard")} className="nav-button">
            Dashboard
          </button>
          <button onClick={() => navigate("/studio")} className="nav-button">
            Studio
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions desktop-actions">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "open" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="mobile-nav-button"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation("/studio")}
                className="mobile-nav-button"
              >
                Studio
              </button>
            </nav>
            <div className="mobile-actions">
              <span className="mobile-user-email">{currentUser?.email}</span>
              <button onClick={handleLogout} className="mobile-logout-button">
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
