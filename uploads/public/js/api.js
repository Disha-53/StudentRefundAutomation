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
    // include credentials so httpOnly cookie set by server is sent with requests
    credentials: 'include',
  };

  if (body) {
    config.body = isForm ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, config);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    // If validation errors are present from express-validator, build a combined message
    if (Array.isArray(errorBody.errors) && errorBody.errors.length) {
      const msg = errorBody.errors.map((e) => e.msg || e.message).join('; ');
      throw new Error(msg);
    }
    throw new Error(errorBody.message || JSON.stringify(errorBody) || 'Request failed');
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
    const bell = document.querySelector('#notifBell');
    if (bell) {
      if (notifications && notifications.length) {
        bell.dataset.count = notifications.length;
        bell.style.position = 'relative';
        let dot = bell.querySelector('.notif-dot');
        if (!dot) {
          dot = document.createElement('span');
          dot.className = 'notif-dot';
          dot.style.position = 'absolute';
          dot.style.right = '6px';
          dot.style.top = '6px';
          dot.style.width = '10px';
          dot.style.height = '10px';
          dot.style.borderRadius = '50%';
          dot.style.background = '#ef4444';
          bell.appendChild(dot);
        }
      } else {
        const dot = bell.querySelector('.notif-dot');
        if (dot) dot.remove();
      }
    }
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

