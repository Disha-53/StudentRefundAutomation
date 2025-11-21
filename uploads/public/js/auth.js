document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#loginForm');
  const registerForm = document.querySelector('#registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);

      try {
        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: Object.fromEntries(formData),
        });
        saveSession(data);
        showBanner('Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/pages/submit.html';
        }, 800);
      } catch (error) {
        showBanner(error.message, 'danger');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);

      try {
        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: Object.fromEntries(formData),
        });
        saveSession(data);
        showBanner('Registration complete! Redirecting to claim submission.');
        setTimeout(() => {
          window.location.href = '/pages/submit.html';
        }, 1000);
      } catch (error) {
        showBanner(error.message, 'danger');
      }
    });
  }
});

