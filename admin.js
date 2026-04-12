/* ═══════════════════════════════════════════════════════════
   HLM LAW ADVOCATES — Admin JavaScript
   Authentication, Ticket Management, Replies
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // ─── State ───
  let tickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
  let currentTicketId = null;

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
    tickets.forEach((ticket) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${ticket.id.substr(-4)}</td>
        <td><strong>${ticket.name}</strong></td>
        <td>${ticket.service}</td>
        <td>${ticket.date.split(',')[0]}</td>
        <td><span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span></td>
        <td><button class="btn-view" data-id="${ticket.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer;">View</button></td>
      `;

      tr.querySelector('.btn-view').addEventListener('click', () => openTicket(ticket.id));
      tr.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') openTicket(ticket.id);
      });

      ticketsBody.appendChild(tr);
    });
  }

  function updateStats() {
    const freshTickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
    document.getElementById('stat-total').textContent = freshTickets.length;
    document.getElementById('stat-new').textContent = freshTickets.filter(t => t.status === 'new').length;
    document.getElementById('stat-replied').textContent = freshTickets.filter(t => t.status === 'replied').length;
  }

  // ═══════════════════════════════════════════════════
  // TICKET DETAILS & REPLY
  // ═══════════════════════════════════════════════════
  function openTicket(ticketId) {
    const freshTickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
    const ticket = freshTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    currentTicketId = ticketId;

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
    currentTicketId = null;
  });

  replyBtn.addEventListener('click', () => {
    const text = replyText.value.trim();
    if (!text || !currentTicketId) return;

    let freshTickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
    const ticketIndex = freshTickets.findIndex(t => t.id === currentTicketId);
    
    if (ticketIndex === -1) {
        alert("Error: Ticket not found.");
        return;
    }

    const targetTicket = freshTickets[ticketIndex];

    // 1. Update status and history
    targetTicket.status = 'replied';
    targetTicket.history.push({
      text: text,
      date: new Date().toLocaleString()
    });

    // 2. Save back to local storage
    localStorage.setItem('hlm_tickets', JSON.stringify(freshTickets));

    // 3. Send Automatic Email to User via Relay
    fetch('sender.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetTicket.email,
        subject: `Official Response: HLM Law Advocates - Ref #${targetTicket.id.substr(-4)}`,
        message: `Dear ${targetTicket.name},\n\nRegarding your inquiry about ${targetTicket.service}:\n\n${text}\n\nBest regards,\nHLM Law Advocates Team`,
        from_name: 'HLM Law Advocates'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('Email sent automatically via background relay.');
      } else {
        console.error('Relay error:', data.error);
      }
    });

    // 4. UI Refresh
    renderTickets();
    updateStats();
    openTicket(currentTicketId); // Refresh modal content
    replyText.value = '';

    alert('The reply has been sent automatically to ' + targetTicket.email);
  });

  // Initialization
  checkAuth();
});
