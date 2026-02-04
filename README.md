## SafeMOM – Safe Maternal Ongoing Monitoring Band

SafeMOM (**Safe Maternal Ongoing Monitoring Band**) is a hardware–software platform that continuously tracks key maternal vitals using a smart band and provides AI‑assisted risk assessment, dashboards for mothers, doctors, and ASHA workers, and high‑risk alerts via email.

The goal is **early detection of maternal complications** by combining:

- **Hardware**: A wearable smart band with sensors (Heart Rate, SpO₂, Blood Pressure, Stress, Glucose proxy, etc.).
- **Software**: This web application for visualization, AI risk analysis, care coordination, and alerts.

---

### What this project does

- **Continuously monitors maternal health** using vitals streamed from a smart band.
- **Classifies risk level** (Normal, Moderate, High, Risky) using an AI model (Google Gemini).
- **Notifies healthcare providers** by email whenever the risk is **High** or **Risky**.
- **Provides separate dashboards** for:
  - **Mothers** – simple, friendly view of their health and AI advice.
  - **Doctors** – clinical overview, high‑risk lists, visit history, and trends.
  - **ASHA workers** – field‑level view of high‑risk mothers and follow‑up actions.
- **Stores and visualizes history** of vitals and risk trends per mother.

---

## Live Vitals & Hardware Integration

- **Smart band sensors** measure:
  - Heart rate (bpm)
  - Stress / HRV index
  - SpO₂ (%)
  - Blood pressure (mmHg)
  - Glucose proxy (mg/dL, from compatible sensors)
- The band (or a gateway device / mobile app) **pushes these vitals to the backend**, which the web app reads to show:
  - Real‑time vitals tiles (heart, SpO₂, BP, glucose, stress).
  - Color‑coded status: **Normal**, **Moderate**, **Risky**.
  - Animated, easy‑to‑understand UI for mothers and ASHA workers.
- In the current demo, vitals can be **entered / simulated in the UI**, but the architecture is designed so that:
  - Band → Gateway / edge device → SafeMOM backend API → Frontend.
  - The same risk analysis and alerts logic works when connected to real hardware.

The **AI risk engine** takes these vitals (plus symptoms) and returns:

- Text explanation (what is wrong, what to watch).
- **Overall risk label**: **Risky**, **High**, **Moderate**, or **Normal**.
- Clear, non‑technical advice for the mother and suggestions for follow‑up.

Whenever the AI result is **High** or **Risky**, the system also triggers an **email alert** to a configured care‑team mailbox (e.g. `eswardhavala1@gmail.com`).

---

## Key Features

- **Multi‑role access**
  - **Mother dashboard** – pregnancy overview, vitals history, AI chatbot, and personalized reports.
  - **Doctor dashboard** – high‑risk patients list, visit history, charts, and clinical notes.
  - **ASHA dashboard** – village‑level list of pregnant women, high‑risk flags, and follow‑up tracking.

- **AI‑powered risk assessment**
  - Integrates with **Google Gemini** for maternal health reasoning.
  - Considers vitals + symptoms (tiredness, headache/fever, abdominal pain, swelling, blurred vision).
  - Returns **Risky / High / Moderate / Normal** with human‑readable explanation and disclaimer.

- **Live vitals visualization**
  - Beautiful, animated tiles for heart rate, stress, SpO₂, BP, and glucose.
  - Color‑coding and micro‑animations to show status and trends at a glance.

- **Alerts & notifications**
  - When AI classifies risk as **High** or **Risky**, the backend sends an email alert via **Nodemailer**.
  - Alert email contains: risk level, vitals summary, and the AI’s explanation for quick triage.

- **Maternal reports**
  - Generates a full maternal health report (HTML / printable) for each mother.
  - Summarizes history, chronic conditions, vitals, risk trends, and recommendations.

- **Smart onboarding & sign‑up**
  - Demo logins for doctor, ASHA, and a sample mother (Priya).
  - Additional mothers can sign up and then be viewed in dashboards.

---

## Demo Login Details

Use these accounts on the **Login** screen. First choose the role in the app, then enter the email and password.

- **Doctor**
  - **Email**: `doctor@safemom.com`
  - **Password**: `doctor123`

- **ASHA worker**
  - **Email**: `asha@safemom.com`
  - **Password**: `asha123`

