const YEAR = new Date().getFullYear();

const getCommonCSS = () => `
  body  { font-family: "Segoe UI", Arial, sans-serif; background:#f8fafc; margin:0; padding:0; color:#1e293b; }
  .wrap { max-width:620px; margin:30px auto; background:#fff; border-radius:8px;
          border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,.06); overflow:hidden; }
  .hdr  { background:#0B1C2C; padding:24px 32px; }
  .hdr h2 { color:#C6A85C; margin:0; font-size:1.2rem; letter-spacing:.05em; }
  .hdr p  { color:rgba(255,255,255,.6); margin:4px 0 0; font-size:.8rem; }
  .bdy  { padding:32px; line-height:1.8; font-size:.95rem; color:#334155; }
  .ftr  { background:#f1f5f9; padding:16px 32px; font-size:.78rem; color:#64748b;
          border-top:1px solid #e2e8f0; text-align:center; }
`;

export const getClientConfirmationEmailAR = (name: string, service: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h2>H.L.M &mdash; حسن ولقمان ومراد</h2>
      <p>LAW ADVOCATES & LEGAL CONSULTANTS</p>
    </div>
    <div class="bdy">
      <p>أهلاً بك <strong>${name}</strong>،</p>
      <p>شكراً لتواصلك مع مكتب HLM للاستشارات القانونية.</p>
      <p>لقد استلمنا طلبك بخصوص استشارة: <strong>${service}</strong>.</p>
      <p>سيقوم أحد مستشارينا القانونيين بمراجعة تفاصيل طلبك والتواصل معك قريباً.</p>
      <br />
      <p>أطيب التحيات،<br />فريق عمل HLM</p>
    </div>
    <div class="ftr">&copy; ${YEAR} HLM Law Advocates & Legal Consultants &mdash; جميع الحقوق محفوظة.</div>
  </div>
</body>
</html>
`;

export const getClientConfirmationEmailEN = (name: string, service: string) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h2>H.L.M</h2>
      <p>LAW ADVOCATES & LEGAL CONSULTANTS</p>
    </div>
    <div class="bdy">
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for contacting HLM Law Advocates.</p>
      <p>We have successfully received your inquiry regarding: <strong>${service}</strong>.</p>
      <p>One of our legal consultants is reviewing your request and will get back to you shortly.</p>
      <br />
      <p>Best regards,<br />HLM Team</p>
    </div>
    <div class="ftr">&copy; ${YEAR} HLM Law Advocates & Legal Consultants &mdash; All rights reserved.</div>
  </div>
</body>
</html>
`;

export const getAdminNotificationEmail = (ticketDetails: any) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <style>
    ${getCommonCSS()}
    .details { background:#f1f5f9; padding:16px; border-radius:6px; margin:20px 0; border:1px solid #e2e8f0; }
    .details p { margin:8px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h2>HLM Admin Portal</h2>
      <p>New Inquiry Received</p>
    </div>
    <div class="bdy">
      <p>A new inquiry was submitted via the website.</p>
      <div class="details">
        <p><strong>Ticket ID:</strong> ${ticketDetails.id}</p>
        <p><strong>Name:</strong> ${ticketDetails.name}</p>
        <p><strong>Email:</strong> ${ticketDetails.email}</p>
        <p><strong>Phone:</strong> ${ticketDetails.phone}</p>
        <p><strong>Service:</strong> ${ticketDetails.service}</p>
        <p><strong>Language:</strong> ${ticketDetails.lang.toUpperCase()}</p>
      </div>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #C6A85C; padding-left: 16px; margin: 0; color: #475569;">
        ${ticketDetails.message.replace(/\\n/g, '<br/>')}
      </blockquote>
      <br />
      <p><a href="https://hlm-legal.com/admin" style="background:#C6A85C;color:#0B1C2C;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:bold;">View in Dashboard</a></p>
    </div>
    <div class="ftr">HLM Automated Notification System</div>
  </div>
</body>
</html>
`;

export const getClientReplyEmail = (replyText: string, lang: 'ar' | 'en') => `
<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <h2>H.L.M ${lang === 'ar' ? '&mdash; حسن ولقمان ومراد' : ''}</h2>
      <p>LAW ADVOCATES & LEGAL CONSULTANTS</p>
    </div>
    <div class="bdy">
      <div style="white-space: pre-wrap; font-family: inherit;">${replyText}</div>
    </div>
    <div class="ftr">&copy; ${YEAR} HLM Law Advocates & Legal Consultants &mdash; ${lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</div>
  </div>
</body>
</html>
`;
