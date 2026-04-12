/* ═══════════════════════════════════════════════════════════
   HLM LAW ADVOCATES — Admin JavaScript
   Authentication, Ticket Management, Replies
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ─── State ───
  let tickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
  let currentTicket = null;

  // ─── DOM References ───
  const loginOverlay = document.getElementById('login-overlay');
  const adminLayout = document.getElementById('admin-layout');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const ticketsBody = document.getElementById('tickets-body');
  const noTickets = document.getElementById('no-tickets');
  const logoutBtn = document.getElementById('logout-btn');

  // Modal References
  const ticketModal = document.getElementById('ticket-modal-overlay');
  const closeModal = document.getElementById('close-modal');
  const replyBtn = document.getElementById('send-reply-btn');
  const replyText = document.getElementById('reply-text');

  // ═══════════════════════════════════════════════════
  // AUTHENTICATION
  // ═══════════════════════════════════════════════════
  const checkAuth = () => {
    if (sessionStorage.getItem('hlm_admin_auth') === 'true') {
      loginOverlay.style.display = 'none';
      adminLayout.classList.add('authenticated');
      renderTickets();
      updateStats();
    }
  };

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'Admin' && pass === 'p@s$w0rd') {
      sessionStorage.setItem('hlm_admin_auth', 'true');
      checkAuth();
    } else {
      loginError.textContent = 'Invalid credentials. Please try again.';
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('hlm_admin_auth');
    window.location.reload();
  });

  // ═══════════════════════════════════════════════════
  // TICKET RENDERING
  // ═══════════════════════════════════════════════════
  function renderTickets() {
    tickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
    ticketsBody.innerHTML = '';

    if (tickets.length === 0) {
      noTickets.style.display = 'block';
      return;
    }

    noTickets.style.display = 'none';
    tickets.forEach((ticket, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${ticket.id.substr(-4)}</td>
        <td><strong>${ticket.name}</strong></td>
        <td>${ticket.service}</td>
        <td>${ticket.date.split(',')[0]}</td>
        <td><span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span></td>
        <td><button class="btn-view" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer;">View</button></td>
      `;

      tr.querySelector('.btn-view').addEventListener('click', () => openTicket(index));
      tr.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') openTicket(index);
      });

      ticketsBody.appendChild(tr);
    });
  }

  function updateStats() {
    document.getElementById('stat-total').textContent = tickets.length;
    document.getElementById('stat-new').textContent = tickets.filter(t => t.status === 'new').length;
    document.getElementById('stat-replied').textContent = tickets.filter(t => t.status === 'replied').length;
  }

  // ═══════════════════════════════════════════════════
  // TICKET DETAILS & REPLY
  // ═══════════════════════════════════════════════════
  function openTicket(index) {
    currentTicket = tickets[index];
    const ticket = currentTicket;

    document.getElementById('client-name').textContent = ticket.name;
    document.getElementById('client-email').textContent = ticket.email;
    document.getElementById('client-phone').textContent = ticket.phone;
    document.getElementById('ticket-service').textContent = ticket.service;
    document.getElementById('client-message').textContent = ticket.message;
    document.getElementById('modal-ticket-title').textContent = `Ticket ${ticket.id}`;

    const historyDiv = document.getElementById('reply-history');
    historyDiv.innerHTML = '';
    ticket.history.forEach(history => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="admin-label">Admin Reply • ${history.date}</span>
        <p>${history.text}</p>
      `;
      historyDiv.appendChild(div);
    });

    ticketModal.style.display = 'flex';
  }

  closeModal.addEventListener('click', () => {
    ticketModal.style.display = 'none';
    replyText.value = '';
  });

  replyBtn.addEventListener('click', () => {
    const text = replyText.value.trim();
    if (!text) return;

    // Update current ticket
    currentTicket.status = 'replied';
    currentTicket.history.push({
      text: text,
      date: new Date().toLocaleString()
    });

    // Save back to local storage
    localStorage.setItem('hlm_tickets', JSON.stringify(tickets));

    // Simulate sending email to user
    console.log(`Sending official reply to ${currentTicket.email}...`);
    console.log(`Subject: Official Response from HLM Law Advocates regarding ${currentTicket.service}`);
    console.log(`Body: ${text}`);

    // UI Refresh
    renderTickets();
    updateStats();
    openTicket(tickets.indexOf(currentTicket)); // Refresh modal content
    replyText.value = '';

    alert('Reply sent successfully to ' + currentTicket.email);
  });

  // Initialization
  checkAuth();
});
