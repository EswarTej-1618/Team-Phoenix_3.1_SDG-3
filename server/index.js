require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env.local"),
});
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const notificationHistory = require("./notificationHistory");


const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

const RISK_ALERT_EMAIL = "eswardhavala1@gmail.com";

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    return null;
  }
  // Use custom host/port if set (Outlook, Yahoo, etc.) – then you can often use normal password
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }
  // For Gmail, explicitly use port 587 with STARTTLS to avoid IPv6/SSL issues
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use STARTTLS
    auth: { user, pass },
    // Force IPv4 to avoid IPv6 connection issues
    family: 4,
  });
}

app.post("/api/send-risk-alert", async (req, res) => {
  const { riskLevel, summary, message } = req.body || {};
  console.log(
    "[Risk alert] Received:",
    riskLevel ? "riskLevel=" + riskLevel : "missing riskLevel",
  );
  console.log("[Risk alert] Body:", JSON.stringify(req.body || {}));
  if (!riskLevel) {
    return res.status(400).json({ ok: false, error: "riskLevel is required" });
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      "[Risk alert] Email not configured (SMTP_USER/SMTP_PASS missing)",
    );
    return res.status(503).json({
      ok: false,
      error: "Email not configured. Set SMTP_USER and SMTP_PASS in .env.local",
    });
  }

  // Verify transporter before attempting to send mail so failures are explicit in logs
  try {
    await transporter.verify();
    console.log("[Risk alert] SMTP transporter verified");
  } catch (verifyErr) {
    console.error(
      "[Risk alert] Transporter verify failed:",
      verifyErr && (verifyErr.message || verifyErr),
    );
    return res
      .status(500)
      .json({
        ok: false,
        error:
          "SMTP transporter verify failed: " +
          (verifyErr && verifyErr.message
            ? verifyErr.message
            : String(verifyErr)),
      });
  }

  const subject = `[SafeMom] High risk identified: ${riskLevel}`;
  const text = [
    `Risk level: ${riskLevel}`,
    summary ? `Vitals summary: ${summary}` : "",
    message ? `\nAI assessment:\n${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>SafeMom – High risk identified</h2>
    <p><strong>Risk level:</strong> ${riskLevel}</p>
    ${summary ? `<p><strong>Vitals summary:</strong> ${summary}</p>` : ""}
    ${message ? `<h3>AI assessment</h3><pre style="white-space:pre-wrap;">${escapeHtml(message)}</pre>` : ""}
    <p><em>This is an automated alert from SafeMom. Please follow up with the mother/patient.</em></p>
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: RISK_ALERT_EMAIL,
      subject,
      text,
      html,
    });
    console.log("[Risk alert] Email sent to", RISK_ALERT_EMAIL, "info:", info);

    // Record successful notification
    notificationHistory.addNotification({
      status: 'success',
      riskLevel,
      recipient: RISK_ALERT_EMAIL,
      summary,
      messagePreview: message ? message.substring(0, 100) + '...' : '',
      messageId: info.messageId,
      response: info.response
    });

    res.json({ ok: true, info });
  } catch (err) {
    console.error("[Risk alert] Email failed:", err && (err.message || err));

    // Record failed notification
    notificationHistory.addNotification({
      status: 'failed',
      riskLevel,
      recipient: RISK_ALERT_EMAIL,
      summary,
      messagePreview: message ? message.substring(0, 100) + '...' : '',
      error: err.message || 'Unknown error'
    });

    res.status(500).json({
      ok: false,
      error: err.message || "Failed to send email",
    });
  }
});

// Get notification history
app.get("/api/notification-history", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const notifications = notificationHistory.getRecentNotifications(limit);
  res.json({ ok: true, notifications });
});

// Get notification statistics
app.get("/api/notification-stats", (req, res) => {
  const stats = notificationHistory.getStats();
  res.json({ ok: true, stats });
});

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


app.listen(PORT, () => {
  console.log(`SafeMom server running at http://localhost:${PORT}`);
});
