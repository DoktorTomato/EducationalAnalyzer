import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const res = await api.post(endpoint, { email, password });

      const token = res.data.idToken || res.data.token;
      localStorage.setItem("token", token);

      navigate("/upload");
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>{mode === "signup" ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">
          {mode === "signup" ? "Register" : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AuthPage;
