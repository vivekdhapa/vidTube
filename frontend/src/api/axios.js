import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 10000, // 10 s — never hang indefinitely
});

// Response interceptor — retry once after refreshing tokens on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post(
          'http://localhost:8000/api/v1/users/refresh-token',
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
