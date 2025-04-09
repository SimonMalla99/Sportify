import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css"; // Add the styles here
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function Home() {
    const [fixtures, setFixtures] = useState([]);
    const [previousFixtures, setPreviousFixtures] = useState([]);  // <-- FIXED: Added missing state
    const [visibleCount, setVisibleCount] = useState(10);
    const [players, setPlayers] = useState([]);  // State to store player data
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);  // Get logged-in user state
    const [showMenu, setShowMenu] = useState(false);
    const toggleMenu = () => setShowMenu(!showMenu);
    const [newsArticles, setNewsArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const goToFantasy = () => {
        if (user) {
            navigate("/fantasy");  // Redirect to fantasy if user is logged in
        } else {
            navigate("/login");  // Otherwise, redirect to login
        }
    };
    const handleLogout = () =>{
         navigate("/logout");
    };


    useEffect(() => {
        // Fetch player names from the Django API
        fetch("http://127.0.0.1:8000/api/fpl-players/")
            .then(response => response.json())
            .then(data => setPlayers(data))  // Store response in state
            .catch(error => console.error("Error fetching players:", error));
    }, []);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/fpl-fixtures/")
            .then(response => response.json())
            .then(data => {
                const now = new Date();
    
                const upcoming = data.filter(fixture => new Date(fixture.kickoff_time) > now);
                const past = data.filter(fixture => new Date(fixture.kickoff_time) <= now);
    
                setFixtures(upcoming);
                setPreviousFixtures(past);
            })
            .catch(error => console.error("Error fetching fixtures:", error));
    }, []);

    useEffect(() => {
        // Fetch news articles from your Django backend
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

    // Function to format date and time
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    // Function to get team names (replace with real team data if available)
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

    const filteredPlayers = players.filter(player => 
        `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="home-container">
            {/* Header with Logo and Navigation */}
            <header className="home-header">
                <div className="logo">Sportify</div>
                <nav className="nav-bar">
                    <Link to="/">Home Page</Link>
                    <Link to="/fantasy-team">Fantasy</Link>
                    <Link to="/News">Sports News</Link>
                    <Link to="/predictions">Predictions</Link>
                    <Link to="#">About</Link>
                    <Link to="#">Contact</Link>
                    <button className="btn join-btn" onClick={goToFantasy}>Join</button>
                    {user && (
                        <div className="account-container">
                            <FaUserCircle size={24} onClick={toggleMenu} style={{ cursor: "pointer" }} />
                            {showMenu && (
                                <div className="account-dropdown">
                                    <p>👤 {user.username}</p>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="hero">
                <div className="hero-text">
                    <h1>Unleash Your Fantasy Football Passion with Sportify</h1>
                    <p>Explore the world of fantasy football and sports news in Nepal. Join us today!</p>
                    {user ? <p>Logged in as: {user.username}</p> : <p>Please log in</p>}
                    <div className="hero-buttons">
                        <button className="btn primary-btn">Join</button>
                        <button className="btn secondary-btn">Learn More</button>
                    </div>
                </div>
            </main>

            {/* Premier League Fixtures Section */}
            <section className="fixtures-section">
            <h2>Premier League Fixtures</h2>

            {/* Container for side-by-side layout */}
            <div className="fixtures-container">
                {/* Recent Matches */}
                <div className="fixtures-column">
                    <h3>Recent Matches</h3>
                    {previousFixtures.length === 0 ? (
                        <p>Loading previous fixtures...</p>
                    ) : (
                        <ul className="fixtures-list">
                            {previousFixtures.slice(-10).map((match) => (
                                <li key={match.id}>
                                    {formatDate(match.kickoff_time)} - {getTeamName(match.team_h)} {match.team_h_score} : {match.team_a_score} {getTeamName(match.team_a)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Upcoming Matches */}
                <div className="fixtures-column">
                    <h3>Upcoming Matches</h3>
                    {fixtures.length === 0 ? (
                        <p>Loading fixtures...</p>
                    ) : (
                        <ul className="fixtures-list">
                            {fixtures.slice(0, visibleCount).map((match) => (
                                <li key={match.id}>
                                    {formatDate(match.kickoff_time)} - {getTeamName(match.team_a)} vs {getTeamName(match.team_h)}
                                </li>
                            ))}
                        </ul>
                    )}
                    {fixtures.length > visibleCount && (
                        <button onClick={() => setVisibleCount(visibleCount + 10)}>Load More</button>
                    )}
                    {fixtures.length > visibleCount && (
                        <button onClick={() => setVisibleCount(visibleCount - 10)}>Load Less</button>
                    )}
                    
                </div>
            </div>
        </section>
            <div>
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
                        .sort((a, b) => b.goals_scored - a.goals_scored) // Sort by goals scored (highest first)
                        .slice(0, 5) // Take top 5 players
                        .map(player => (
                            <tr key={player.id} onClick={() => setSelectedPlayer(player)}>
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
            <header className="news-header">
            <h1>Latest News</h1>
            </header>
            <div className="news-articles">
                {newsArticles.length === 0 ? (
                    <p>No news articles available.</p>
                ) : (
                    newsArticles.map((article) => (
                    <div key={article.id} className="news-article">
                        {article.image && (
                        <img
                            src={`http://127.0.0.1:8000${article.image}`}
                            alt={article.title}
                        />
                        )}
                        <h2>{article.title}</h2>
                    </div>
                    ))
                )}
                </div>


        </div>
    );
}
const styles = {
    grid: {
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: "30px",
    },
    card: {
      width: "250px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      textAlign: "center",
    },
    image: {
      width: "100%",
      height: "150px",
      objectFit: "cover",
    },
    title: {
      padding: "10px",
      fontSize: "1rem",
      fontWeight: "bold",
    },
  };
  

export default Home;




