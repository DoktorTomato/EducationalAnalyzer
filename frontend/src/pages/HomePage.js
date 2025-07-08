import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <div>
      <h1 style={{margin: "1%"}}>Welcome to EduExtract</h1>

      <p style={{margin: "1%"}}>Your AI-powered educational document summarization tool.</p>
      <p style={{marginLeft: "1%"}}>Upload your documents and get concise summaries and quiz about it's content.</p>

      {!token && (
        <>
          <button onClick={() => navigate("/auth?mode=login")} style={{margin: "1%"}}>Sign In</button>
          <button onClick={() => navigate("/auth?mode=signup")} style={{margin: "1%"}}>Sign Up</button>
        </>
      )}

      {token && (
        <>
          <button onClick={() => navigate("/upload")} style={{margin: "1%"}}>Go to Upload</button>
          <button onClick={() => navigate("/history")} style={{margin: "1%"}}> View History </button>
        </>
      )}
    </div>
  );
}

export default HomePage;
