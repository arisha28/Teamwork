import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/auth.api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("teamwork_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("teamwork_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem("teamwork_token");
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          localStorage.setItem("teamwork_user", JSON.stringify(res.data.user));
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: loggedInUser, token: authToken } = res.data;
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem("teamwork_token", authToken);
    localStorage.setItem("teamwork_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (name, email, password, role) => {
    const res = await authApi.register({ name, email, password, role });
    const { user: registeredUser, token: authToken } = res.data;
    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem("teamwork_token", authToken);
    localStorage.setItem("teamwork_user", JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("teamwork_token");
    localStorage.removeItem("teamwork_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
