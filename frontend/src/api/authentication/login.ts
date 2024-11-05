import axios from "axios";

export const loginUser = async (credentials: {
  username: string;
  password: string;
}) => {
  try {
    const response = await axios.post("/api/login", credentials); // Adjust the endpoint as necessary
    return response.data; // Handle the response data as needed
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};
