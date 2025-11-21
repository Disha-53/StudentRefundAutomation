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
        const role = data?.user?.role || 'STUDENT';
        setTimeout(() => {
          if (role === 'HOD') window.location.href = '/pages/hod.html';
          else if (role === 'ACCOUNTS') window.location.href = '/pages/accounts.html';
          else window.location.href = '/pages/submit.html';
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
        showBanner('Registration complete! Redirecting...');
        const role = data?.user?.role || 'STUDENT';
        setTimeout(() => {
          if (role === 'HOD') window.location.href = '/pages/hod.html';
          else if (role === 'ACCOUNTS') window.location.href = '/pages/accounts.html';
          else window.location.href = '/pages/submit.html';
        }, 1000);
      } catch (error) {
        showBanner(error.message, 'danger');
      }
    });
  }
});

