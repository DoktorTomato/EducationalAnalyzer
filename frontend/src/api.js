import axios from "axios";

const api = axios.create({
  baseURL: "https://educational-analyzer-api-abcde12345-uc.a.run.app/" || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
