import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css"; // Add the styles here

function Home() {
    const [fixtures, setFixtures] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/fpl-fixtures/") // Adjust the API endpoint if necessary
            .then(response => response.json())
            .then(data => {
                const now = new Date(); // Get current time
    
                const upcomingFixtures = data.filter(fixture => {
                    const matchDate = new Date(fixture.kickoff_time);
                    return matchDate > now; // Only keep future fixtures
                });
    
                setFixtures(upcomingFixtures);
            })
            .catch(error => console.error("Error fetching fixtures:", error));
    }, []);

    // Function to format date and time
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    // Function to get team names (replace with real team data if available)
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
            // Add more team IDs as needed
        };
        return teams[teamId] || `Team ${teamId}`;
    };

    return (
        <div className="home-container">
            {/* Header with Logo and Navigation */}
            <header className="home-header">
                <div className="logo">Sportify</div>
                <nav className="nav-bar">
                    <a href="#">Home Page</a>
                    <a href="#">Fixtures</a>
                    <a href="#">Sports News</a>
                    <a href="#">About</a>
                    <a href="#">Contact</a>
                    <button className="btn join-btn">Join</button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="hero">
                <div className="hero-text">
                    <h1>Unleash Your Fantasy Football Passion with Sportify</h1>
                    <p>Explore the world of fantasy football and sports news in Nepal. Join us today!</p>
                    <div className="hero-buttons">
                        <button className="btn primary-btn">Join</button>
                        <button className="btn secondary-btn">Learn More</button>
                    </div>
                </div>
            </main>

            {/* Premier League Fixtures Section */}
            <section className="fixtures-section">
                <h2>Premier League Fixtures</h2>
                {fixtures.length === 0 ? (
                    <p>Loading fixtures...</p>
                ) : (
                    <ul className="fixtures-list">
                        {fixtures.map((match) => (
                            <li key={match.id}>
                                {formatDate(match.kickoff_time)} - {getTeamName(match.team_a)} vs {getTeamName(match.team_h)}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Home;
