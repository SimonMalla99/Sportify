import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/FantasyTeam.css";
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
    const [customStats, setCustomStats] = useState([]);

    const toggleMenu = () => setShowMenu(!showMenu);

    const handleLogout = () => {
        navigate("/logout");
    };

    const positionedTeam = [];
    const tracker = {
        "Goalkeeper": 0,
        "Defender": 0,
        "Midfielder": 0,
        "Forward": 0
    };
    team.forEach(player => {
        tracker[player.position] += 1;
        positionedTeam.push({
            ...player,
            indexInPosition: tracker[player.position]
        });
    });

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

        // Fetch custom points from your DB
        fetch(`http://127.0.0.1:8000/api/custom-points/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => setCustomStats(data))
            .catch(err => console.error("Error fetching custom points:", err));
    }, [navigate]);

    const handleShowStats = (playerId) => {
        const player = team.find(p => p.id === playerId);
        if (player) {
            const match_history = customStats.filter(match => match.player_id === playerId);
            setPlayerStats({ ...player, match_history });
        }
    };
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
    
    

    return (
        <div className="fantasyteam-container">
            <>
                <header className="fantasyteam-header">
                    <div className="fantasyteam-logo">Sportify</div>
                    <nav className="fantasyteam-nav">
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

                {team.length > 0 && (
                    <div className="field-wrapper">
                        <img src="/feild2.png" alt="Soccer Field" className="soccer-field" />
                        {positionedTeam.map((player) => {
                            let posClass = "";
                            if (player.position === "Goalkeeper") posClass = "position-gk";
                            else if (player.position === "Defender") posClass = `position-d${player.indexInPosition}`;
                            else if (player.position === "Midfielder") posClass = `position-m${player.indexInPosition}`;
                            else if (player.position === "Forward") posClass = `position-f${player.indexInPosition}`;

                            return (
                                <div
                                    key={`${player.id}-${player.indexInPosition}`}
                                    className={`player-container ${posClass}`}
                                >
                                    <div className="player-label">
                                        {player.first_name} {player.second_name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {team.length === 0 ? (
                    <p>You haven't drafted a team yet.</p>
                ) : (
                    <table className="fantasyteam-table">
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
                                            <button onClick={() => handleShowStats(player.id)}>
                                                Show Stats
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}

                {playerStats && (
                    <div className="player-details">
                        <h2>{playerStats.first_name} {playerStats.second_name}</h2>
                        <p><strong>Team:</strong> {playerStats.team}</p>
                        <p><strong>Position:</strong> {playerStats.position}</p>

                        {console.log("Selected Player Stats:", playerStats)}

                        {playerStats.match_history && playerStats.match_history.length > 0 && (
                            <div>
                                <h3>Match-by-Match Stats</h3>
                                <table className="match-history-table">
                                    <thead>
                                        <tr>
                                            <th>Fixture ID</th>
                                            <th>Opponent</th>
                                            <th>Minutes</th>
                                            <th>Goals</th>
                                            <th>Assists</th>
                                            <th>Yellow</th>
                                            <th>Red</th>
                                            <th>Saves</th>
                                            <th>Clean Sheets</th>
                                            <th>Custom Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {playerStats.match_history.map((match, i) => (
                                            <tr key={i}>
                                                <td>{match.fixture_id}</td>
                                                <td>{getTeamName(match.opponent_team)}</td>
                                                <td>{match.minutes}</td>
                                                <td>{match.goals_scored}</td>
                                                <td>{match.assists}</td>
                                                <td>{match.yellow_cards}</td>
                                                <td>{match.red_cards}</td>
                                                <td>{match.saves}</td>
                                                <td>{String(match.clean_sheets)}</td>
                                                <td>{match.total_points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </>
        </div>
    );
}

export default FantasyTeam;
