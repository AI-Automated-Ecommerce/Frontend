import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-2mhf.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
