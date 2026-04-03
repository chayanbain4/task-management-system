const ACCESS_TOKEN_KEY = 'task_management_access_token';
const REFRESH_TOKEN_KEY = 'task_management_refresh_token';
const USER_KEY = 'task_management_user';

export const storage = {
  // Access token
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // Refresh token
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearRefreshToken: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // User
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: unknown) => {
    if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
  },

  // Clear all
  clearAll: () => {
    storage.clearAccessToken();
    storage.clearRefreshToken();
    storage.clearUser();
  }
};