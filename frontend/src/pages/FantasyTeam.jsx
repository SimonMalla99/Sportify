import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

function FantasyTeam() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [team, setTeam] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [playerStats, setPlayerStats] = useState(null);
    const [allPlayers, setAllPlayers] = useState([]);

    const toggleMenu = () => setShowMenu(!showMenu);
    
    const handleLogout = () => {
        navigate("/logout");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }

        const userData = JSON.parse(storedUser);

        // Fetch fantasy team
        fetch(`http://127.0.0.1:8000/api/user-team/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => setTeam(data))
            .catch(err => console.error("Error fetching team:", err));

        // Fetch all player stats from your backend
        fetch("http://127.0.0.1:8000/api/fpl-players/")
            .then(res => res.json())
            .then(data => setAllPlayers(data))
            .catch(err => console.error("Error fetching player stats:", err));
    }, [navigate]);

    const handleShowStats = (playerName) => {
        // Match by full name
        const player = allPlayers.find(
            p => `${p.first_name} ${p.second_name}` === playerName
        );
        if (player) {
            setPlayerStats(player);
        } else {
            setPlayerStats(null);
            alert("No stats found for this player.");
        }
    };

    return (
        <div className="home-container">
            <>
                <header className="home-header">
                    <div className="logo">Sportify</div>
                    <nav className="nav-bar">
                        <Link to="/">Home Page</Link>
                        <Link to="/fantasy-team">Fantasy</Link>
                        <Link to="/News">Sports News</Link>
                        <Link to="/predictions">Predictions</Link>
                        <Link to="#">About</Link>
                        <Link to="#">Contact</Link>
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

                <h1>Your Fantasy Team {user.username}</h1>

                {team.length === 0 ? (
                    <p>You haven't drafted a team yet.</p>
                ) : (
                    <table border="1">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Position</th>
                                <th>Stats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...team]
                                .sort((a, b) => {
                                    const order = { "Forward": 1, "Midfielder": 2, "Defender": 3, "Goalkeeper": 4 };
                                    return order[a.position] - order[b.position];
                                })
                                .map((player, index) => (
                                <tr key={index}>
                                    <td>{player.first_name} {player.second_name}</td>
                                    <td>{player.team}</td>
                                    <td>{player.position}</td>
                                    <td>
                                        <button onClick={() => handleShowStats(`${player.first_name} ${player.second_name}`)}>
                                            Show Stats
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {playerStats && (
                    <div className="player-details" style={{ marginTop: "20px", border: "1px solid #ccc", padding: "10px" }}>
                        <h2>{playerStats.first_name} {playerStats.second_name}</h2>
                        <p><strong>Team:</strong> {playerStats.team}</p>
                        <p><strong>Position:</strong> {playerStats.position}</p>
                        <p><strong>Goals Scored:</strong> {playerStats.goals_scored}</p>
                        <p><strong>Assists:</strong> {playerStats.assists}</p>
                        <p><strong>Total Points:</strong> {playerStats.total_points}</p>
                    </div>
                )}
            </>
        </div>
    );
}

export default FantasyTeam;
