import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../styles/NewsAdmin.css";

function NewsEdit() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || !user?.is_superuser) {
      navigate("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/api/news/")
      .then((res) => res.json())
      .then((data) => setArticles(data))
      .catch((err) => {
        console.error("Failed to fetch news:", err);
        setError(err);
      });
  }, [navigate, user]);

  const goToEdit = (id) => {
    navigate(`/news-edit/${id}`);
  };

  if (error) return <p>Error loading news: {error.message}</p>;

  return (
    <div className="newsadmin-container">
      <header className="home-header">
        <div className="logo"><Link to="/admin-dashboard">Sportify Admin</Link></div>
      </header>

      <h2 className="newsadmin-title">Edit News Articles</h2>

      <table className="npl-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>
                {article.image ? (
                  <img
                    src={`http://127.0.0.1:8000${article.image}`}
                    alt={article.title}
                    style={{ width: "100px", height: "auto" }}
                  />
                ) : (
                  "No image"
                )}
              </td>
              <td>{article.title}</td>
              <td>
                <button onClick={() => goToEdit(article.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NewsEdit;
