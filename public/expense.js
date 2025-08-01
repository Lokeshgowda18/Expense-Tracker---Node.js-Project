document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) return window.location.href = '/login';

  const form = document.getElementById('expenseForm');
  const expenseList = document.getElementById('expenseList');
  const submitBtn = document.getElementById('submitBtn');
  const buyPremiumBtn = document.getElementById('buyPremium');
  const usernameBox = document.getElementById('usernameBox');

  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const pageSize = document.getElementById('pageSize');

  let editingId = null;
  let currentPage = 1;
  let limit = parseInt(pageSize.value);

  // ✅ Alert function
  function showAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.textContent = message;
    alertBox.style.position = 'fixed';
    alertBox.style.top = '20px';
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.backgroundColor = '#28a745';
    alertBox.style.color = '#fff';
    alertBox.style.padding = '10px 20px';
    alertBox.style.borderRadius = '5px';
    alertBox.style.zIndex = '9999';
    alertBox.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
  }

  pageSize.addEventListener('change', () => {
    limit = parseInt(pageSize.value);
    currentPage = 1;
    fetchExpenses();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const expense = {
      amount: document.getElementById('amount').value,
      description: document.getElementById('description').value,
      note: document.getElementById('note').value,
      category: document.getElementById('category').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value
    };
    const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(expense)
    });

    if (res.ok) {
      showAlert(editingId ? 'Expense updated successfully!' : 'Expense added successfully!');
    } else {
      showAlert('Something went wrong!');
    }

    editingId = null;
    submitBtn.textContent = 'Add Expense';
    form.reset();
    fetchExpenses();
  });

  async function fetchExpenses() {
    const res = await fetch(`/api/expenses?page=${currentPage}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    expenseList.innerHTML = '';

    if (data.expenses.length === 0 && currentPage > 1) {
      currentPage--;
      return fetchExpenses();
    }

    data.expenses.forEach(exp => {
      const li = document.createElement('li');
      li.className = 'expense-item';
      li.innerHTML = `
        <div>₹${exp.amount} — ${exp.description} (${exp.category}) ${exp.date} <br><small>Note: ${exp.note || '-'}</small></div>
        <div class="expense-actions">
          <button data-id="${exp.id}" class="btn btn-sm btn-lightbrown edit-btn">Edit</button>
          <button data-id="${exp.id}" class="btn btn-sm btn-darkbrown delete-btn">Delete</button>
        </div>
      `;
      expenseList.appendChild(li);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        const exp = data.expenses.find(e => e.id == btn.dataset.id);
        document.getElementById('amount').value = exp.amount;
        document.getElementById('description').value = exp.description;
        document.getElementById('note').value = exp.note || '';
        document.getElementById('category').value = exp.category;
        document.getElementById('date').value = exp.date;
        document.getElementById('time').value = exp.time || '';
        editingId = exp.id;
        submitBtn.textContent = 'Update Expense';
      };
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const res = await fetch(`/api/expenses/${btn.dataset.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          showAlert('Expense deleted successfully!');
        } else {
          showAlert('Failed to delete expense.');
        }

        fetchExpenses();
      };
    });

    pageInfo.textContent = `Page ${currentPage} of ${data.totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= data.totalPages;
  }

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      fetchExpenses();
    }
  };

  nextBtn.onclick = () => {
    currentPage++;
    fetchExpenses();
  };

  buyPremiumBtn.onclick = async () => {
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.paymentSessionId) {
      const cashfree = Cashfree({ mode: "sandbox" });
      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self"
      });
    } else {
      showAlert(data.message || 'Payment failed.');
    }
  };

  fetch('/api/user', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      usernameBox.textContent = data.name || 'User';
    });

  fetchExpenses();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    });
  }
});
