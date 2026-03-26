import axios from 'axios';

const URL = 'http://localhost:8000'; //default backend URL

const axiosClient = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;