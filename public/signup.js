function showToast(message, isSuccess = true) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // Green for success, red for error
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Hide after 3s
}

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(' Signup successful! Redirecting...', true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    } else {
      showToast(data.message || '❌ Signup failed.', false);
    }
  } catch (err) {
    console.error('Signup error:', err);
    showToast('❌ Something went wrong. Please try again.', false);
  }
});
