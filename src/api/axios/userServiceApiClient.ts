import axios from "axios";
import { configureApiClient } from "./axiosConfig";

const userApiClient = configureApiClient(
  axios.create({
    baseURL: import.meta.env.VITE_USER_SERVICE_URL ||  "http://localhost:7070/users",
    headers: {
      "Content-Type": "application/json",
    },
  })
);

export default userApiClient;
