import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [abstract, setAbstract] = useState("");
  const [filename, setFilename] = useState("");
  const [length, setLength] = useState(null);
  const [quiz, setQuiz] = useState(""); // New field for quiz
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setAbstract("");
    setFilename("");
    setLength(null);
    setQuiz("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    setLoading(true);
    setError("");
    setAbstract("");
    setFilename("");
    setLength(null);
    setQuiz("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setAbstract(response.data.abstract || "No abstract returned.");
      setFilename(response.data.filename || file.name);
      setLength(response.data.length || 0);
      setQuiz(response.data.quiz || "No quiz returned."); // Set quiz
    } catch (err) {
      setError("Upload failed. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth?mode=login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Upload Document</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {abstract && (
        <div style={{ marginTop: "2rem" }}>
          <h3>File Info:</h3>
          <p><strong>Filename:</strong> {filename}</p>
          <p><strong>Text Length:</strong> {length} characters</p>
          <h3>Abstract:</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{abstract}</p>
          <h3>Quiz:</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{quiz}</p>
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: "2rem" }}>
        Log Out
      </button>
    </div>
  );
}

export default UploadPage;
