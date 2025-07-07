import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHistory(res.data.history || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
        setError("Could not load history.");
      }
    };

    fetchHistory();
  }, [token]);

  const handleBack = () => {
    navigate("/upload");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div style={{ padding: "2%" }}>
      <h2>Upload History</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginTop: "2%", marginBottom: "2%" }}>
        <button onClick={handleBack} style={{ marginRight: "1%" }}>
          Back to Upload
        </button>
        <button onClick={handleHome}>Home</button>
      </div>
      {history.length == 0 ? (
        <p>No uploads yet.</p>
      ) : (
        history.map((entry, index) => (
          <div
            key={index}
            style={{
              borderTop: "1px solid #ccc",
              paddingTop: "1%",
              marginBottom: "1.5%",
            }}
          >
            <p><strong>Filename:</strong> {entry.filename}</p>
            <p><strong>Summary:</strong><br />{entry.summary}</p>
            <p><strong>Quiz:</strong><br />{entry.quiz}</p>
            <p><strong>Answers:</strong><br />{entry.answers}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryPage;
