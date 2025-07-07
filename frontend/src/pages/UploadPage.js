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
  const [quiz, setQuiz] = useState("");
  const [answers, setAnswers] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setAbstract("");
    setFilename("");
    setLength(null);
    setQuiz("");
    setAnswers("");
    setShowAnswers(false);
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
    setAnswers("");
    setShowAnswers(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setAbstract(response.data.summary || "No summary returned.");
      setFilename(response.data.filename || file.name);
      setLength(response.data.length || 0);
      setQuiz(response.data.quiz || "No quiz returned.");
      setAnswers(response.data.answers || "");
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
    <div style={{ padding: "2%" }}>
      <h2>Upload Document</h2>

      <p>Please only upload pdf's with 30 pages or less</p>

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
        <div style={{ marginTop: "2%" }}>
          <h3>File Info:</h3>
          <p><strong>Filename:</strong> {filename}</p>
          <p><strong>Text Length:</strong> {length} characters</p>
          <h3>Summary:</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{abstract}</p>
          <h3>Quiz:</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{quiz}</p>

          {answers && (
            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? "Hide Answers" : "Show Answers"}
              </button>
              {showAnswers && (
                <div style={{ marginTop: "0.5rem" }}>
                  <h4>Answers:</h4>
                  <p style={{ whiteSpace: "pre-wrap" }}>{answers}</p>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      <button onClick={() => navigate("/history")} style={{ marginTop: "2%" }}>
        View History
      </button>

      <button onClick={handleLogout} style={{ margin: "1%" }}>
        Log Out
      </button>
    </div>
  );
}

export default UploadPage;
