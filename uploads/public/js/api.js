const API_BASE = '/api';
const TOKEN_KEY = 'edupay_token';
const USER_KEY = 'edupay_user';

function saveSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const userRaw = localStorage.getItem(USER_KEY);
  return userRaw ? JSON.parse(userRaw) : null;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/index.html';
}

async function apiRequest(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = getToken();
  const config = {
    method,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = isForm ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

function showBanner(message, variant = 'info') {
  const banner = document.querySelector('.notification-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.dataset.variant = variant;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 5000);
}

async function refreshNotifications() {
  try {
    const notifications = await apiRequest('/notifications');
    const listEl = document.querySelector('#notificationList');
    if (!listEl) return;
    listEl.innerHTML = notifications
      .map(
        (item) => `
      <li>
        <strong>${item.title}</strong>
        <p>${item.message}</p>
        <small>${new Date(item.created_at).toLocaleString()}</small>
      </li>
    `,
      )
      .join('');
  } catch (error) {
    // silent
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  refreshNotifications();
  setInterval(refreshNotifications, 15000);
});

