import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [previousFixtures, setPreviousFixtures] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const navigate = useNavigate();
  const { user, profilePic } = useContext(AuthContext);
  const [topUsers, setTopUsers] = useState([]);


  const handleSendEmail = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/send-test-email/");
      const data = await response.json();
      alert(data.message); // e.g., "Email sent successfully!"
    } catch (error) {
      alert("Error sending email");
      console.error("Email error:", error);
    }
  };

  const goToFantasy = () => {
    if (user) navigate("/fantasy");
    else navigate("/login");
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/fpl-players/")
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error("Error fetching players:", error));
  }, []);

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
    axios
      .get("http://127.0.0.1:8000/api/news/")
      .then((response) => {
        setNewsArticles(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news articles:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const container = document.querySelector(".scroll-container");
    if (!container) return;

    const items = container.querySelectorAll(".scroll-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("active", entry.isIntersecting);
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [previousFixtures]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const groupedFixtures = useMemo(() => {
    return fixtures.reduce((acc, fixture) => {
      const dateKey = new Date(fixture.kickoff_time).toLocaleDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(fixture);
      return acc;
    }, {});
  }, [fixtures]);

  const [selectedDate, setSelectedDate] = useState(null);
  const carouselRef = useRef(null);
  const dateNavRef = useRef(null);

  useEffect(() => {
    const firstDate = Object.keys(groupedFixtures)[0];
    if (firstDate) {
      setSelectedDate(firstDate);
    }
  }, [groupedFixtures]);

  const scrollToDate = (index, date) => {
    const carousel = carouselRef.current;
    const card = carousel.children[index];

    card.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    setSelectedDate(date);

    const pill = dateNavRef.current.children[index];
    const navContainer = dateNavRef.current;
    const offset =
      pill.offsetLeft - navContainer.offsetWidth / 2 + pill.offsetWidth / 2;

    navContainer.scrollTo({
      left: offset,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const date = visible.target.getAttribute("data-date");
          setSelectedDate(date);
        }
      },
      {
        root: carouselRef.current,
        threshold: 0.6,
      }
    );

    const cards = carouselRef.current?.children || [];
    Array.from(cards).forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [groupedFixtures]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leaderboard/")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(user => user.allpoints > 0).slice(0, 3);
        setTopUsers(filtered);
      })
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

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
      15: "NewCastle Utd",
      16: "Nottingham Forest",
      17: "Southampton",
      18: "Tottenham Hotspur",
      19: "Westham Utd",
      20: "Wolves",
    };
    return teams[teamId] || `Team ${teamId}`;
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setSelectedPlayer(null);
  };

  const filteredPlayers = players.filter((player) =>
    `${player.first_name} ${player.second_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-container">
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

      <main className="hero">
        <div className="hero-text">
          <h1>Unleash Your Fantasy Football Passion with Sportify</h1>
          <p>
            Explore the world of fantasy football and sports news in Nepal. Join
            us today!
          </p>
          {user ? <p>Logged in as: {user.username}</p> : <p>Please log in</p>}
          <div className="hero-buttons">
            <button className="btn primary-btn" onClick={goToFantasy}>
              Join
            </button>
            <button className="btn secondary-btn">Learn More</button>
          </div>
        </div>
      </main>

      <section className="features-section">
        <h2 className="features-title">
            Explore the Latest in Football, Player Stats, and Match Results!
        </h2>

        <div className="features-grid">
            <div className="feature-card">
            <img src="/football.jpg" alt="icon" className="feature-icon" />
            <h3>Stay Updated with Real-Time Sports News and Insights!</h3>
            <p>Get comprehensive coverage on football, including player stats and match outcomes.</p>
            <a href="#" className="feature-link">Learn More <span>›</span></a>
            </div>

            <div className="feature-card">
            <img src="/football.jpg" alt="icon" className="feature-icon" />
            <h3>Dive into In-Depth Analysis of Player Performance and Predictions!</h3>
            <p>Utilize our prediction feature to enhance your fantasy football experience.</p>
            <a href="#" className="feature-link">Sign Up <span>›</span></a>
            </div>

            <div className="feature-card">
            <img src="/football.jpg" alt="icon" className="feature-icon" />
            <h3>Follow the Latest Match Results and Stay Ahead of the Game!</h3>
            <p>Access real-time match results and never miss a moment of action.</p>
            <a href="#" className="feature-link">Join Us <span>›</span></a>
            </div>
        </div>
        </section>

      {/* Fixtures Section */}
      <section className="fixtures-section">
        <h2>Premier League Fixtures</h2>

        <section className="fixtures-block scrollable-matches">
          <h3>Recent Matches</h3>
          <div className="scroll-container">
            {previousFixtures.slice(-10).map((match) => (
              <div className="scroll-item" key={match.id}>
                {formatDate(match.kickoff_time)} - {getTeamName(match.team_h)}{" "}
                {match.team_h_score} : {match.team_a_score}{" "}
                {getTeamName(match.team_a)}
              </div>
            ))}
          </div>
        </section>

        <section className="upcoming-section">
          <h3>Upcoming Matches</h3>
          <div className="date-nav" ref={dateNavRef}>
            <div className="date-spacer" />
            {Object.keys(groupedFixtures).map((date, index) => (
                <button
                key={date}
                className={`date-pill ${selectedDate === date ? 'active' : ''}`}
                onClick={() => scrollToDate(index, date)}
                >
                {date}
                </button>
            ))}
            <div className="date-spacer" />
            </div>


          <div className="match-carousel" ref={carouselRef}>
            {Object.entries(groupedFixtures).map(([date, matches]) => (
              <div
                key={date}
                data-date={date}
                className={`match-card ${
                  selectedDate === date ? "focused" : "dimmed"
                }`}
              >
                <h4>{date}</h4>
                <ul className="match-list">
                  {matches.map((match) => (
                    <li key={match.id}>
                      {formatDate(match.kickoff_time)} -{" "}
                      {getTeamName(match.team_a)} vs{" "}
                      {getTeamName(match.team_h)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* Players */}
      <div className="players-section">
        <h1>Top Premier League Players</h1>
        <input
          type="text"
          placeholder="Search player by name..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <table border="1">
          <thead>
            <tr>
              <th>Name</th>
              <th>Team</th>
              <th>Goals Scored</th>
              <th>Assists</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers
              .sort((a, b) => b.goals_scored - a.goals_scored)
              .slice(0, 5)
              .map((player) => (
                <tr key={player.id}>
                  <td>
                    {player.first_name} {player.second_name}
                  </td>
                  <td>{player.team}</td>
                  <td>{player.goals_scored}</td>
                  <td>{player.assists}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {selectedPlayer && (
          <div className="player-details">
            <h2>
              {selectedPlayer.first_name} {selectedPlayer.second_name}
            </h2>
            <p>
              <strong>Team:</strong> {selectedPlayer.team}
            </p>
            <p>
              <strong>Goals Scored:</strong> {selectedPlayer.goals_scored}
            </p>
            <p>
              <strong>Assists:</strong> {selectedPlayer.assists}
            </p>
            <p>
              <strong>Position:</strong> {selectedPlayer.position}
            </p>
            <p>
              <strong>Total Points:</strong> {selectedPlayer.total_points}
            </p>
          </div>
        )}
      </div>

      
      {/* News */}
      <header className="news-header">
            <h1>Stay Updated with the Latest Sports News</h1>
          </header>
          <div className="news-articles">
            {newsArticles.length === 0 ? (
              <p>No news articles available.</p>
            ) : (
              newsArticles.slice(0, 3).map((article) => (
                <div key={article.id} className="news-article">
                  {article.image && (
                    <img
                      src={`http://127.0.0.1:8000${article.image}`}
                      alt={article.title}
                      
                      
                    />
                  )}
                  <h2 >{article.title} </h2>
                </div>
              ))
            )}
          </div>
          <section className="leaderboard-preview-section">
      <header className="news-header">🏆 Top Fantasy Managers</header>
      <div className="max-w-md mx-auto">
        <table className="table-auto w-full text-sm rounded shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Rank</th>
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Points</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((user, index) => (
              <tr
                key={user.user_id}
                className={`${
                  index === 0
                    ? "bg-yellow-100 font-bold"
                    : index === 1
                    ? "bg-gray-200 font-semibold"
                    : index === 2
                    ? "bg-orange-100 font-medium"
                    : ""
                }`}
              >
                <td className="p-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</td>
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.allpoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-4">
          <Link
            to="/leaderboard"
            className="text-blue-600 font-semibold hover:underline"
          >
            View Full Leaderboard →
          </Link>
        </div>
      </div>
    </section>
    <footer className="home-footer">
      <div className="footer-cta">
        <h2>Join the Fantasy Football Fun!</h2>
        <p>Sign up now for exclusive updates and insights.</p>
        <div className="footer-buttons">
          <button className="btn primary-btn" onClick={goToFantasy}>
              Join
            </button>
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

export default Home;