- **Mother (Priya – demo profile)**
  - **Email**: `priya@safemom.com`
  - **Password**: `priya123`

- **Additional mothers**
  - Can be created through the **Sign Up** flow in the app.
  - After sign‑up, mothers log in with **their own email and password**.

---

## Tech Stack

- **Frontend**
  - React 18 + TypeScript
  - Vite
  - Tailwind CSS
  - shadcn‑ui & Radix UI
  - React Router
  - Framer Motion (animations)

- **AI & backend**
  - Google Gemini (`@google/genai`) for:
    - Vitals analysis & risk classification
    - Maternal health reports
    - Chatbot assistant
  - Node.js + Express server (in `server/`) for:
    - High‑risk email alerts via Nodemailer.

---

## Project Structure

- **`src/`**
  - **`pages/`**
    - `Login.tsx`, `SignUp.tsx`, `RoleSelect.tsx`
    - `MotherDashboard.tsx`, `PatientDetails.tsx`, `PatientProfile.tsx`
    - `AIBots.tsx`, `LiveVitals.tsx`, `Index.tsx`
  - **`components/`**
    - Reusable UI elements (Navbar, cards, vitals widgets, chatbot, etc.).
  - **`contexts/AuthContext.tsx`**
    - Role‑based auth and demo users (doctor, ASHA, Priya).
  - **`lib/gemini.ts`**
    - All integration with the Google Gemini API for vitals, chat, and reports.
  - **`data/`**
    - Static/demo data for patients and mother profiles.

- **`server/`**
  - Minimal Express + Nodemailer service:
    - Endpoint: `POST /api/send-risk-alert`
    - Sends high‑risk email alerts to a configured mailbox.

---

## Getting Started (Development)

### 1. Prerequisites

- **Node.js** (LTS recommended)
- **npm** (comes with Node)
- A **Google Gemini API key** – from `https://aistudio.google.com/apikey`
- An **SMTP account** for sending emails (e.g. Gmail with App Password, or Outlook, etc.)

### 2. Clone and install

```bash
git clone <YOUR_REPO_URL>
cd SafeMom/SafeMom
npm install
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here

SMTP_USER=your_email@example.com
SMTP_PASS=your_password_or_app_password

# Optional for non‑Gmail providers:
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_SECURE=false

# Optional:
# SMTP_SERVICE=gmail
# SMTP_FROM=SafeMOM Alerts <your_email@example.com>
# SERVER_PORT=3001
```

> **Note:** For **Gmail**, you must use an **App Password** (16 characters, no spaces) rather than your normal account password.

### 4. Run the backend (email alert server)

From the `server/` folder:

```bash
cd server
npm install
npm start
```

This starts the Node/Express server at `http://localhost:3001`.  
Vite is configured to **proxy `/api`** calls to this server in development.

### 5. Run the frontend

In another terminal, from `SafeMom/SafeMom`:

```bash
npm run dev
```

Open the URL printed in the terminal (by default `http://localhost:8080`).

---

## How the AI Risk & Alerts Work

- The frontend collects:
  - **Vitals** from the band (or from the form in this demo).
  - **Symptoms** (tiredness, headache/fever, abdominal pain, swelling, blurred vision/dizziness).
  - Optional **mother profile** (age, gestation, chronic conditions, etc.).
- It sends this data to a Gemini model via `lib/gemini.ts`.
- Gemini returns a **text explanation** + **overall risk label**:
  - **Risky**, **High**, **Moderate**, or **Normal**.
- The chatbot component parses the response to detect the risk level.

If the risk is **High** or **Risky**:

- The frontend calls `POST /api/send-risk-alert` with:
  - risk level
  - vitals summary
  - full AI explanation
- The Node/Express server uses **Nodemailer** and your SMTP credentials to send an alert email to:
  - `eswardhavala1@gmail.com` (configurable in `server/index.js`).

This provides **end‑to‑end flow**:

1. Band → vitals.
2. SafeMOM AI → risk classification.
3. SafeMOM backend → **email alert to care team**.

---

## Production Notes

- Replace demo email recipients and SMTP credentials with production‑grade accounts.
- Secure all secrets (.env files, secret managers, CI/CD variables).
- Connect the frontend to your real band / gateway API instead of simulated vitals.
- Add authentication & authorization layers suitable for clinical deployments.

