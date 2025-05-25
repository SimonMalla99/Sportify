import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../styles/News.css";
import "../styles/Home.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

function News() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showPointLog, setShowPointLog] = useState(false);
  const [pointLogs, setPointLogs] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [previousFixtures, setPreviousFixtures] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const { profilePic } = useContext(AuthContext);
  const [topUsers, setTopUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [availableCategories] = useState([
    "Football",
    "Basketball",
    "Cricket",
    "Swimming",
    "Table Tennis",
    "Badminton",
    "Volleyball",
    "Track and Field",
    "Other",
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleMenu = () => setShowMenu(!showMenu);

  const goToFantasy = () => {
    if (user) navigate("/fantasy");
    else navigate("/login");
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  // Fetch user's favourite sports to preselect categories
  useEffect(() => {
    if (user) {
      axios.get(`http://127.0.0.1:8000/api/get-profile/?user_id=${user.id}`)
        .then((res) => {
          const favSports = res.data.favourite_sports || [];
          setSelectedCategories(favSports);
        })
        .catch((err) => console.error("Error fetching user profile:", err));
    }
  }, [user]);

  // Fetch news articles based on selected categories
  useEffect(() => {
    setLoading(true);

    if (selectedCategories.length === 0) {
      // Load all news if nothing is selected
      axios.get("http://127.0.0.1:8000/api/news/")
        .then((response) => {
          setNewsArticles(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching news articles:", err);
          setError(err);
          setLoading(false);
        });
    } else {
      // Fetch news for each selected category & merge results
      const fetches = selectedCategories.map(cat =>
        axios.get(`http://127.0.0.1:8000/api/news/?category=${cat}`)
      );

      Promise.all(fetches)
        .then((responses) => {
          const mergedArticles = responses.flatMap(res => res.data);
          setNewsArticles(mergedArticles);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching filtered news:", err);
          setError(err);
          setLoading(false);
        });
    }
  }, [selectedCategories]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };



  return (
    <div className="home-container">
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

      <header className="news-header">
        <h1>Latest News</h1>
      </header>

      {/* Category Filters */}
      <div className="category-filters">
        <button
          className={`category-pill ${selectedCategories.length === 0 ? "selected" : ""}`}
          onClick={() => setSelectedCategories([])}
        >
          All
        </button>

        {availableCategories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategories.includes(cat) ? "selected" : ""}`}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>


      <div className="news-articles">
        {newsArticles.length === 0 ? (
          <p>No news articles available.</p>
        ) : (
          newsArticles.map((article) => (
            <Link to={`/news/${article.id}`} className="news-card-link" key={article.id}>
              <div className="news-article">
                {article.image && (
                  <img
                    src={`http://127.0.0.1:8000${article.image}`}
                    alt={article.title}
                  />
                )}
                <h2>{article.title}</h2>
              </div>
            </Link>
          ))
        )}
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
}

export default News;
