import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";
import "../styles/VideoStream.css";

const VideoStream = () => {
  const navigate = useNavigate();
  const { user, profilePic } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const [showPointLog, setShowPointLog] = useState(false);
  const [pointLogs, setPointLogs] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [previousFixtures, setPreviousFixtures] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topUsers, setTopUsers] = useState([]);

  const handleLogout = () => {
    navigate("/logout");
  };

  // ✅ Prevent scrollbars globally
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="video-container" style={{ overflow: "hidden" }}>
      <header className="home-header">
        <div className="logo">Sportify</div>
        <nav className="nav-bar">
          <Link to="/">Home Page</Link>
          <Link to="/fantasy-team">Fantasy</Link>
          <Link to="/News">Sports News</Link>
          <Link to="/team-prediction-form">Predictions</Link>
          <Link to="/npl">NPL</Link>
          <Link to="/leaderboard">Leaderboards</Link>
          <Link to="/videostream">Live Game</Link>
          {user && (
            <div className="account-container">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="nav-profile-picture"
                  onClick={toggleMenu}
                />
              ) : (
                <FaUserCircle
                  size={24}
                  onClick={toggleMenu}
                  style={{ cursor: "pointer" }}
                />
              )}
              
              {showMenu && (
                <div className="account-dropdown">
                  <p>👤 {user.username}</p>
                  <p><Link to="/account">Account Overview</Link></p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

          )}
        </nav>
      </header>
      {/* Cropped iframe */}
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 80px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "820px",
            height: "470px",
            overflow: "hidden",
            position: "relative",
            borderRadius: "12px",
            boxShadow: "0 0 12px rgba(0,0,0,0.4)",
          }}
        >
          <iframe
            src="https://cdn.totalsportek.space/embed77/?event=stack.html&link=1&domain=&force=https%3A%2F%2Fstreambtw.com%2Fiframe%2Fch1.php&ask=1747857600&lgt=3&noplayer=0"
            style={{
              position: "absolute",
              top: "-90px",
              right: "-25px",
              width: "860px",
              height: "560px",
              border: "none",
              pointerEvents: "auto", // or conditionally based on your logic
            }}
            scrolling="no"
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-presentation"
            title="Sportify Live Stream"
          />

        </div>
      </div>
    </div>
  );
};

export default VideoStream;