SafeMOM is designed as a **foundation** for full maternal remote‑monitoring solutions that combine **IoT hardware** and **intelligent software** to save lives through earlier detection and faster response.

---

## Problem & Impact

- **Maternal complications are often detected too late**, especially in low‑resource or rural settings.
- Vitals like **blood pressure, SpO₂, heart rate, and glucose** can silently drift into dangerous ranges between clinic visits.
- ASHA workers and doctors often **see the mother only during scheduled visits**, not when she first becomes high‑risk.

SafeMOM aims to:

- **Catch risk earlier** by monitoring vitals continuously instead of only in the hospital.
- **Bridge home and hospital** by giving ASHA workers and doctors a live view of their mothers’ status.
- **Empower mothers** with clear, simple explanations rather than raw numbers.

Even as a prototype, the system demonstrates how a **low‑cost band + intelligent software** can:

- Reduce time to intervention.
- Prioritize truly high‑risk cases for doctors.
- Support community health workers (ASHA) with data‑driven decisions.

---

## Hardware Architecture (Band → App → Cloud)

High‑level data flow:

1. **SafeMOM Band (hardware)**
   - Collects heart rate, SpO₂, blood pressure, stress index, movement, and (optionally) glucose proxy.
2. **Gateway / Mobile App**
   - Connects to the band via Bluetooth.
   - Packages vitals and sends them securely to the SafeMOM backend API.
3. **SafeMOM Backend**
   - Receives vitals, stores history, and triggers the AI risk pipeline.
   - When risk is High/Risky, sends **email alerts** to care teams.
4. **SafeMOM Web App (this repo)**
   - Dashboards for mother, doctor, and ASHA.
   - Chatbot and reports for explaining the data in simple language.

In this codebase, steps 3 and 4 are implemented; the band/gateway side can plug into the same API endpoints to replace the current simulated inputs.

---

## Data Privacy & Safety

This repository is a **demo / prototype** and not a certified medical product. However, it is designed with the following principles:

- **Health data is sensitive**: deployments should use HTTPS, encrypted storage, and proper access control.
- **Environment variables** are used for all secrets (API keys, SMTP credentials); they should not be committed to Git.
- **AI limitations**: every AI answer includes a **medical disclaimer** reminding users to consult healthcare providers.

For real clinical use, deployments must follow local regulations (e.g. HIPAA, NDHM/ABDM, GDPR, etc.) and undergo proper validation.

---

## Example User Journeys

- **Priya (Mother)**
  1. Wears the SafeMOM band at home.
  2. Opens the SafeMOM app and logs in as a mother (`priya@safemom.com` / `priya123`).
  3. Sees her latest vitals and AI explanation on the dashboard.
  4. Uses the chatbot to ask questions like “Is my BP okay today?”.
  5. Downloads a **maternal report** to show to her doctor.

- **Doctor**
  1. Logs in as a doctor (`doctor@safemom.com` / `doctor123`).
  2. Sees a **high‑risk list** of mothers and their current risk levels.
  3. Clicks into a patient to view trends of BP, SpO₂, and other vitals over time.
  4. Uses the AI report to quickly understand the overall situation and plan follow‑up.

- **ASHA Worker**
  1. Logs in as ASHA (`asha@safemom.com` / `asha123`).
  2. Views all mothers in her area, with clear **High / Medium / Low** risk flags.
  3. Filters to see only **high‑risk mothers** before home visits.
  4. Uses the app during a visit to show the latest vitals and AI explanation to the family.

---

## Limitations & Future Work

Current limitations:

- Vitals in the demo are **simulated / user‑entered**; real deployments must connect to the band’s firmware / gateway API.
- Authentication is simplified and uses demo accounts; no advanced RBAC or multi‑tenant isolation is implemented yet.
- Alerts are sent only via **email** to a single configured mailbox.

Planned / possible future enhancements:

- **Full hardware integration** with the production SafeMOM band and mobile gateway app.
- **SMS / WhatsApp alerts** to ASHA workers and family members for critical events.
- **Multi‑language support** (e.g. Hindi, Telugu, etc.) for chatbot and UI.
- **Offline‑first workflows** for ASHA workers in low‑connectivity areas.
- Integration with **government health systems** and EMR platforms.

