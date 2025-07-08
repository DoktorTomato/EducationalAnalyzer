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

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div>
      <h2 style={{padding: "1%"}}>{mode === "signup" ? "Sign Up" : "Sign In"}</h2>
      <form onSubmit={handleSubmit} style={{marginLeft: "1%"}}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{margin: "0.1%"}}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{margin: "0.1%"}}
        /><br />
        <button type="submit" style={{margin: "0.1%"}}>
          {mode === "signup" ? "Register" : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default AuthPage;
