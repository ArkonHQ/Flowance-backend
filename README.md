<div align="center">
  <h1>
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="30" />
    Flowance Backend
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="30" />
  </h1>

  <p><strong>The freelance command center — manage clients, projects, invoices, and financial insights from one API.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/status-in_development-yellow?style=flat-square" />
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" />
  </p>
</div>

---

## 📖 Overview

Flowance helps freelancers:

- Manage clients and projects  
- Track invoices and payments  
- Monitor monthly earnings  
- Analyze project performance  
- Receive deadline reminders  
- Track overdue and unpaid work  
- Organize tasks efficiently  

This repository contains the backend architecture and API layer powering the entire platform.

---

## 🛠️ Tech Stack

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express,postgres,typescript&perline=6" />
  </a>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Architecture-REST-ff69b4?style=flat-square" />
  <img src="https://img.shields.io/badge/Type-Safety_Ready-3178C6?style=flat-square&logo=typescript&logoColor=white" />
</div>

---

## ⚙️ Core Features

### Authentication
- Secure JWT authentication  
- Access & refresh tokens  
- Protected routes  
- Role‑based architecture ready

---

### Clients
- Create and manage clients  
- Track client‑related projects  
- Analyze client activity

---

### Projects
- Full lifecycle management  
- Status tracking: `Todo` → `In Progress` → `Hold` → `Completed` → `Cancelled`  
- Deadline monitoring  
- Progress insights

---

### Tasks
- Task organization inside projects  
- Completion tracking  
- Priority & status handling

---

### Invoices
- Generate invoices  
- Track paid / unpaid  
- Invoice status management

---

### Payments
- Record incoming payments  
- Payment history  
- Revenue analytics

---

### Dashboard Analytics
- Monthly earnings comparison  
- Revenue growth tracking  
- Active vs completed projects  
- Productivity insights  
- Financial overview

---

## 🧪 Planned Features

<details>
  <summary>Click to expand</summary>
  <br/>

- Smart reminders & notifications  
- Client risk analysis  
- Email notifications  
- Background jobs  
- Activity logs  
- File uploads  
- Integrations with freelance platforms  
- AI‑powered insights
</details>

---

## 🧱 Architecture

```bash
src/
│
├── modules/
│   ├── auth/
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   ├── invoices/
│   └── dashboard/
│
├── config/
├── database/
└── utils/
