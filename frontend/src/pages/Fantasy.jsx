import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";

function Fantasy() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [draftedPlayers, setDraftedPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login"); // Redirect if no user is stored
        }
    }, [user, navigate]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/fpl-players/")
            .then(response => response.json())
            .then(data => setPlayers(data))
            .catch(error => console.error("Error fetching players:", error));
    }, []);

    const draftPlayer = (player) => {
        if (draftedPlayers.length >= 11) return;

        // Avoid adding duplicates
        if (!draftedPlayers.some(p => p.id === player.id)) {
            setDraftedPlayers([...draftedPlayers, player]);
        }
    };

    const filteredPlayers = players.filter(player =>
        `${player.first_name} ${player.second_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null; // Prevent rendering before user is available

    return (
        <div style={{ display: "flex", gap: "20px" }}>
            <div>
                <h1>Welcome to Fantasy Football, {user.username}!</h1>
                <h2>Draft Your Players</h2>
                
                {/* Search Bar */}
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
                                        disabled={draftedPlayers.length >= 11 || draftedPlayers.some(p => p.id === player.id)}
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Fantasy;