"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import '../globals.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState({ message: '', type: '' });
  const [isSending, setIsSending] = useState(false);
  
  // Admin User Management State
  const [activeTab, setActiveTab] = useState<'tickets' | 'settings'>('tickets');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Check auth and load data
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setTickets(data.tickets);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchTickets();
      } else {
        const err = await res.json();
        setLoginError(err.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server error');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setTickets([]);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        fetchAdminUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add admin');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin account?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to remove admin');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setIsSending(true);
    setReplyStatus({ message: 'Sending...', type: 'info' });

    try {
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: selectedTicket.id, replyText })
      });
      
      if (res.ok) {
        setReplyStatus({ message: '✓ Reply emailed to client successfully.', type: 'success' });
        setReplyText('');
        fetchTickets();
        
        // Refresh selected ticket to show the new history item immediately
        const freshTicket = await res.json();
        const updatedTicket = { ...selectedTicket, status: 'replied', ticket_replies: freshTicket.replies };
        setSelectedTicket(updatedTicket);
      } else {
        const err = await res.json();
        setReplyStatus({ message: `⚠ Failed: ${err.error}`, type: 'error' });
      }
    } catch (err) {
      setReplyStatus({ message: `⚠ Failed connection`, type: 'error' });
    }
    
    setIsSending(false);
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    const greeting = ticket.lang === 'ar' ? 'أهلاً بك' : 'Dear';
    setReplyText(`${greeting} ${ticket.name},\n\nThank you for reaching out to HLM Law Advocates regarding your inquiry about ${ticket.service}.\n\n[Your response here]\n\nBest regards,\nHLM Law Advocates Team`);
    setReplyStatus({ message: '', type: '' });
  };

  const AdminLayoutStyling = `
    .admin-body { background-color: #f8fafc; color: #1e293b; font-family: var(--font-body-en); direction: ltr; min-height: 100vh;}
    .admin-layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; }
    .sidebar { background: #0B1C2C; color: white; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
    .sidebar-logo { display: flex; align-items: center; gap: 1rem; font-weight: 700; font-size: 1.2rem; color: #C6A85C; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-item { padding: 0.75rem 1rem; border-radius: 4px; color: rgba(255,255,255,0.7); cursor: pointer; transition: all 0.2s; }
    .nav-item:hover, .nav-item.active { background: rgba(255,255,255,0.05); color: white; border-left: 3px solid #C6A85C; }
    .main-content { padding: 2rem 3rem; }
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
    .content-title { font-size: 2rem; font-weight: 700; color: #0B1C2C; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
    .stat-card { background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .stat-val { font-size: 1.5rem; font-weight: 700; color: #0B1C2C; }
    .stat-name { font-size: 0.85rem; color: #64748b; margin-top: 0.25rem; }
    .tickets-table-container { background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f1f5f9; padding: 1rem; font-size: 0.85rem; font-weight: 600; color: #64748b; }
    td { padding: 1.25rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
    tr:hover { background: #f8fafc; cursor: pointer; }
    .status-badge { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .status-new { background: #dcfce7; color: #166534; text-transform: uppercase; }
    .status-replied { background: #e0f2fe; color: #075985; text-transform: uppercase; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .ticket-modal { background: white; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 2rem; overflow-y: auto; flex: 1; }
    .modal-footer { padding: 1.5rem 2rem; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .message-bubble { background: #f1f5f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; line-height: 1.6; }
    .admin-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #C6A85C; margin-bottom: 0.5rem; display: block; }
    .history-item { border-left: 2px solid #C6A85C; padding-left: 1.5rem; margin-top: 1.5rem; font-size: 0.9rem; color: #475569; }
    textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; font-family: inherit; margin-bottom: 1rem; resize: vertical; min-height: 120px; }
  `;

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0B1C2C' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Image src="/images/Logo.png" alt="HLM" width={60} height={60} style={{ marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#0B1C2C' }}>Admin Access</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input type="text" name="username" className="form-control" placeholder="Username" required />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <input type="password" name="password" className="form-control" placeholder="Password" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
          {loginError && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '1rem' }}>{loginError}</p>}
        </div>
      </div>
    );
  }

  const totalTickets = tickets.length;
  const newTickets = tickets.filter(t => t.status === 'new').length;
  const repliedTickets = parseInt(totalTickets.toString()) - newTickets;

  return (
    <div className="admin-body">
      <style>{AdminLayoutStyling}</style>
      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Image src="/images/Logo.png" alt="" width={32} height={32} />
            <span>HLM Portal</span>
          </div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>Inquiry Tickets</div>
            <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); fetchAdminUsers(); }}>Account Management</div>
            <div className="nav-item" onClick={handleLogout}>Log out</div>
          </nav>
        </aside>

        <main className="main-content">
          {activeTab === 'tickets' ? (
            <>
              <header className="content-header">
                <h2 className="content-title">Tickets History</h2>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Logged in as Admin</div>
              </header>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-val">{totalTickets}</div>
                  <div className="stat-name">Total Submissions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val" style={{ color: '#166534' }}>{newTickets}</div>
                  <div className="stat-name">New Tickets</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val" style={{ color: '#075985' }}>{repliedTickets}</div>
                  <div className="stat-name">Replied</div>
                </div>
              </section>

              <div className="tickets-table-container">
                {tickets.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No contact submissions yet.</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client Name</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(t => (
                        <tr key={t.id} onClick={() => openTicket(t)}>
                          <td>#{t.id.split('-')[1] || t.id.substring(0,6)}</td>
                          <td><strong>{t.name}</strong></td>
                          <td>{t.service}</td>
                          <td>{new Date(t.created_at).toLocaleDateString()}</td>
                          <td><span className={`status-badge status-${t.status}`}>{t.status}</span></td>
                          <td><button style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <>
              <header className="content-header">
                <h2 className="content-title">Admin Account Management</h2>
              </header>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="tickets-table-container" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Add New Admin</h3>
                  <form onSubmit={handleAddAdmin}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Username</label>
                      <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="form-control" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-control" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Create Admin</button>
                  </form>
                </div>

                <div className="tickets-table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(user => (
                        <tr key={user.id}>
                          <td><strong>{user.username}</strong></td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                          <td>
                            <button onClick={() => handleRemoveAdmin(user.id)} style={{ padding: '0.4rem 0.8rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTicket(null); }}>
          <div className="ticket-modal">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Ticket #{selectedTicket.id.split('-')[1]}</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div>
                  <span className="admin-label">Client Info</span>
                  <strong>{selectedTicket.name}</strong><br/>
                  <span>{selectedTicket.email}</span><br/>
                  <span>{selectedTicket.phone}</span>
                </div>
                <div>
                  <span className="admin-label">Service Type</span>
                  <span>{selectedTicket.service}</span>
                  <br/><br/>
                  <span className="admin-label">Language</span>
                  <span style={{ textTransform: 'uppercase' }}>{selectedTicket.lang}</span>
                </div>
              </div>

              <span className="admin-label">Client Message</span>
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {selectedTicket.message}
              </div>

              {selectedTicket.ticket_replies && selectedTicket.ticket_replies.map((reply: any) => (
                <div key={reply.id} className="history-item">
                  <span className="admin-label">Admin Reply • {new Date(reply.created_at).toLocaleString()}</span>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{reply.reply_text}</p>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <span className="admin-label">Compose Official Reply (will be emailed to client)</span>
              <div style={{ background: '#f8fafc', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong>To:</strong> {selectedTicket.email}
              </div>
              <textarea 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                placeholder="Write your response here..."
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: replyStatus.type === 'error' ? '#b91c1c' : '#166534', fontSize: '0.85rem' }}>{replyStatus.message}</span>
                <button className="btn btn-primary" onClick={handleSendReply} disabled={isSending}>
                  {isSending ? 'Sending...' : 'Send Email Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
