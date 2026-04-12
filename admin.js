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
  // EMAILJS CONFIGURATION  
  // Uses the same credentials as script.js — keep in sync.
  // Template variable names for EMAILJS_TEMPLATE_REPLY:
  //   {{to_name}}  {{to_email}}  {{service}}  {{reply_text}}  {{ticket_ref}}
  // ═══════════════════════════════════════════════════
  const EMAILJS_PUBLIC_KEY = '8llg2NTxGXEW-PCtZ';     // same as script.js
  const EMAILJS_SERVICE_ID = 'service_zcq96si';     // same as script.js
  const EMAILJS_TEMPLATE_REPLY = 'template_p40qbde'; // separate template for admin replies

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

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

    // ── Ticket detail fields ─────────────────────────
    document.getElementById('client-name').textContent    = ticket.name;
    document.getElementById('client-email').textContent   = ticket.email;
    document.getElementById('client-phone').textContent   = ticket.phone;
    document.getElementById('ticket-service').textContent = ticket.service;
    document.getElementById('client-message').textContent = ticket.message;
    document.getElementById('modal-ticket-title').textContent = `Ticket #${ticket.id.substr(-4)}`;

    // ── Compose header (email-draft style) ───────────
    const ref     = ticket.id.substr(-4);
    const subject = `Official Response: HLM Law Advocates — Ref #${ref}`;
    document.getElementById('compose-to').textContent      = ticket.email;
    document.getElementById('compose-subject').textContent = subject;

    // Pre-fill body with a polished reply template
    const existingText = document.getElementById('reply-text').value.trim();
    if (!existingText) {
      document.getElementById('reply-text').value =
        `Dear ${ticket.name},\n\nThank you for reaching out to HLM Law Advocates regarding your inquiry about ${ticket.service}.\n\n[Your response here]\n\nBest regards,\nHLM Law Advocates Team`;
    }

    // ── Reply history ────────────────────────────────
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
    // Clear the body so it gets re-generated fresh on next open
    document.getElementById('reply-text').value = '';
    currentTicketId = null;
  });

  // ═══════════════════════════════════════════════════
  // GMAIL & OUTLOOK DRAFT HELPERS
  // ═══════════════════════════════════════════════════
  function getComposeData() {
    if (!currentTicketId) return null;
    const freshTickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
    const ticket = freshTickets.find(t => t.id === currentTicketId);
    if (!ticket) return null;
    const bodyText = document.getElementById('reply-text').value.trim();
    const subject  = `Official Response: HLM Law Advocates — Ref #${ticket.id.substr(-4)}`;
    return { ticket, subject, bodyText };
  }

  document.getElementById('open-gmail-btn').addEventListener('click', () => {
    const d = getComposeData();
    if (!d) return;
    const url = 'https://mail.google.com/mail/?view=cm'
      + '&to='   + encodeURIComponent(d.ticket.email)
      + '&su='   + encodeURIComponent(d.subject)
      + '&body=' + encodeURIComponent(d.bodyText);
    window.open(url, '_blank', 'noopener');
  });

  document.getElementById('open-outlook-btn').addEventListener('click', () => {
    const d = getComposeData();
    if (!d) return;
    const url = 'https://outlook.office.com/mail/deeplink/compose'
      + '?to='      + encodeURIComponent(d.ticket.email)
      + '&subject=' + encodeURIComponent(d.subject)
      + '&body='    + encodeURIComponent(d.bodyText);
    window.open(url, '_blank', 'noopener');
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

    // 3. Send reply email via EmailJS
    const originalLabel = replyBtn.textContent;
    const statusEl = document.getElementById('reply-send-status');

    replyBtn.textContent = 'Sending…';
    replyBtn.disabled = true;
    statusEl.textContent = '';
    statusEl.style.color = '';

    const templateParams = {
      to_name:    targetTicket.name,
      to_email:   targetTicket.email,   // must match {{to_email}} in your EmailJS template's "To" field
      service:    targetTicket.service,
      reply_text: text,
      ticket_ref: targetTicket.id.substr(-4)
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_REPLY, templateParams)
      .then(() => {
        replyBtn.textContent = originalLabel;
        replyBtn.disabled = false;
        statusEl.textContent = `✓ Reply emailed to ${targetTicket.email} successfully.`;
        statusEl.style.color = '#166534';
      })
      .catch(err => {
        replyBtn.textContent = originalLabel;
        replyBtn.disabled = false;
        const errMsg = err?.text || err?.message || JSON.stringify(err) || 'Unknown error';
        statusEl.textContent = `⚠ Reply saved locally but email failed: ${errMsg}`;
        statusEl.style.color = '#b91c1c';
        console.error('EmailJS admin reply error:', err);
      });

    // 4. UI Refresh
    renderTickets();
    updateStats();
    openTicket(currentTicketId);
    // Clear body after refresh (openTicket pre-fills only when empty)
    document.getElementById('reply-text').value = '';
  });

  // Initialization
  checkAuth();
});
