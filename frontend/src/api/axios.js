import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
           'https://vidtube-9e8o.onrender.com/api/v1',
  withCredentials: true,
  timeout: 60000,
});

// Response interceptor — retry once after refreshing tokens on 401
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      let dataStr = JSON.stringify(response.data);
      if (dataStr.includes('http://res.cloudinary.com')) {
        dataStr = dataStr.replace(/http:\/\/res\.cloudinary\.com/g, 'https://res.cloudinary.com');
        response.data = JSON.parse(dataStr);
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'https://vidtube-9e8o.onrender.com/api/v1'}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        return api(original);
      } catch {
        // Refresh failed — clear auth state (but don't redirect, let callers handle it)
        try {
          const { default: useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().logout();
        } catch (_) {}
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
