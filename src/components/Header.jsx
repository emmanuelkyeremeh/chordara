import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
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
        <nav className="header-nav">
          <button onClick={() => navigate("/dashboard")} className="nav-button">
            Dashboard
          </button>
          <button onClick={() => navigate("/studio")} className="nav-button">
            Studio
          </button>
        </nav>
        <div className="header-actions">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
