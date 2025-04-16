// src/components/News.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/News.css";
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
  const { user } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);

  const goToFantasy = () => {
    if (user) {
      navigate("/fantasy");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
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
  if (error) return <p>Error loading news articles: {error.message || "Unknown error"}</p>;

  return (
    <div className="news-container">
      <header className="news-top-header">
        <div className="logo">Sportify</div>
        <nav className="nav-bar">
          <Link to="/">Home Page</Link>
          <Link to="/fantasy-team">Fantasy</Link>
          <Link to="/News">Sports News</Link>
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

      <header className="news-header">
        <h1>Latest News</h1>
      </header>

      <div className="news-articles">
        {newsArticles.length === 0 ? (
          <p>No news articles available.</p>
        ) : (
          newsArticles.map((article) => (
            <Link to={`/news/${article.id}`} className="news-card-link" key={article.id}>
              <div className="news-article">
                {article.image && (
                  <img
                    src={`http://127.0.0.1:8000${article.image}`}
                    alt={article.title}
                  />
                )}
                <h2>{article.title}</h2>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default News;
