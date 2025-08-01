document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetPasswordForm');

  // ✅ Popup alert (reusable)
  function showPopup(message, color = '#28a745') {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.backgroundColor = color;
    popup.style.color = '#fff';
    popup.style.padding = '10px 20px';
    popup.style.borderRadius = '6px';
    popup.style.zIndex = '9999';
    popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (newPassword !== confirmPassword) {
      showPopup('Passwords do not match!', '#dc3545'); // red error
      return;
    }

    const urlParts = window.location.pathname.split('/');
    const requestId = urlParts[urlParts.length - 1];

    try {
      const res = await fetch(`/password/updatepassword/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        showPopup('Password updated successfully!');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        showPopup(data.message || 'Something went wrong', '#dc3545');
      }
    } catch (err) {
      console.error(err);
      showPopup('Error updating password. Please try again.', '#dc3545');
    }
  });
});
