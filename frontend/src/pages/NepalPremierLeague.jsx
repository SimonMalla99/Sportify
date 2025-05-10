import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/npl.css";

const NepalPremierLeague = () => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [standings, setStandings] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

    const handleLogout = () => {
        navigate("/logout");
    };


  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/npl-teams/")
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("❌ Error fetching teams:", err));

    fetch("http://127.0.0.1:8000/api/npl-matches/")
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error("❌ Error fetching matches:", err));

    fetch("http://127.0.0.1:8000/api/npl-seasons/")
      .then(res => res.json())
      .then(data => setSeasons(data))
      .catch(err => console.error("❌ Error fetching seasons:", err));

      fetch("http://127.0.0.1:8000/api/npl-standings/")
      .then(res => res.json())
      .then(data => setStandings(data))
      .catch(err => console.error("❌ Error fetching standings:", err));
  }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
            return;
        }

        const userData = JSON.parse(storedUser);

    }, [navigate]);

  return (
    <div className="npl-container">
        <header className="npl-header">
                    <div className="npl-logo">Sportify</div>
                    <nav className="npl-nav">
                        <Link to="/">Home Page</Link>
                        <Link to="/fantasy-team">Fantasy</Link>
                        <Link to="/News">Sports News</Link>
                        <Link to="/team-prediction-form">Predictions</Link>
                        <Link to="/npl">NPL</Link>
                        <Link to="/leaderboard">Leaderboards</Link>
                        {user && (
                            <div className="account-container">
                            <FaUserCircle
                                size={24}
                                onClick={toggleMenu}
                                style={{ cursor: "pointer" }}
                            />
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
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">National Leagues</h1>
      

      {/* Final Standings Section */}
        <section>
        <h2 className="text-xl font-bold mb-4">Nepal Premier League</h2>
        <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-gray-100 text-left">
                <th className="border p-2">Rank</th>
                <th className="border p-2">Team</th>
                <th className="border p-2">Played</th>
                <th className="border p-2">Won</th>
                <th className="border p-2">Lost</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(standings) && standings.map((team, idx) => (
                <tr key={idx} className="text-sm">
                    <td className="border p-2">{team.rank}</td>
                    <td className="border p-2">{team.team_name}</td>
                    <td className="border p-2">{team.matches_played}</td>
                    <td className="border p-2">{team.matches_won}</td>
                    <td className="border p-2">{team.matches_lost}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        </section>
        {/* SofaScore Standings Embed */}
        <div className="sofascore-wrapper">
        <div className="sofascore-embed">
          <h2 className="text-xl font-bold mb-4 text-center">Nepal Super League</h2>
          <iframe
            id="sofa-standings-embed-147271-72852"
            src="https://widgets.sofascore.com/embed/tournament/147271/season/72852/standings/Nepal%20Super%20League%202025?widgetTitle=Nepal%20Super%20League%202025&showCompetitionLogo=true"
            style={{
              height: "603px",
              maxWidth: "768px",
              width: "100%",
              border: "none",
            }}
            scrolling="no"
            title="SofaScore NSL Standings"
          ></iframe>
        </div>
</div>


    </div></div>
  );
};

export default NepalPremierLeague;
