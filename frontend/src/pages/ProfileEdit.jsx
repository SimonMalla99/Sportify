import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import { toast } from "react-toastify";

const ProfileEdit = () => {
  const { user, getAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    username: "",
    dob: "",
    phone_number: "",
    bio: "",
    favourite_sports: [],
    profile_picture: null,
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "", 
  });


  const availableSports = [
    "Football", "Basketball", "Cricket", "Swimming",
    "Table Tennis", "Badminton", "Volleyball", "Track and Field"
  ];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/get-profile/?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setProfileData({
          username: user.username,
          dob: data.dob,
          phone_number: data.phone_number,
          bio: data.bio,
          favourite_sports: data.favourite_sports || [],
          profile_picture: null,
        });
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProfileData((prev) => ({ ...prev, profile_picture: e.target.files[0] }));
  };

  const handleSportToggle = (sport) => {
    setProfileData((prev) => ({
      ...prev,
      favourite_sports: prev.favourite_sports.includes(sport)
        ? prev.favourite_sports.filter(s => s !== sport)
        : [...prev.favourite_sports, sport],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAccessToken();

    const formData = new FormData();
    formData.append("username", profileData.username);
    formData.append("dob", profileData.dob);
    formData.append("phone_number", profileData.phone_number);
    formData.append("bio", profileData.bio);
    formData.append("favourite_sports", JSON.stringify(profileData.favourite_sports));
    if (profileData.profile_picture) {
      formData.append("profile_picture", profileData.profile_picture);
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/update-profile/?user_id=${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update profile");

      // 👇 Attempt password change if fields are filled
      if (passwords.old_password || passwords.new_password || passwords.confirm_password) {
        if (!passwords.old_password || !passwords.new_password || !passwords.confirm_password) {
          toast.error("Please fill all password fields to change password.");
          return;
        }

        if (passwords.new_password !== passwords.confirm_password) {
          toast.error("New passwords do not match.");
          return;
        }

        const passwordResponse = await fetch(`http://127.0.0.1:8000/api/change-password/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: passwords.old_password,
            new_password: passwords.new_password,
          }),
        });

        const passwordData = await passwordResponse.json();
        if (!passwordResponse.ok) throw new Error(passwordData.detail || "Password change failed");
        toast.success("Password changed successfully!");
      }


      toast.success("Profile updated successfully!");
      navigate("/account");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error updating profile.");
    }
  };

  return (
    <div className="profileedit-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="profileedit-form" encType="multipart/form-data">
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={profileData.username}
          onChange={handleChange}
          required
        />

        <label>Date of Birth:</label>
        <input
          type="date"
          name="dob"
          value={profileData.dob}
          onChange={handleChange}
          required
        />

        <label>Phone Number:</label>
        <input
          type="tel"
          name="phone_number"
          value={profileData.phone_number}
          onChange={handleChange}
          pattern="[0-9]{10}"
          required
        />

        <label>Bio:</label>
        <textarea
          name="bio"
          value={profileData.bio}
          onChange={handleChange}
        ></textarea>

        <label>Favourite Sports:</label>
        <div className="sport-tags">
          {availableSports.map((sport) => (
            <button
              key={sport}
              type="button"
              className={`sport-tag ${profileData.favourite_sports.includes(sport) ? "selected" : ""}`}
              onClick={() => handleSportToggle(sport)}
            >
              {sport}
            </button>
          ))}
        </div>

        <label>Profile Picture:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {/* 🔒 Password Change Section */}
        <hr />
        <h4>Change Password (optional)</h4>

        <label>Old Password:</label>
        <input
          type="password"
          name="old_password"
          value={passwords.old_password}
          onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
        />

        <label>New Password:</label>
        <input
          type="password"
          name="new_password"
          value={passwords.new_password}
          onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
        />
        <label>Retype New Password:</label>
        <input
          type="password"
          name="confirm_password"
          value={passwords.confirm_password}
          onChange={(e) =>
            setPasswords({ ...passwords, confirm_password: e.target.value })
          }
        />

        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfileEdit;
