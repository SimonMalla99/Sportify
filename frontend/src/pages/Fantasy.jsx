import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


function Fantasy() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [draftedPlayers, setDraftedPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredPlayers = players.filter(player =>
        `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    if (!user) return null;

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            <div>
                <h1>Welcome to Fantasy Football, {user.username}!</h1>
                <h2>Draft Your Players</h2>
                
                <input 
                    type="text" 
                    placeholder="Search for a player..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
                />
                
                <table border="1">
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
                        .map(player => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Drafted Players Section */}
            <div>
                <h2>Your Drafted Players</h2>
                {draftedPlayers.length === 0 ? (
                    <p>No players drafted yet.</p>
                ) : (
                    <ul>
                        {draftedPlayers.map(player => (
                            <li key={player.id}>
                                {player.first_name} {player.second_name} - {player.team} ({player.position}) 
                                <button 
                                    onClick={() => removePlayer(player.id)} 
                                    style={{ marginLeft: "10px", color: "white", background: "red", border: "none", padding: "5px", cursor: "pointer" }}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {draftedPlayers.length === 11 && (
                    <button 
                        onClick={confirmDraft}
                        style={{
                            backgroundColor: "green",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            cursor: "pointer",
                            marginTop: "10px"
                        }}
                    >
                        Confirm Team
                    </button>
                )}
            </div>
        </div>
    );
}

export default Fantasy;
