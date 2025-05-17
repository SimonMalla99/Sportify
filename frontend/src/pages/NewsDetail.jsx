import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/News.css";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/news/${id}/`)
      .then((res) => {
        setArticle(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>News article not found.</p>;

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

      <div className="news-detail-container">
        <Link to="/news" className="back-link">← Back to News</Link>
        <h1 className="detail-title">{article.title}</h1>

        {/* Category Badge */}
        {article.category && (
          <div className="category-badge">
            {article.category}
          </div>
        )}

        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="detail-image"
          />
        )}

        <p className="detail-body">{article.body}</p>
      </div>
    </div>
  );
}

export default NewsDetail;
