// axiosConfig.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_SOCKET_URL, 
});

export default instance;