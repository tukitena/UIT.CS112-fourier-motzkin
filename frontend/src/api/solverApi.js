import axiosClient from './axiosClient';

export const solverApi = {
  solveProblem: async (payload) => {
    try {
      const response = await axiosClient.post('/api/solve', payload);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Lỗi từ server');
      }
      throw new Error('Không thể kết nối tới server');
    }
  }
};