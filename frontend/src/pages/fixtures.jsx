import React, { useState, useEffect } from "react";
import { getFPLData } from "../api"; // Import the API function
import "../styles/Home.css"; // Add the styles here

function Fixtures() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getFPLData();
            setData(response);
        };

        fetchData();
    }, []);

    return (
        <div className="home-container">
            {/* Header with Logo and Navigation */}
            <header className="home-header">
                <div className="logo">Sportify</div>
                <nav className="nav-bar">
                    <a href="#">Home Page</a>
                    <a href="#">Fantasy League</a>
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

            {/* Display API Data */}
            <section className="data-section">
                <h2>Fantasy Premier League Data</h2>
                {data ? (
                    <pre>{JSON.stringify(data, null, 2)}</pre> // Pretty print JSON data
                ) : (
                    <p>Loading FPL data...</p>
                )}
            </section>
        </div>
    );
}

export default Home;
