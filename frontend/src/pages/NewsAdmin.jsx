import React, { useEffect, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import "../styles/home.css"; // adjust path based on your structure

function NewsAdmin() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu(!showMenu);
  const handleLogout = () => navigate("/logout");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("User not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) {
      formData.append("image", image);
    }
    formData.append("user_id", user.id);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/news/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      alert("News submitted successfully!");
      navigate("/news");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting news.");
    }
  };

  return (
    
    <div className="newsadmin-container">
      <header className="home-header">
                <div className="logo">Sportify Admin</div>
                <nav className="nav-bar">
                    <Link to="/admin-dashboard">Home Page</Link>
                    <Link to="/fantasy-team">Fantasy</Link>
                    <Link to="/news-admin">Sports News</Link>
                    <Link to="#">About</Link>
                    <Link to="#">Contact</Link>

                    <div className="account-container">
                        <FaUserCircle size={24} onClick={toggleMenu} style={{ cursor: "pointer" }} />
                        {showMenu && (
                            <div className="account-dropdown">
                                <p>👤 {user.username}</p>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
      <h2 className="newsadmin-title">Create News Article</h2>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="newsadmin-form"
      >
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Submit News</button>
      </form>
    </div>
  );
}

export default NewsAdmin;
