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
    const [totalPoints, setTotalPoints] = useState(0);
    const [allPlayers, setAllPlayers] = useState([]);
    const [customStats, setCustomStats] = useState([]);
    const [teamPerformance, setTeamPerformance] = useState([]);
    const [showTeamPerformance, setShowTeamPerformance] = useState(false);
    const latestGameweek = teamPerformance.length > 0
    ? [...teamPerformance].sort((a, b) => b.gameweek - a.gameweek)[0]
    : null;
    const [showPointLog, setShowPointLog] = useState(false);
    const [pointLogs, setPointLogs] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [previousFixtures, setPreviousFixtures] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [players, setPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [newsArticles, setNewsArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { profilePic } = useContext(AuthContext);
    const [topUsers, setTopUsers] = useState([]);
    const [showPredictionModal, setShowPredictionModal] = useState(false);

    const [gameweek, setGameweek] = useState(1);
    const [forwardGoals, setForwardGoals] = useState(0);
    const [midfielderGoals, setMidfielderGoals] = useState(0);
    const [defenderCleanSheets, setDefenderCleanSheets] = useState(0);
    const [goalkeeperCleanSheets, setGoalkeeperCleanSheets] = useState(0);
    const [totalAssists, setTotalAssists] = useState(0);
    const [predictionMessage, setPredictionMessage] = useState("");
    const [evaluationMessage, setEvaluationMessage] = useState("");






    const toggleMenu = () => setShowMenu(!showMenu);

    const handleLogout = () => {
        navigate("/logout");
    };

    const [allPoints, setAllPoints] = useState(null);


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

        fetch(`http://127.0.0.1:8000/api/team-performance/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => setTeamPerformance(data.gameweek_results || []))
            .catch(err => console.error("Error fetching team performance:", err));

        fetch(`http://127.0.0.1:8000/api/team-performance/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => {
              setTeamPerformance(data.gameweek_results || []);
              setTotalPoints(data.allpoints || 0); // 👈 THIS grabs total correctly
            })
        fetch("http://127.0.0.1:8000/api/leaderboard/")
            .then(res => res.json())
            .then(data => {
              const me = data.find(u => u.username === userData.username);
              if (me) setAllPoints(me.allpoints);
            })
            .catch(err => console.error("Error fetching leaderboard:", err));
          
    
          
        
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

    const generatePointLogs = () => {
    if (showPointLog) {
        setShowPointLog(false);
        return;
    }

    const logs = [];

    team.forEach((player) => {
        const match_history = customStats
        .filter(match => match.player_id === player.id)
        .sort((a, b) => a.gameweek - b.gameweek);

        // Only include matches where points are greater than 0
        const relevantMatches = match_history.filter(match => match.total_points > 0);

        // If no matches earned any points, skip this player
        if (relevantMatches.length === 0) return;

        relevantMatches.forEach(match => {
        const actions = [];

        if (match.goals_scored) actions.push(`${match.goals_scored} goal${match.goals_scored > 1 ? 's' : ''}`);
        if (match.assists) actions.push(`${match.assists} assist${match.assists > 1 ? 's' : ''}`);
        if (match.minutes) actions.push(`${match.minutes} minutes played`);
        if (match.saves) actions.push(`${match.saves} save${match.saves > 1 ? 's' : ''}`);
        if (match.yellow_cards) actions.push(`${match.yellow_cards} yellow card${match.yellow_cards > 1 ? 's' : ''}`);
        if (match.red_cards) actions.push(`${match.red_cards} red card${match.red_cards > 1 ? 's' : ''}`);
        if (match.clean_sheets) actions.push(`a clean sheet`);

        const statText = actions.length ? ` with ${actions.join(", ")}` : "";
        logs.push({
            gameweek: match.gameweek,
            log: `${player.first_name} ${player.second_name} earned ${match.total_points} points${statText} in Gameweek ${match.gameweek}.`
        });
        });
    });

    logs.sort((a, b) => b.gameweek - a.gameweek);

    setPointLogs(logs);
    setShowPointLog(true);
    };

    const handleSubmitPrediction = async (e) => {
        e.preventDefault();

        const payload = {
            user_id: user.id,
            gameweek,
            predicted_forward_goals: forwardGoals,
            predicted_midfielder_goals: midfielderGoals,
            predicted_defender_clean_sheets: defenderCleanSheets,
            predicted_goalkeeper_clean_sheets: goalkeeperCleanSheets,
            predicted_total_assists: totalAssists,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/submit-prediction/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                setPredictionMessage("✅ Prediction submitted successfully!");
            } else {
                setPredictionMessage(data.error || "❌ Something went wrong");
            }
        } catch (error) {
            console.error("Prediction submission error:", error);
            setPredictionMessage("❌ Error submitting prediction");
        }
    };

    const handleEvaluatePrediction = async () => {
        const payload = {
            user_id: user.id,
            gameweek,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/evaluate-prediction/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.success) {
                setEvaluationMessage("✅ Prediction evaluated successfully!");
            } else {
                setEvaluationMessage(data.error || "❌ Evaluation failed");
            }
        } catch (error) {
            console.error("Evaluation error:", error);
            setEvaluationMessage("❌ Error evaluating prediction");
        }
    };



    

    return (
        <div className="fantasyteam-container">
            <>
                <header className="fantasyteam-header">
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
                                <p>👤 {user.username }</p>
                                <p><Link to="/account" >Account Overview</Link></p>
                                <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                            </div>

                        )}
                    </nav>
                </header>
    
                <div className="fantasyteam-header-row">
                <h1>Your Fantasy Team {user.username}</h1>
                <div className="top-right-buttons">
                <button onClick={generatePointLogs} className="top-action-button">
                    {showPointLog ? "Hide Points History" : "Show Points History"}
                </button>

                <button onClick={() => setShowTeamPerformance(!showTeamPerformance)} className="top-action-button">
                    {showTeamPerformance ? "Hide Team Performance" : "Show Team Performance"}
                </button>

                <button onClick={() => setShowPredictionModal(true)} className="top-action-button">
                    Make Your Predictions
                </button>
                </div>

                </div>


                {showPointLog && (
                <div className="pointlog-modal-overlay" onClick={() => setShowPointLog(false)}>
                    <div className="pointlog-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="pointlog-modal-header">
                        <h2>Points History</h2>
                        <button className="close-modal-btn" onClick={() => setShowPointLog(false)}>×</button>
                    </div>
                    <div className="points-history-card-grid">
                        {pointLogs.map((entry, idx) => (
                        <div className="points-history-card" key={idx}>
                            <div className="points-history-header">
                            <span className="gw-badge">GW {entry.gameweek}</span>
                            </div>
                            <p>{entry.log}</p>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                )}

    
                {team.length > 0 && (
                    <div className="team-layout-wrapper">
                        <div className="fantasyteam-table-container">
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
                                            <button onClick={() => {
                                            if (playerStats?.id === player.id) {
                                                setPlayerStats(null); // hide stats if already open
                                            } else {
                                                handleShowStats(player.id); // show new stats
                                            }
                                            }}>
                                            {playerStats?.id === player.id ? "Hide Stats" : "Show Stats"}
                                            </button>
                                        </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                        <div className="field-and-points-wrapper">    
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
                                            {player.first_name.charAt(0)}. {player.second_name.split(" ").slice(-1)[0]}
                                        </div>
                                    </div>
                                );
                                
                            })}
                            </div>   
                            <div className="points-summary-boxes">
                                {latestGameweek && (
                                <div className="latest-gw-box">
                                    <h3>GW {latestGameweek.gameweek} Points: {latestGameweek.total_points}</h3>
                                </div>
                                )}   
                            {allPoints !== null && (
                                    <div className="total-points-box">
                                    <h3>Total Points: {allPoints}</h3>
                                    </div>
                                )}      
                        </div>
                    </div>             </div>     
                )}

    
                {team.length === 0 && (
                    <p>You haven't drafted a team yet.</p>
                )}
    
                {teamPerformance.length > 0 && (
                <div className="team-performance">
                    <button
                    className="toggle-performance-button"
                    onClick={() => setShowTeamPerformance(!showTeamPerformance)}
                    >
                    {showTeamPerformance ? "Hide Team Performance" : "Show Team Performance"}
                    </button>

                    {showTeamPerformance && (
                    <div className="teamperformance-modal-overlay" onClick={() => setShowTeamPerformance(false)}>
                        <div className="teamperformance-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Team Performance</h2>
                            <button className="close-modal-btn" onClick={() => setShowTeamPerformance(false)}>×</button>
                        </div>
                        <table className="match-history-table">
                            <thead>
                            <tr>
                                <th>Gameweek</th>
                                <th>Total Points</th>
                                <th>Final Points</th>
                                <th>Total Goals</th>
                                <th>Total Assists</th>
                                <th>Saves</th>
                                <th>Yellow Cards</th>
                                <th>Red Cards</th>
                                <th>FWD Goals</th>
                                <th>MID Goals</th>
                                <th>DEF Clean Sheets</th>
                                <th>GK Clean Sheets</th>
                            </tr>
                            </thead>
                            <tbody>
                            {teamPerformance
                                .sort((a, b) => a.gameweek - b.gameweek)
                                .map((gw, index) => (
                                <tr key={index}>
                                    <td>{gw.gameweek}</td>
                                    <td>{gw.total_points}</td>
                                    <td>{gw.final_points}</td>
                                    <td>{gw.total_goals}</td>
                                    <td>{gw.total_assists}</td>
                                    <td>{gw.total_saves}</td>
                                    <td>{gw.total_yellow_cards}</td>
                                    <td>{gw.total_red_cards}</td>
                                    <td>{gw.forward_goals}</td>
                                    <td>{gw.midfielder_goals}</td>
                                    <td>{gw.defender_clean_sheets}</td>
                                    <td>{gw.goalkeeper_clean_sheets}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    )}
                </div>
                )}

    
                {playerStats && (
                <div className="playerstats-modal-overlay" onClick={() => setPlayerStats(null)}>
                    <div className="playerstats-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{playerStats.first_name} {playerStats.second_name}</h2>
                        <button className="close-modal-btn" onClick={() => setPlayerStats(null)}>×</button>
                    </div>
                    <p><strong>Team:</strong> {playerStats.team}</p>
                    <p><strong>Position:</strong> {playerStats.position}</p>

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
                </div>
                )}
                {showPredictionModal && (
                <div className="prediction-modal-overlay" onClick={() => setShowPredictionModal(false)}>
                    <div className="prediction-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Submit Prediction</h2>
                        <button className="close-modal-btn" onClick={() => setShowPredictionModal(false)}>×</button>
                    </div>
                    <form onSubmit={handleSubmitPrediction}>
                        <label>Gameweek:
                        <input type="number" value={gameweek} onChange={(e) => setGameweek(parseInt(e.target.value))} required />
                        </label>
                        <label>Forward Goals:
                        <input type="number" value={forwardGoals} onChange={(e) => setForwardGoals(parseInt(e.target.value))} />
                        </label>
                        <label>Midfielder Goals:
                        <input type="number" value={midfielderGoals} onChange={(e) => setMidfielderGoals(parseInt(e.target.value))} />
                        </label>
                        <label>Defender Clean Sheets:
                        <input type="number" value={defenderCleanSheets} onChange={(e) => setDefenderCleanSheets(parseInt(e.target.value))} />
                        </label>
                        <label>Goalkeeper Clean Sheets:
                        <input type="number" value={goalkeeperCleanSheets} onChange={(e) => setGoalkeeperCleanSheets(parseInt(e.target.value))} />
                        </label>
                        <label>Total Assists:
                        <input type="number" value={totalAssists} onChange={(e) => setTotalAssists(parseInt(e.target.value))} />
                        </label>
                        <button type="submit">Submit Prediction</button>
                    </form>

                    {predictionMessage && <p className="submission-message">{predictionMessage}</p>}

                    <hr />
                    <h3>Evaluate Prediction</h3>
                    <button type="button" onClick={handleEvaluatePrediction}>Evaluate</button>
                    {evaluationMessage && <p className="submission-message">{evaluationMessage}</p>}
                    </div>
                </div>
                )}

            </>
        </div>
    );
    
}

export default FantasyTeam;
