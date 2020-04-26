import axios from "axios";

// Should just be /api if env variable isn't set, which means it will request its own domain
// const baseURL = process.env.BACKEND_URL + "/api";
const baseURL = "/api";
if (process.env.NODE_ENV === "development") {
  baseURL = "http://localhost:4001/api";
}

const instance = axios.create({
  baseURL: baseURL,
});

export default instance;
