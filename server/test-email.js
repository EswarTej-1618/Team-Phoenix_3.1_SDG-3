require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env.local"),
});
const nodemailer = require("nodemailer");

console.log("=== Email Configuration Test ===\n");

// Check environment variables
console.log("1. Environment Variables:");
console.log("   SMTP_USER:", process.env.SMTP_USER || "NOT SET");
console.log("   SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");
console.log("   SMTP_SERVICE:", process.env.SMTP_SERVICE || "gmail (default)");
console.log("   SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
console.log("   SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
console.log("   SMTP_SECURE:", process.env.SMTP_SECURE || "NOT SET");
console.log("");

// Create transporter
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error("ERROR: SMTP_USER or SMTP_PASS not set!");
    return null;
  }
  
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  
  if (host) {
    console.log("2. Using custom SMTP host configuration");
    return nodemailer.createTransport({
      host,
      port: port ? parseInt(port, 10) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
  }
  
  console.log("2. Using service-based configuration (Gmail)");
  return nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "gmail",
    auth: { user, pass },
  });
}

async function testEmail() {
  const transporter = getTransporter();
  if (!transporter) {
    console.error("Failed to create transporter!");
    process.exit(1);
  }

  console.log("\n3. Verifying SMTP connection...");
  try {
    await transporter.verify();
    console.log("   ✓ SMTP connection verified successfully!");
  } catch (err) {
    console.error("   ✗ SMTP verification failed:");
    console.error("   Error:", err.message);
    console.error("\n   Common issues:");
    console.error("   - For Gmail: You need an App Password, not your regular password");
    console.error("   - Go to: https://myaccount.google.com/apppasswords");
    console.error("   - Enable 2-Step Verification first");
    console.error("   - Generate an App Password and use it in SMTP_PASS");
    process.exit(1);
  }

  console.log("\n4. Sending test email...");
  const RISK_ALERT_EMAIL = "eswardhavala1@gmail.com";
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: RISK_ALERT_EMAIL,
      subject: "[SafeMom TEST] Email Configuration Test",
      text: "This is a test email from SafeMom. If you receive this, email alerts are working correctly!",
      html: `
        <h2>SafeMom Email Test</h2>
        <p>This is a test email from SafeMom.</p>
        <p><strong>If you receive this, email alerts are working correctly!</strong></p>
        <p><em>Sent at: ${new Date().toLocaleString()}</em></p>
      `,
    });
    
    console.log("   ✓ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    console.log("\n✓ All tests passed! Email functionality is working.");
  } catch (err) {
    console.error("   ✗ Failed to send email:");
    console.error("   Error:", err.message);
    console.error("\n   Full error:", err);
    process.exit(1);
  }
}

testEmail();
