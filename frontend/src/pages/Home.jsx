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
  const [activeIndex, setActiveIndex] = useState(0);
  const featuresRef = useRef(null);

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
    if (!carousel) return;

    // Find the exact match-card by data-date attribute
    const targetCard = carousel.querySelector(`.match-card[data-date="${date}"]`);
    if (!targetCard) return;

    targetCard.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    setSelectedDate(date);

    // Handle date-pill centering
    const pills = dateNavRef.current.querySelectorAll(".date-pill");
    const pill = pills[index];
    const navContainer = dateNavRef.current;
    const offset = pill.offsetLeft - navContainer.offsetWidth / 2 + pill.offsetWidth / 2;

    navContainer.scrollTo({
      left: offset,
      behavior: "smooth",
    });
  };



  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const children = Array.from(carousel.children);
      const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;

      let closestCard = null;
      let closestDistance = Infinity;

      children.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(carouselCenter - cardCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCard = card;
        }
      });

      children.forEach((card) => {
        if (card === closestCard) {
          card.classList.add("focused");
        } else {
          card.classList.remove("focused");
        }
      });
    };

    carousel.addEventListener("scroll", handleScroll);
    // run once to initialize focus
    handleScroll();

    return () => {
      carousel.removeEventListener("scroll", handleScroll);
    };
  }, []);


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

  const getTeamLogo = (teamId) => {
    return `/team-logos/${teamId}.png`;
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

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleWheelScroll = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        carousel.scrollLeft += e.deltaY;
      }
    };

    carousel.addEventListener("wheel", handleWheelScroll, { passive: false });

    return () => {
      carousel.removeEventListener("wheel", handleWheelScroll);
    };
  }, []);

  useEffect(() => {
    const hero = document.querySelector(".scroll-reveal");

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Add or remove class based on scroll distance
      if (scrollY > window.innerHeight * 0.4) {
        hero.classList.add("fade-out");
      } else {
        hero.classList.remove("fade-out");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(3, newsArticles.length));
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [newsArticles]);

  return (
  <div className="home-container">
    {/* NAVBAR */}
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

    {/* HERO */}
    <div className="scroll-reveal-wrapper">
      <main className="hero scroll-reveal">
        <div className="hero-text">
          <h1>Unleash Your Fantasy Football Passion with Sportify</h1>
          <div className="hero-buttons">
            <button className="btn primary-btn" onClick={goToFantasy}>
              Join
            </button>
            <button className="btn secondary-btn" onClick={() => {
              featuresRef.current?.scrollIntoView({ behavior: "smooth" });
            }}>
              Learn More
            </button>

          </div>
        </div>
      </main>

      <section className="home-features-section " ref={featuresRef}>
        <div className="home-features-header">
          <h2 className="home-features-title">
            Discover the Thrill of Fantasy Football and Live Sports Action
          </h2>
          <p className="home-features-subtitle">
            Dive into the exciting world of fantasy football where strategy meets fun.
            Create your dream team, compete with friends, and climb the global leaderboard.
            Experience the joy of sports like never before!
          </p>
        </div>

        <div className="home-features-grid">
          <div className="home-feature-box">
            <img src="/football.jpg" alt="icon" className="home-feature-icon" />
            <h3>Stay Informed with the Latest Sports News and Updates</h3>
            <p>Get real-time updates on Nepalese sports and beyond.</p>
          </div>
          <div className="home-feature-box">
            <img src="/football.jpg" alt="icon" className="home-feature-icon" />
            <h3>Watch Live Football Matches Anytime, Anywhere with Our Streaming Service</h3>
            <p>Catch every goal and moment as they happen in real time.</p>
          </div>
          <div className="home-feature-box">
            <img src="/football.jpg" alt="icon" className="home-feature-icon" />
            <h3>Join the Community of Passionate Football Fans and Players</h3>
            <p>Connect, compete, and celebrate your love for football with others.</p>
          </div>
        </div>
      </section>

    </div>

    <section className="hot-news-section">
      <h1 className="hot-news-heading">Today’s Hot News 🔥</h1>
      {newsArticles.length > 0 ? (
        <>
          <div className="hot-news-container">
            <div className="hot-news-image-box">
              <img
                src={`http://127.0.0.1:8000${newsArticles[activeIndex].image}`}
                alt={newsArticles[activeIndex].title}
                className="hot-news-image"
              />
            </div>
            <div className="hot-news-content">
              <h2 className="hot-news-title">{newsArticles[activeIndex].title}</h2>
            </div>
          </div>

          <div className="news-dots">
            {newsArticles.slice(0, 3).map((_, index) => (
              <span
                key={index}
                className={`news-dot ${activeIndex === index ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              ></span>
            ))}
          </div>
        </>
      ) : (
        <p className="hot-news-empty">No news available right now.</p>
      )}
    </section>


    <section className="prediction-feature-section">
      <div className="prediction-text">
        <p className="section-label">Predict</p>
        <h2>Enhance Your Game with Predictions</h2>
        <p className="section-description">
          Forecast your fantasy team's weekly stats before each match. Earn multipliers on your total points by getting predictions right — and climb the leaderboard with strategy, not just luck.
        </p>

        <ul className="prediction-benefits">
          <li>
            🎯 <strong>Make Strategic Calls:</strong> Anticipate clean sheets, top scorers, and more based on player form.
          </li>
          <li>
            📈 <strong>Multiply Your Score:</strong> Correct predictions boost your weekly performance.
          </li>
          <li>
            🧠 <strong>Use Your Knowledge:</strong> Your football IQ earns you more than bragging rights.
          </li>
        </ul>
      </div>

      <div className="prediction-image">
        <img src="predict.png" alt="Prediction system preview" />
      </div>
    </section>



    {/* FIXTURES */}
    <section className="fixtures-section">
      <h2>Premier League Fixtures</h2>
      <section className="fixtures-block scrollable-matches">
        <h3>Recent Matches</h3>
        <div className="scroll-container">
          {previousFixtures.slice(-10).map((match) => (
            <div className="scroll-item" key={match.id}>
              {formatDate(match.kickoff_time)}  <p></p>
              <img src={getTeamLogo(match.team_h)} alt={getTeamName(match.team_h)} className="team-logo" />
              {getTeamName(match.team_h)} {match.team_h_score} : {match.team_a_score} {getTeamName(match.team_a)}
              <img src={getTeamLogo(match.team_a)} alt={getTeamName(match.team_a)} className="team-logo" />
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
              className={`match-card ${selectedDate === date ? "focused" : "dimmed"}`}
            >
              <h4>{date}</h4>
              <ul className="match-list">
                {matches.map((match) => (
                  <li key={match.id}>
                    {formatDate(match.kickoff_time)} - 
                    <img src={getTeamLogo(match.team_a)} alt={getTeamName(match.team_a)} className="team-logo" />
                    {getTeamName(match.team_a)} vs {getTeamName(match.team_h)}
                    <img src={getTeamLogo(match.team_h)} alt={getTeamName(match.team_h)} className="team-logo" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </section>

    {/* TOP PLAYERS */}
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
                <td>{player.first_name} {player.second_name}</td>
                <td>{player.team}</td>
                <td>{player.goals_scored}</td>
                <td>{player.assists}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {selectedPlayer && (
        <div className="player-details">
          <h2>{selectedPlayer.first_name} {selectedPlayer.second_name}</h2>
          <p><strong>Team:</strong> {selectedPlayer.team}</p>
          <p><strong>Goals Scored:</strong> {selectedPlayer.goals_scored}</p>
          <p><strong>Assists:</strong> {selectedPlayer.assists}</p>
          <p><strong>Position:</strong> {selectedPlayer.position}</p>
          <p><strong>Total Points:</strong> {selectedPlayer.total_points}</p>
        </div>
      )}
    </div>

    {/* LEADERBOARD */}
    <section className="leaderboard-preview-section">
      <div className="leaderboard-container">
        <div className="leaderboard-text-content">
          <h5 className="leaderboard-subtitle">Compete</h5>
          <h2 className="leaderboard-title">Join the Global Fantasy Football Leaderboard</h2>
          <p className="leaderboard-description">
            Showcase your skills and climb the ranks on our global leaderboard.
            Compete against players from around the world and prove you have what it takes to be the best.
          </p>
          <div className="leaderboard-buttons">
            <button className="btn primary-btn" onClick={goToFantasy}>Learn More</button>
            <button className="btn secondary-btn">Sign Up →</button>
          </div>
        </div>

        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={user.user_id}>
                  <td>{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</td>
                  <td>{user.username}</td>
                  <td>{user.allpoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="home-footer">
      <div className="footer-cta">
        <h2>Join the Fantasy Football Fun!</h2>
        <p>Sign up now for exclusive updates and insights.</p>
        <div className="footer-buttons">
          <button className="btn primary-btn" onClick={goToFantasy}>Join</button>
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
