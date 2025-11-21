# EduPay Portal – Student Refund Automation

EduPay Portal replaces the manual, paper-bound refund process with a guided digital workflow that students, HoDs, and Accounts teams can use from any browser.

## Tech Stack

- **Frontend:** HTML, CSS, vanilla JavaScript (no heavy SPA framework for faster iteration)
- **Backend:** Node.js with Express.js
- **Database:** MySQL (request, user, document, and notification metadata)
- **APIs:** RESTful JSON endpoints + multipart uploads; optional SMTP integration via Nodemailer

## Key Features

- Student self-service registration, login, and refund submission with file uploads
- Context-aware navigation: submit claims, track status, withdraw, or add more documents
- Automated workflow routing (Student → HoD → Accounts) with per-role dashboards
- Admin verification panel with Approve, Request More Info, Reject, or Complete actions
- Notification banner + email alerts on every important status change
- Transparent history via claim timelines and notification logs

## Architecture & Workflow

1. **Authentication / Roles** – Students self-register; HoD & Accounts users are provisioned by admins (SQL seed). JWT secures API calls, and role middleware protects routes.
2. **Submission** – Students fill an HTML form, attach PDFs/images, and hit submit. Express + Multer store metadata and files; status begins as SUBMITTED and stage HOD.
3. **HoD Review** – HoD signs in to /pages/admin.html, views pending claims, and either approves (push to Accounts), requests more info (bounce to student), or rejects.
4. **Accounts Verification** – Accounts approves (moves to APPROVED) or completes (marks COMPLETED and simulates disbursement).
5. **Notifications** – Every transition calls the notification service, which stores the alert, shows it on dashboards, and sends an email via SMTP or a stub transport.

## Getting Started

1. **Install prerequisites**
   - Node.js ≥ 18
   - MySQL 8 (or compatible)
2. **Clone & install**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy config/env.example to .env and fill in MySQL + SMTP credentials.
4. **Prepare the database**
   ```sql
   SOURCE database/schema.sql;
   ```
   Seed HoD & Accounts accounts manually (set `role` column accordingly and hash passwords with bcrypt if not using the API).
5. **Run the prototype**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4000/index.html`.

## API Highlights

| Method & Path | Role | Purpose |
| ------------- | ---- | ------- |
| POST /api/auth/register | Public | Student registration |
| POST /api/auth/login | Public | Obtain JWT |
| POST /api/claims | Student | Submit refund + documents |
| GET /api/claims | Student | List own claims |
| POST /api/claims/:id/withdraw | Student | Cancel while under review |
| POST /api/claims/:id/additional-docs | Student | Upload more files |
| GET /api/claims/admin/pending | HoD/Accounts | Review queue |
| PATCH /api/claims/:id/status | HoD/Accounts | Approve, request info, reject, complete |
| GET /api/notifications | Any authenticated | Recent notifications |

## Frontend Pages & Flows

- index.html – Login with banner notifications.
- pages/register.html – Register then auto-redirect to submission.
- pages/submit.html – Student submission form, redirects to status after success.
- pages/status.html – Track claims; context-sensitive Withdraw / Upload buttons.
- pages/admin.html – Admin review console with role-aware workflow buttons.

## Next Steps

- Plug in a live SMTP provider or SMS gateway.
- Add audit reporting & analytics for finance teams.
- Deploy to a PaaS (Render / Railway / Azure) with managed MySQL.

