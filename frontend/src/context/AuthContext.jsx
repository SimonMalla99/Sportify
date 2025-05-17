import { createContext, useEffect, useState } from "react";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // ✅ Load access token from storage
    const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
            localStorage.removeItem(ACCESS_TOKEN); // ✅ Clear tokens on logout
            localStorage.removeItem(REFRESH_TOKEN);
        }
    }, [user]);

    const login = (userData, accessToken, refreshToken) => {
        
        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    };

    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
    if (user) {
        fetch(`http://127.0.0.1:8000/api/get-profile/?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.profile_picture) {
            setProfilePic(`http://127.0.0.1:8000${data.profile_picture}`);
            }
        });
    }
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, login, logout, getAccessToken, profilePic }}>
            {children}
        </AuthContext.Provider>
    );
};
