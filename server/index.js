require("dotenv").config({ path: require("path").resolve(__dirname, "../.env.local") });
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

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
  // Otherwise use "service" (e.g. gmail) – Gmail requires App Password, not normal password
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: { user, pass },
  });
}

app.post("/api/send-risk-alert", async (req, res) => {
  const { riskLevel, summary, message } = req.body || {};
  console.log("[Risk alert] Received:", riskLevel ? "riskLevel=" + riskLevel : "missing riskLevel");
  if (!riskLevel) {
    return res.status(400).json({ ok: false, error: "riskLevel is required" });
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.log("[Risk alert] Email not configured (SMTP_USER/SMTP_PASS missing)");
    return res.status(503).json({
      ok: false,
      error: "Email not configured. Set SMTP_USER and SMTP_PASS in .env.local",
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
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: RISK_ALERT_EMAIL,
      subject,
      text,
      html,
    });
    console.log("[Risk alert] Email sent to", RISK_ALERT_EMAIL);
    res.json({ ok: true });
  } catch (err) {
    console.error("[Risk alert] Email failed:", err.message || err);
    res.status(500).json({
      ok: false,
      error: err.message || "Failed to send email",
    });
  }
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
