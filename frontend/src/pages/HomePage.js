import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div>
      <h1>Welcome to EduExtract</h1>

      {!token && (
        <>
          <button onClick={() => navigate("/auth?mode=login")}>Sign In</button>
          <button onClick={() => navigate("/auth?mode=signup")}>Sign Up</button>
        </>
      )}

      {token && (
        <>
          <button onClick={() => navigate("/upload")}>Go to Upload</button>
          <button onClick={() => navigate("/history")}> View History </button>
        </>
      )}
    </div>
  );
}

export default HomePage;
