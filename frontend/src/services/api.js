import axios from "axios";

const API_URL = "http://localhost:8000";

export const solveLP = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/api/solve`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || "Lỗi kết nối hệ thống";
  }
};
