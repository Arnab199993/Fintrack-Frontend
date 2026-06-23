import BaseApi from "./BaseApi.js";

// Auth API
export const authApi = {
  register: (data) => BaseApi.BasePostRequestAsync("auth/register", data),
  login: (data) => BaseApi.BasePostRequestAsync("auth/login", data),
  verifyLogin : (data) => BaseApi.BasePostRequestAsync("auth/login/verify", data),
  loginVerify: (data) => BaseApi.BasePostRequestAsync("auth/login/verify", data),
  verifyEmail: (data) => BaseApi.BasePostRequestAsync("auth/verify-email", data),
  refreshToken: () => BaseApi.BasePostRequestAsync("auth/token/refresh", {}),
  resendOtp: (data) => BaseApi.BasePostRequestAsync("auth/otp/resend", data),
  logout: () => BaseApi.BasePostRequestAsync("auth/logout", {}),
  forgotPassword: (data) => BaseApi.BasePostRequestAsync("auth/forgot-password", data),
  resetPassword: (data) => BaseApi.BasePostRequestAsync("auth/reset-password", data),
  deleteAccount: () => BaseApi.BaseDeleteRequestAsync("auth/account"),
};

// User API
export const usersApi = {
  getProfile: () => BaseApi.BaseGetRequestAsync("users/user"),
  updateProfile: (data) => BaseApi.BasePatchRequestAsync("users/user", data),
  changePassword: (data) => BaseApi.BasePatchRequestAsync("users/user/password", data),
  updateAvatar: (file) => BaseApi.BasePostRequestFileAsync("users/user/avatar", file),
  getWallet: () => BaseApi.BaseGetRequestAsync("users/user/wallet"),
  topUpWallet: (data) => BaseApi.BasePostRequestAsync("users/user/wallet/topup", data),
};

// Transactions API
export const transactionsApi = {
  list: (params) => {
    const query = new URLSearchParams(params || {}).toString();
    return BaseApi.BaseGetRequestAsync(`transactions${query ? "?" + query : ""}`);
  },
  getById: (id) => BaseApi.BaseGetRequestAsync(`transactions/${id}`),
  create: (data) => BaseApi.BasePostRequestAsync("transactions", data),
  createWithReceipt: (file) => BaseApi.BasePostRequestFileAsync("transactions", file),
  update: (id, data) => BaseApi.BasePatchRequestAsync(`transactions/${id}`, data),
  remove: (id) => BaseApi.BaseDeleteRequestAsync(`transactions/${id}`),
  analytics: {
    categories: () => BaseApi.BaseGetRequestAsync("transactions/analytics/categories"),
    trend: (params) => {
      const query = new URLSearchParams(params || {}).toString();
      return BaseApi.BaseGetRequestAsync(`transactions/analytics/trend${query ? "?" + query : ""}`);
    },
    dashboard: () => BaseApi.BaseGetRequestAsync("transactions/analytics/dashboard"),
  },
};

// Budget API
export const budgetsApi = {
  list: () => BaseApi.BaseGetRequestAsync("budgets"),
  overview: () => BaseApi.BaseGetRequestAsync("budgets/overview"),
  create: (data) => BaseApi.BasePostRequestAsync("budgets", data),
  update: (id, data) => BaseApi.BasePatchRequestAsync(`budgets/${id}`, data),
  remove: (id) => BaseApi.BaseDeleteRequestAsync(`budgets/${id}`),
};

// Alert API
export const alertsApi = {
  list: () => BaseApi.BaseGetRequestAsync("alerts"),
  getSettings: () => BaseApi.BaseGetRequestAsync("alerts/settings"),
  updateSettings: (data) =>
    BaseApi.BasePatchRequestAsync("alerts/settings", data),
  markAllRead: () => BaseApi.BasePatchRequestAsync("alerts/read-all", {}),
  markRead: (id) => BaseApi.BasePatchRequestAsync(`alerts/${id}/read`, {}),
};

// Insights API
export const insightsApi = {
  list: () => BaseApi.BaseGetRequestAsync("insights"),
  generate: (data) => BaseApi.BasePostRequestAsync("insights/generate", data),
  getByPeriod: (period) => BaseApi.BaseGetRequestAsync(`insights/${period}`),
};

export const api = {
  auth: authApi,
  users: usersApi,
  transactions: transactionsApi,
  budgets: budgetsApi,
  alerts: alertsApi,
  insights: insightsApi,
};

export default api;
