import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";
import "../styles/VideoStream.css";

const VideoStream = () => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const { user, profilePic } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showFrame, setShowFrame] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const getTeamName = (teamId) => {
  const teams = {
      1: "Arsenal",
      2: "Aston Villa",
      3: "Bournemouth",
      4: "Brentford",
      5: "Brighton",
      6: "Chelsea",
      7: "Crystal Palace",
      8: "Everton",
      9: "Fulham",
      10: "Ipswich Town",
      11: "Leicester City",
      12: "Liverpool",
      13: "Man City",
      14: "Man Utd",
      15: "Newcastle Utd",
      16: "Nottingham Forest",
      17: "Southampton",
      18: "Tottenham",
      19: "West Ham",
      20: "Wolves",
    };
    return teams[teamId] || `Team ${teamId}`;
  };

  useEffect(() => {
      fetch("http://127.0.0.1:8000/api/fpl-fixtures/")
        .then((res) => res.json())
        .then((data) => {
          const now = new Date();
          const upcoming = data.filter((f) => new Date(f.kickoff_time) > now);
          const past = data.filter((f) => new Date(f.kickoff_time) <= now);
          setFixtures(upcoming);
          setPreviousFixtures(past);
        })
        .catch((error) => console.error("Error fetching fixtures:", error));
    }, []);

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
                  <button onClick={() => navigate("/logout")}>Logout</button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* 🔹 Fixture Selection Grid */}
      {!showFrame && (
        <div className="fixture-grid-section">
          <h2 className="fixture-section-title">Watch Live Fixtures</h2>
          <div className="fixture-grid">
            {fixtures.slice(0, 12).map((fixture) => (
              <div className="fixture-card" onClick={() => setShowFrame(true)}>
                <div className="fixture-logos">
                  <img
                    src={`/team-logos/${fixture.team_h}.png`}
                    alt={getTeamName(fixture.team_h)}
                    className="fixture-logo"
                  />
                  <span className="vs-text">vs</span>
                  <img
                    src={`/team-logos/${fixture.team_a}.png`}
                    alt={getTeamName(fixture.team_a)}
                    className="fixture-logo"
                  />
                </div>
                <p>{getTeamName(fixture.team_h)} vs {getTeamName(fixture.team_a)}</p>
              </div>

            ))}
          </div>
        </div>
      )}


      {/* 🔹 Live Video Frame (unchanged) */}
      {showFrame && (
        <div
          className="iframe-modal-overlay"
          onClick={() => setShowFrame(false)}
        >
          <div
            className="iframe-modal-content"
            onClick={(e) => e.stopPropagation()}
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
                pointerEvents: "auto",
              }}
              scrolling="no"
              allowFullScreen
              loading="lazy"
              sandbox="allow-scripts allow-presentation"
              title="Sportify Live Stream"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default VideoStream;
