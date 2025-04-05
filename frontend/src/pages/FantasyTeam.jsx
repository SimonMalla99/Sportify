import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function FantasyTeam() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [team, setTeam] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }

        const userData = JSON.parse(storedUser);

        fetch(`http://127.0.0.1:8000/api/user-team/?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => setTeam(data))
            .catch(err => console.error("Error fetching team:", err));
    }, [navigate]);

    return (
        <div>
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
                        </tr>
                    </thead>
                    <tbody>
                        {team.map((player, index) => (
                            <tr key={index}>
                                <td>{player.first_name} {player.second_name}</td>
                                <td>{player.team}</td>
                                <td>{player.position}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FantasyTeam;
