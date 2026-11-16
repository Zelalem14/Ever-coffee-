const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('coffeehouse_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Robust response handler that safely parses responses without ever throwing
 * "Unexpected end of JSON input". Handles 204 No Content, HTML error pages,
 * server 500s, and returns user-friendly error messages.
 */
async function handleResponse(res) {
  // If no content status (204)
  if (res.status === 204) {
    return null;
  }

  // Safely read response text first
  let text = '';
  try {
    text = await res.text();
  } catch (err) {
    throw new Error('Unable to read server response. Please verify network connectivity.');
  }

  // Attempt to parse JSON safely if non-empty
  let data = null;
  if (text && text.trim().length > 0) {
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      // Body is not JSON (e.g. HTML 404, 502/504 gateway error, or plain text)
      console.warn('Non-JSON response received from server:', text.slice(0, 150));
    }
  }

  // If response status is not OK (2xx), produce a clear, human-understandable error
  if (!res.ok) {
    if (data && data.error) {
      throw new Error(data.error);
    }
    if (data && data.message) {
      throw new Error(data.message);
    }

    if (res.status === 401) {
      throw new Error('Invalid username or password. Please verify your credentials.');
    }
    if (res.status === 403) {
      throw new Error('Access Denied: You do not have permission to perform this administrative action.');
    }
    if (res.status === 404) {
      throw new Error('API service endpoint not found (404). Please ensure the backend server is running.');
    }
    if (res.status === 405) {
      throw new Error('API Method Not Allowed (405). Ensure the backend server is active and accessible.');
    }
    if (res.status === 429) {
      throw new Error('Too many requests. For your security, please wait a few moments before trying again.');
    }
    if (res.status >= 500) {
      throw new Error(`Server error (${res.status}). Please check the backend server logs.`);
    }

    throw new Error(`Request failed with status ${res.status}.`);
  }

  // Return parsed data or empty object if body was empty
  return data ?? {};
}

/**
 * Universal safe fetch wrapper that catches network errors and non-JSON responses
 */
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await handleResponse(res);
  } catch (err) {
    // If it's already an Error with a human-readable message from handleResponse, rethrow it
    if (err.message && !err.message.includes('Failed to execute') && !err.message.includes('Unexpected end of JSON')) {
      throw err;
    }
    // Network failure (e.g. server offline, ECONNREFUSED, CORS failed)
    console.error('API Network Connection Error:', err);
    throw new Error('Cannot connect to the backend server. Please verify your internet connection and ensure the server is running.');
  }
}

export const api = {
  // ================= AUTHENTICATION =================
  async login(username, password) {
    return await safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  },

  async logout() {
    try {
      await safeFetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      // Ignore network errors during logout
    }
  },

  async verifyAuth() {
    return await safeFetch(`${API_BASE}/auth/verify`, {
      headers: getAuthHeaders()
    });
  },

  async changeCredentials({ currentPassword, newUsername, newPassword, confirmPassword }) {
    return await safeFetch(`${API_BASE}/auth/change-credentials`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        currentPassword,
        newUsername,
        newPassword,
        confirmPassword
      })
    });
  },

  async updateProfile(payload) {
    return await safeFetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // ================= CATEGORIES =================
  async getCategories() {
    return await safeFetch(`${API_BASE}/categories`);
  },

  async createCategory(payload) {
    return await safeFetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async updateCategory(id, payload) {
    return await safeFetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async deleteCategory(id) {
    return await safeFetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // ================= PRODUCTS (MENU ITEMS) =================
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    const url = `${API_BASE}/products${query.toString() ? `?${query.toString()}` : ''}`;
    return await safeFetch(url);
  },

  async getProduct(id) {
    return await safeFetch(`${API_BASE}/products/${id}`);
  },

  async createProduct(payload) {
    return await safeFetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async updateProduct(id, payload) {
    return await safeFetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async toggleProductAvailability(id) {
    return await safeFetch(`${API_BASE}/products/${id}/toggle-availability`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
  },

  async deleteProduct(id) {
    return await safeFetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // ================= IMAGE UPLOAD =================
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('coffeehouse_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return await safeFetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
  },

  // ================= STATS & SETTINGS =================
  async getStats() {
    return await safeFetch(`${API_BASE}/stats`);
  },

  async getSettings() {
    return await safeFetch(`${API_BASE}/settings`);
  },

  async updateSettings(payload) {
    return await safeFetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  // ================= NETWORK INFO =================
  async getNetworkInfo() {
    return await safeFetch(`${API_BASE}/network-info`);
  },

  // ================= SEED DATABASE =================
  async seedDatabase() {
    return await safeFetch(`${API_BASE}/seed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // ================= USER ACCOUNTS & ROLES =================
  async getUsers() {
    return await safeFetch(`${API_BASE}/users`, {
      headers: getAuthHeaders()
    });
  },

  async createUser(payload) {
    return await safeFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async updateUser(id, payload) {
    return await safeFetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
  },

  async deleteUser(id) {
    return await safeFetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // ================= SECURITY AUDIT LOGS =================
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    return await safeFetch(`${API_BASE}/logs?${query.toString()}`, {
      headers: getAuthHeaders()
    });
  },

  async pruneAuditLogs() {
    return await safeFetch(`${API_BASE}/logs/prune`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  }
};
