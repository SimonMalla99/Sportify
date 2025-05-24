import { useContext, useEffect, useState } from "react";
import "../styles/Fantasy.css";
import "../styles/Home.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";



function Fantasy() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [draftedPlayers, setDraftedPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(null);
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
    const { profilePic } = useContext(AuthContext);
    const [topUsers, setTopUsers] = useState([]);

    const handleLogout = () =>{
        navigate("/logout");
   };
    

    const POSITION_LIMITS = {
        "Forward": 3,  
        "Midfielder": 3,  
        "Defender": 4,  
        "Goalkeeper": 1  
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
        }
    }, [user, navigate]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/fpl-players/")
            .then(response => response.json())
            .then(data => setPlayers(data))
            .catch(error => console.error("Error fetching players:", error));
    }, []);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
        } else {
            const userData = JSON.parse(storedUser);
            fetch(`http://127.0.0.1:8000/api/has-team/?user_id=${userData.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.has_team) {
                        navigate("/fantasy-team");
                    }
                })
                .catch(err => console.error("Error checking team:", err));
        }
    }, [user, navigate]);
    const confirmDraft = () => {
        if (draftedPlayers.length !== 11) {
            alert("You must select exactly 11 players before confirming!");
            return;
        }
    
        const draftedData = draftedPlayers.map(player => ({
            player_id: player.id,
            user_id: user.id,  
            position: player.position
        }));
    
        fetch("http://127.0.0.1:8000/api/save-draft/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ drafted_players: draftedData })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || "Draft successfully saved!");
            navigate("/fantasy-team");
        })
        .catch(error => console.error("Error saving draft:", error));
        
    };

    const getPositionCount = (position) => 
        draftedPlayers.filter(player => player.position === position).length;

    const draftPlayer = (player) => {
        if (draftedPlayers.length >= 11) {
            alert("You can only draft 11 players!");
            return;
        }

        const positionCount = getPositionCount(player.position);

        if (positionCount >= (POSITION_LIMITS[player.position] || 0)) {
            alert(`You can only draft ${POSITION_LIMITS[player.position]} ${player.position}(s)!`);
            return;
        }

        if (!draftedPlayers.some(p => p.id === player.id)) {
            setDraftedPlayers([...draftedPlayers, player]);
        }
    };

    // Function to remove player from draft
    const removePlayer = (playerId) => {
        setDraftedPlayers(draftedPlayers.filter(player => player.id !== playerId));
    };

    const filteredPlayers = players.filter(player => {
        const matchesSearch = `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter ? player.position === activeFilter : true;
        return matchesSearch && matchesFilter;
    });
    
    

    if (!user) return null;

    return (
        <div className="fantasy-container">
            <>
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
    
                {/* MAIN FLEX CONTAINER */}
                <div className="fantasy-main">
                    {/* LEFT: Player Table */}
                    <div className="fantasy-left">
                        <h1>Welcome to Fantasy Football, {user.username}!</h1>
                        <h2>Draft Your Players</h2>
    
                        <div className="fantasy-filters">
                            <input 
                                type="text" 
                                placeholder="Search for a player..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="fantasy-search"
                            />

                            <div className="position-filters">
                                {["Forward", "Midfielder", "Defender", "Goalkeeper"].map(pos => (
                                    <button 
                                        key={pos}
                                        className={`filter-btn ${activeFilter === pos ? "active" : ""}`}
                                        onClick={() => setActiveFilter(activeFilter === pos ? null : pos)}
                                    >
                                        {pos} {activeFilter === pos && <span className="close-x"></span>}
                                    </button>
                                ))}
                            </div>
                        </div>

    
                        <table className="fantasy-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Team</th>
                                    <th>Position</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlayers
                                .sort((a, b) => b.goals_scored - a.goals_scored)
                                .map(player => {
                                    console.log(player.id, player.first_name, player.second_name);
                                    return (
                                        <tr key={player.id}>
                                            <td>{player.first_name} {player.second_name}</td>
                                            <td>{player.team}</td>
                                            <td>{player.position}</td>
                                            <td>
                                                <button 
                                                    onClick={() => draftPlayer(player)} 
                                                    disabled={
                                                        draftedPlayers.length >= 11 || 
                                                        draftedPlayers.some(p => p.id === player.id) || 
                                                        getPositionCount(player.position) >= (POSITION_LIMITS[player.position] || 0)
                                                    }
                                                >
                                                    Draft
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
    
                    {/* RIGHT: Drafted Players */}
                    <div className="fantasy-right">
                        <div className="field-wrapper">
                            <img src="/feild2.png" alt="Soccer Field" className="soccer-field" />

                            {/* Players will be positioned based on their roles */}
                            {draftedPlayers.map((player, index) => {
                            let posClass = "";
                            const posCount = draftedPlayers.filter(p => p.position === player.position)
                                                            .slice(0, POSITION_LIMITS[player.position]);

                            const indexInPosition = posCount.findIndex(p => p.id === player.id) + 1;

                            if (player.position === "Goalkeeper") posClass = "position-gk";
                            else if (player.position === "Defender") posClass = `position-d${indexInPosition}`;
                            else if (player.position === "Midfielder") posClass = `position-m${indexInPosition}`;
                            else if (player.position === "Forward") posClass = `position-f${indexInPosition}`;

                            return (
                                <div key={player.id} className={`player-container ${posClass}`}>
                                    <div className="player-label">
                                        {player.first_name.charAt(0)}. {player.second_name.split(" ").slice(-1)[0]}
                                    </div>
                                    <button 
                                        onClick={() => removePlayer(player.id)} 
                                        className="remove-btn"
                                    >
                                        X
                                    </button>
                                </div>


                            );
                            })}
                        </div>

                        {draftedPlayers.length === 11 && (
                            <button onClick={confirmDraft} className="confirm-btn">
                            Confirm Team
                            </button>
                        )}
                        </div>

                </div>
            </>
        </div>
    );
    
    
}

export default Fantasy;
