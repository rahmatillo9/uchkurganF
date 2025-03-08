// API.js yoki axios instansiya yaratish joyida
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.1.61:4000', // yoki sizning server manzilingiz
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;