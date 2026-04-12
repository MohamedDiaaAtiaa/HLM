/* ═══════════════════════════════════════════════════════════
2:    HLM LAW ADVOCATES — Admin JavaScript
3:    Authentication, Ticket Management, Replies
4:    ═══════════════════════════════════════════════════════════ */
5: 
6: document.addEventListener('DOMContentLoaded', () => {
7:   // ─── State ───
8:   let tickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
9:   let currentTicket = null;
10: 
11:   // ─── DOM References ───
12:   const loginOverlay = document.getElementById('login-overlay');
13:   const adminLayout = document.getElementById('admin-layout');
14:   const loginForm = document.getElementById('login-form');
15:   const loginError = document.getElementById('login-error');
16:   const ticketsBody = document.getElementById('tickets-body');
17:   const noTickets = document.getElementById('no-tickets');
18:   const logoutBtn = document.getElementById('logout-btn');
19: 
20:   // Modal References
21:   const ticketModal = document.getElementById('ticket-modal-overlay');
22:   const closeModal = document.getElementById('close-modal');
23:   const replyBtn = document.getElementById('send-reply-btn');
24:   const replyText = document.getElementById('reply-text');
25: 
26:   // ═══════════════════════════════════════════════════
27:   // AUTHENTICATION
28:   // ═══════════════════════════════════════════════════
29:   const checkAuth = () => {
30:     if (sessionStorage.getItem('hlm_admin_auth') === 'true') {
31:       loginOverlay.style.display = 'none';
32:       adminLayout.classList.add('authenticated');
33:       renderTickets();
34:       updateStats();
35:     }
36:   };
37: 
38:   loginForm.addEventListener('submit', (e) => {
39:     e.preventDefault();
40:     const user = document.getElementById('username').value;
41:     const pass = document.getElementById('password').value;
42: 
43:     if (user === 'Admin' && pass === 'p@s$w0rd') {
44:       sessionStorage.setItem('hlm_admin_auth', 'true');
45:       checkAuth();
46:     } else {
47:       loginError.textContent = 'Invalid credentials. Please try again.';
48:     }
49:   });
50: 
51:   logoutBtn.addEventListener('click', () => {
52:     sessionStorage.removeItem('hlm_admin_auth');
53:     window.location.reload();
54:   });
55: 
56:   // ═══════════════════════════════════════════════════
57:   // TICKET RENDERING
58:   // ═══════════════════════════════════════════════════
59:   function renderTickets() {
60:     tickets = JSON.parse(localStorage.getItem('hlm_tickets') || '[]');
61:     ticketsBody.innerHTML = '';
62: 
63:     if (tickets.length === 0) {
64:       noTickets.style.display = 'block';
65:       return;
66:     }
67: 
68:     noTickets.style.display = 'none';
69:     tickets.forEach((ticket, index) => {
70:       const tr = document.createElement('tr');
71:       tr.innerHTML = `
72:         <td>#${ticket.id.substr(-4)}</td>
73:         <td><strong>${ticket.name}</strong></td>
74:         <td>${ticket.service}</td>
75:         <td>${ticket.date.split(',')[0]}</td>
76:         <td><span class="status-badge status-${ticket.status}">${ticket.status.toUpperCase()}</span></td>
77:         <td><button class="btn-view" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer;">View</button></td>
78:       `;
79: 
80:       tr.querySelector('.btn-view').addEventListener('click', () => openTicket(index));
81:       tr.addEventListener('click', (e) => {
82:         if (e.target.tagName !== 'BUTTON') openTicket(index);
83:       });
84: 
85:       ticketsBody.appendChild(tr);
86:     });
87:   }
88: 
89:   function updateStats() {
90:     document.getElementById('stat-total').textContent = tickets.length;
91:     document.getElementById('stat-new').textContent = tickets.filter(t => t.status === 'new').length;
92:     document.getElementById('stat-replied').textContent = tickets.filter(t => t.status === 'replied').length;
93:   }
94: 
95:   // ═══════════════════════════════════════════════════
96:   // TICKET DETAILS & REPLY
97:   // ═══════════════════════════════════════════════════
98:   function openTicket(index) {
99:     currentTicket = tickets[index];
100:     const ticket = currentTicket;
101: 
102:     document.getElementById('client-name').textContent = ticket.name;
103:     document.getElementById('client-email').textContent = ticket.email;
104:     document.getElementById('client-phone').textContent = ticket.phone;
105:     document.getElementById('ticket-service').textContent = ticket.service;
106:     document.getElementById('client-message').textContent = ticket.message;
107:     document.getElementById('modal-ticket-title').textContent = `Ticket ${ticket.id}`;
108: 
109:     const historyDiv = document.getElementById('reply-history');
110:     historyDiv.innerHTML = '';
111:     ticket.history.forEach(history => {
112:       const div = document.createElement('div');
113:       div.className = 'history-item';
114:       div.innerHTML = `
115:         <span class="admin-label">Admin Reply • ${history.date}</span>
116:         <p>${history.text}</p>
117:       `;
118:       historyDiv.appendChild(div);
119:     });
120: 
121:     ticketModal.style.display = 'flex';
122:   }
123: 
124:   closeModal.addEventListener('click', () => {
125:     ticketModal.style.display = 'none';
126:     replyText.value = '';
127:   });
128: 
129:   replyBtn.addEventListener('click', () => {
130:     const text = replyText.value.trim();
131:     if (!text) return;
132: 
133:     // Update current ticket
134:     currentTicket.status = 'replied';
135:     currentTicket.history.push({
136:       text: text,
137:       date: new Date().toLocaleString()
138:     });
139: 
140:     // Save back to local storage
141:     localStorage.setItem('hlm_tickets', JSON.stringify(tickets));
142: 
143:     // Simulate sending email to user
144:     console.log(`Sending official reply to ${currentTicket.email}...`);
145:     console.log(`Subject: Official Response from HLM Law Advocates regarding ${currentTicket.service}`);
146:     console.log(`Body: ${text}`);
147: 
148:     // UI Refresh
149:     renderTickets();
150:     updateStats();
151:     openTicket(tickets.indexOf(currentTicket)); // Refresh modal content
152:     replyText.value = '';
153: 
154:     alert('Reply sent successfully to ' + currentTicket.email);
155:   });
156: 
157:   // Initialization
158:   checkAuth();
159: });
