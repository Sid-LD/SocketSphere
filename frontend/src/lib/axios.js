import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:3000/api"
      : "/api",
  withCredentials: true, // if the user has cookies  and necessary token only in that case let him in
});
