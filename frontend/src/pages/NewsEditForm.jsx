import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/NewsAdmin.css";

function NewsEditForm() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    "Football",
    "Basketball",
    "Cricket",
    "Swimming",
    "Table Tennis",
    "Badminton",
    "Volleyball",
    "Track and Field",
    "Other",
  ];

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/news/${articleId}/`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setBody(data.body);
        setSelectedCategory(data.category);
        setExistingImage(data.image);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load article:", err);
        navigate("/news-edit");
      });
  }, [articleId, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("category", selectedCategory);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/news/${articleId}/`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update news");

      alert("News updated successfully!");
      navigate("/news-edit");
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating news.");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this article?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/news/${articleId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      alert("Article deleted.");
      navigate("/news-edit");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting article.");
    }
  };

  if (loading) return <p>Loading article...</p>;

  return (
    <div className="newsadmin-container">
      <h2 className="newsadmin-title">Edit News Article</h2>
      <form onSubmit={handleUpdate} className="newsadmin-form" encType="multipart/form-data">
        <div>
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label>Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>

        <div>
          <label>Category</label>
          <div className="category-tags">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tag ${selectedCategory === cat ? "selected" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label>Current Image</label><br />
          {existingImage ? (
            <img src={`http://127.0.0.1:8000${existingImage}`} alt="Current" width="150" />
          ) : (
            <p>No image uploaded.</p>
          )}
        </div>

        <div>
          <label>New Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={{ marginRight: "1rem" }}>Update</button>
          <button type="button" onClick={handleDelete} style={{ backgroundColor: "crimson", color: "white" }}>Delete</button>
        </div>
      </form>
    </div>
  );
}

export default NewsEditForm;
