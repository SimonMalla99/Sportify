import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [previousFixtures, setPreviousFixtures] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showPointLog, setShowPointLog] = useState(false);
  const [pointLogs, setPointLogs] = useState([]);
  const { profilePic } = useContext(AuthContext);
  const [topUsers, setTopUsers] = useState([]);
  
  const goToFantasy = () => {
    if (user) navigate("/fantasy");
    else navigate("/login");
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leaderboard/")
      .then(res => res.json())
      .then(data => setLeaders(data))
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="npl-container" >
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
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

          )}
        </nav>
      </header>
      <h1 className="text-3xl font-bold text-center my-8">🏆 Leaderboard</h1>
      <div className="overflow-x-auto">
        <div className="leaderboard-search">
        <input
          type="text"
          placeholder="Search by username..."
          className="border border-gray-300 rounded px-4 py-2 w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

        <table className="leaderboard-table">
          <thead className="leaderboard-header">
            <tr>
              <th className="border p-2">Rank</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Total Points</th>
            </tr>
          </thead>
          <tbody>
            {leaders
              .filter(user => user.allpoints > 0)
              .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((user) => {
                const actualIndex = leaders.findIndex(
                  (u) => u.user_id === user.user_id
                );

                const rowClass =
                  actualIndex === 0
                    ? "bg-yellow-100 font-bold"
                    : actualIndex === 1
                    ? "bg-gray-200 font-semibold"
                    : actualIndex === 2
                    ? "bg-orange-100 font-medium"
                    : "";

                return (
                  <tr
                    key={user.user_id}
                    className={rowClass}
                    style={{
                      backgroundColor:
                        actualIndex === 0
                          ? "#FEF08A"
                          : actualIndex === 1
                          ? "#E5E7EB"
                          : actualIndex === 2
                          ? "#FED7AA"
                          : "white",
                      fontWeight: actualIndex < 3 ? "bold" : "normal",
                    }}
                  >
                    <td className="border p-2">{actualIndex + 1}</td>
                    <td className="border p-2">{user.username}</td>
                    <td className="border p-2">{user.allpoints}</td>
                  </tr>
                );
              })}


            </tbody>

        </table>
      </div>
      <footer className="home-footer">
      <div className="footer-cta">
        <h2>Join the Fantasy Football Fun!</h2>
        <p>Sign up now for exclusive updates and insights.</p>
        <div className="footer-buttons">
          <button className="btn primary-btn">Join</button>
          <button className="btn outline-btn">Learn More</button>
        </div>
      </div>

      <div className="footer-links">
        <div className="footer-brand">
          <h3>⚽ Sportify</h3>
        </div>
        <ul className="footer-nav">
          <li>Fantasy League</li>
          <li>Latest News</li>
          <li>Player Stats</li>
          <li>Join Us</li>
          <li>Get Started</li>
        </ul>
        <div className="footer-socials">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-x-twitter"></i>
          <i className="fab fa-linkedin"></i>
          <i className="fab fa-youtube"></i>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 Sportify. All rights reserved.</p>
        <ul>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
          <li>Cookies Settings</li>
        </ul>
      </div>
    </footer>
    </div>
  );
};

export default Leaderboard;
