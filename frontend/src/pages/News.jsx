// src/components/News.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css"; // Optional: Your CSS for styling the news page
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";


function News() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);  // Get logged-in user state
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  const goToFantasy = () => {
    if (user) {
        navigate("/fantasy");  // Redirect to fantasy if user is logged in
    } else {
        navigate("/login");  // Otherwise, redirect to login
    }
  };
  const handleLogout = () =>{
     navigate("/logout");
  };

  useEffect(() => {
    // Fetch news articles from your Django backend
    axios
      .get("http://127.0.0.1:8000/api/news/")
      .then((response) => {
        setNewsArticles(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching news articles:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading news articles...</p>;
  if (error)
    return <p>Error loading news articles: {error.message || "Unknown error"}</p>;

  return (
    <div className="home-container">
      <header className="home-header">
                      <div className="logo">Sportify</div>
                      <nav className="nav-bar">
                          <Link to="/">Home Page</Link>
                          <Link to="/fantasy-team">Fantasy</Link>
                          <Link to="/News">Sports News</Link>
                          <Link to="#">About</Link>
                          <Link to="#">Contact</Link>
                          <button className="btn join-btn" onClick={goToFantasy}>Join</button>
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
      <header className="news-header">
        <h1>Latest News</h1>
        
      </header>
      <div className="news-articles">
        {newsArticles.length === 0 ? (
          <p>No news articles available.</p>
        ) : (
          newsArticles.map((article) => (
            <div key={article.id} className="news-article" style={{ marginBottom: "2rem" }}>
              <h2>{article.title}</h2>
              
              {article.image && (
                <img
                src={`http://127.0.0.1:8000${article.image}`}
                alt={article.title}
                style={{ maxWidth: "100%", height: "auto", marginTop: "1rem" }}
              />
              )}
              <p>{article.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default News;
