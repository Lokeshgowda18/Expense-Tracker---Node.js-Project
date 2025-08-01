document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('token');
  if (!token) return window.location.href = '/login';

  const form = document.getElementById('expenseForm');
  const expenseList = document.getElementById('expenseList');
  const submitBtn = document.getElementById('submitBtn');
  const pageSize = document.getElementById('pageSize');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const leaderboardBtn = document.getElementById('showLeaderboardBtn');
  const leaderboardDiv = document.getElementById('leaderboard');
  const dailyBtn = document.getElementById('dailyBtn');
  const monthlyBtn = document.getElementById('monthlyBtn');
  const yearlyBtn = document.getElementById('yearlyBtn');
  const reportResult = document.getElementById('reportResult');
  const totalSpent = document.getElementById('totalSpent');
  const downloadBtn = document.getElementById('downloadBtn');

  let editingId = null;
  let currentPage = 1;
  let limit = parseInt(pageSize.value);
  let currentFilter = '';

  // ✅ Alert popup function
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

  function fetchExpenses() {
    fetch(`/api/expenses?page=${currentPage}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.expenses.length === 0 && currentPage > 1) {
        currentPage--;
        return fetchExpenses();
      }

      expenseList.innerHTML = '';
      data.expenses.forEach(exp => {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.innerHTML = `
          ₹${exp.amount} | ${exp.description} | ${exp.category} | ${exp.date}
          <div class="expense-actions">
            <button data-id="${exp.id}" class="btn btn-sm btn-lightbrown me-2 edit-btn">Edit</button>
            <button data-id="${exp.id}" class="btn btn-sm btn-darkbrown delete-btn">Delete</button>
          </div>`;
        expenseList.appendChild(li);
      });

      pageInfo.innerText = `Page ${data.currentPage} of ${data.totalPages}`;
      prevBtn.disabled = data.currentPage === 1;
      nextBtn.disabled = data.currentPage >= data.totalPages;

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          fetch(`/api/expenses/${btn.dataset.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
            if (res.ok) {
              showAlert('Expense deleted successfully!');
              fetchExpenses();
            } else {
              showAlert('Failed to delete expense.');
            }
          });
        });
      });

      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const exp = data.expenses.find(e => e.id == btn.dataset.id);
          document.getElementById('amount').value = exp.amount;
          document.getElementById('description').value = exp.description;
          document.getElementById('category').value = exp.category;
          document.getElementById('date').value = exp.date || '';
          document.getElementById('time').value = exp.time || '';
          editingId = exp.id;
          submitBtn.innerText = 'Update Expense';
        });
      });
    });
  }

  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; fetchExpenses(); } };
  nextBtn.onclick = () => { currentPage++; fetchExpenses(); };
  pageSize.onchange = () => { limit = parseInt(pageSize.value); currentPage = 1; fetchExpenses(); };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const expenseData = {
      amount: document.getElementById('amount').value,
      description: document.getElementById('description').value,
      category: document.getElementById('category').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value
    };

    const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(expenseData)
    }).then(res => {
      if (res.ok) {
        showAlert(editingId ? 'Expense updated successfully!' : 'Expense added successfully!');
      } else {
        showAlert('Failed to save expense.');
      }
      editingId = null;
      submitBtn.innerText = 'Add Expense';
      form.reset();
      fetchExpenses();
    });
  });

  leaderboardBtn.onclick = () => {
    fetch('/api/premium/showleaderboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      leaderboardDiv.innerHTML = data.length
        ? data.map((u, i) => `<p>${i + 1}. ${u.name} — ₹${u.totalExpense}</p>`).join('')
        : '<p>No leaderboard data.</p>';
    });
  };

  function handleReport(filter) {
    currentFilter = filter;
    fetch(`/api/premium/report?filter=${filter}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(data => {
      let html = `<table><tr><th>Amount</th><th>Description</th><th>Category</th><th>Date</th><th>Time</th></tr>`;
      data.expenses.forEach(e => {
        html += `<tr><td>₹${e.amount}</td><td>${e.description}</td><td>${e.category}</td><td>${e.date}</td><td>${e.time || ''}</td></tr>`;
      });
      html += `</table>`;
      reportResult.innerHTML = html;
      totalSpent.innerText = `Total Spent: ₹${data.total}`;
      downloadBtn.disabled = false;
    });
  }

  dailyBtn.onclick = () => handleReport('daily');
  monthlyBtn.onclick = () => handleReport('monthly');
  yearlyBtn.onclick = () => handleReport('yearly');

  downloadBtn.onclick = () => {
    if (!currentFilter) return showAlert('Select filter first!');
    fetch(`/api/premium/download?filter=${currentFilter}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.blob()).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${currentFilter}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  fetch('/api/user', { headers: { Authorization: `Bearer ${token}` } })
    .then(res => res.json()).then(data => {
      document.getElementById('usernameBox').innerText = data.name || 'User';
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
