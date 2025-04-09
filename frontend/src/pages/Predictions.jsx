import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/Home.css";

function Predictions() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [team, setTeam] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [showMenu, setShowMenu] = useState(false);

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

        fetch(`http://127.0.0.1:8000/api/user-team/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => {
                setTeam(data);
                // Initialize the predictions state when the team is fetched
                const initialPredictions = data.reduce((acc, player) => {
                    acc[player.player_id] = { predicted_goals: "", predicted_assists: "" };
                    return acc;
                }, {});
                setPredictions(initialPredictions);
            })
            .catch(err => console.error("Error fetching team:", err));
    }, [navigate]);

    const handleInputChange = (playerId, field, value) => {
        setPredictions(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId], 
                [field]: value
            }
        }));
    };

    const handleSavePredictions = () => {
        const userId = user.id;
        const dataToSend = Object.entries(predictions).map(([playerId, pred]) => ({
            user_id: userId,
            player_id: parseInt(playerId),
            predicted_goals: parseInt(pred.predicted_goals) || 0,
            predicted_assists: parseInt(pred.predicted_assists) || 0,
        }));

        fetch("http://127.0.0.1:8000/api/save-predictions/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ predictions: dataToSend })
        })
        .then(response => response.json())
        .then(data => {
            alert("Predictions saved successfully!");
        })
        .catch(error => {
            console.error("Error saving predictions:", error);
            alert("Failed to save predictions.");
        });
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="logo">Sportify</div>
                <nav className="nav-bar">
                    <Link to="/">Home Page</Link>
                    <Link to="/fantasy-team">Fantasy</Link>
                    <Link to="/predictions">Predictions</Link>
                    <Link to="/news">Sports News</Link>
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

            <h1>Make Your Predictions</h1>

            {team.length === 0 ? (
                <p>You haven't drafted a team yet.</p>
            ) : (
                <table border="1">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Predicted Goals</th>
                            <th>Predicted Assists</th>
                        </tr>
                    </thead>
                    <tbody>
                        {team.map(player => (
                            <tr key={`${player.first_name}-${player.second_name}-${player.player_id}`}>
                                <td>{player.first_name} {player.second_name}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        value={predictions[player.player_id]?.predicted_goals || ""}
                                        onChange={(e) => handleInputChange(player.player_id, "predicted_goals", e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        value={predictions[player.player_id]?.predicted_assists || ""}
                                        onChange={(e) => handleInputChange(player.player_id, "predicted_assists", e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {team.length > 0 && (
                <button
                    onClick={handleSavePredictions}
                    style={{ marginTop: "20px", padding: "10px 20px", background: "green", color: "white", border: "none", cursor: "pointer" }}
                >
                    Save Predictions
                </button>
            )}
        </div>
    );
}

export default Predictions;
