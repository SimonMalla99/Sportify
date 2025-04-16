import React, { useEffect, useState, useContext } from "react";
// import "../styles/PredictionForm.css"; // Optional styling
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/Prediction.css";





function TeamPredictionForm() {
    const [userId, setUserId] = useState(null);
    const [gameweek, setGameweek] = useState(1);
    const [forwardGoals, setForwardGoals] = useState(0);
    const [midfielderGoals, setMidfielderGoals] = useState(0);
    const [defenderCleanSheets, setDefenderCleanSheets] = useState(0);
    const [goalkeeperCleanSheets, setGoalkeeperCleanSheets] = useState(0);
    const [totalAssists, setTotalAssists] = useState(0);
    const [message, setMessage] = useState("");
    const [evaluationMessage, setEvaluationMessage] = useState("");
    const { user } = useContext(AuthContext);
    const toggleMenu = () => setShowMenu(!showMenu);
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () =>{
        navigate("/logout");
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserId(parsed.id);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            user_id: userId,
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("✅ Prediction submitted successfully!");
            } else {
                setMessage(data.error || "❌ Something went wrong");
            }
        } catch (error) {
            setMessage("❌ Error submitting prediction");
            console.error("Prediction submission error:", error);
        }
    };

    const handleEvaluate = async () => {
        const payload = {
            user_id: userId,
            gameweek,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/evaluate-prediction/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setEvaluationMessage("✅ Prediction evaluated successfully!");
            } else {
                setEvaluationMessage(data.error || "❌ Evaluation failed");
            }
        } catch (error) {
            setEvaluationMessage("❌ Error evaluating prediction");
            console.error("Evaluation error:", error);
        }
    };

    return (
        
        <div className="prediction-form-container">
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
            <h2>Submit Gameweek Prediction</h2>
            <form onSubmit={handleSubmit}>
                <label>Gameweek:
                    <input
                        type="number"
                        value={gameweek}
                        onChange={(e) => setGameweek(parseInt(e.target.value))}
                        required
                    />
                </label>
                <label>Forward Goals:
                    <input
                        type="number"
                        value={forwardGoals}
                        onChange={(e) => setForwardGoals(parseInt(e.target.value))}
                    />
                </label>
                <label>Midfielder Goals:
                    <input
                        type="number"
                        value={midfielderGoals}
                        onChange={(e) => setMidfielderGoals(parseInt(e.target.value))}
                    />
                </label>
                <label>Defender Clean Sheets:
                    <input
                        type="number"
                        value={defenderCleanSheets}
                        onChange={(e) => setDefenderCleanSheets(parseInt(e.target.value))}
                    />
                </label>
                <label>Goalkeeper Clean Sheets:
                    <input
                        type="number"
                        value={goalkeeperCleanSheets}
                        onChange={(e) => setGoalkeeperCleanSheets(parseInt(e.target.value))}
                    />
                </label>
                <label>Total Assists:
                    <input
                        type="number"
                        value={totalAssists}
                        onChange={(e) => setTotalAssists(parseInt(e.target.value))}
                    />
                </label>
                <button type="submit">Submit Prediction</button>
            </form>
            {message && <p className="submission-message">{message}</p>}

            <hr />
            <h3>Evaluate Prediction</h3>
            <button type="button" onClick={handleEvaluate}>
                Evaluate Prediction
            </button>
            {evaluationMessage && (
                <p className="submission-message">{evaluationMessage}</p>
            )}
        </div>
    );
}

export default TeamPredictionForm;
