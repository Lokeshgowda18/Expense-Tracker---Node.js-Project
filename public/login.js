// Helper function to show temporary alerts
function showPopup(message, type = 'success') {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.right = '20px';
  popup.style.padding = '12px 20px';
  popup.style.zIndex = '9999';
  popup.style.borderRadius = '8px';
  popup.style.fontWeight = 'bold';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  popup.style.backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
  popup.style.color = '#fff';
  popup.style.opacity = '1';
  popup.style.transition = 'opacity 0.5s ease';

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }, 2500);
}

// LOGIN form logic
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('isPremium', data.isPremium);

      showPopup('Login successful! Redirecting...');

      setTimeout(() => {
        if (data.isPremium) {
          window.location.href = '/premium';
        } else {
          window.location.href = '/expenses';
        }
      }, 1500);
    } else {
      showPopup(data.message || 'Login failed. Please check your credentials.', 'error');
    }
  } catch (err) {
    console.error(err);
    showPopup('Something went wrong. Please try again later.', 'error');
  }
});

// Show Forgot Password form
document.getElementById('showForgot').addEventListener('click', () => {
  document.getElementById('forgotPasswordForm').classList.remove('d-none');
});

// Hide Forgot Password form
document.getElementById('cancelForgot').addEventListener('click', () => {
  document.getElementById('forgotPasswordForm').classList.add('d-none');
});

// Forgot Password form logic
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('forgotEmail').value.trim();

  try {
    const res = await fetch('/password/forgotpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    await res.json();

    showPopup('If your email is valid, a reset link has been sent.');
    document.getElementById('forgotPasswordForm').classList.add('d-none');
  } catch (err) {
    console.error(err);
    showPopup('Something went wrong. Please try again.', 'error');
  }
});
