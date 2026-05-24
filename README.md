# NexusCorp AI CRM

> An Enterprise-Grade AI-Powered CRM & Workforce Management Platform built with the MERN Stack.

---

## Overview

NexusCorp AI CRM is a modern full-stack SaaS-style application designed to manage:

- Employees
- Teams
- Attendance
- Calendar Events
- AI Insights
- Workforce Analytics
- Authentication & Security

The platform provides a futuristic enterprise dashboard experience with multi-user isolated workspaces powered by MongoDB and JWT Authentication.

---

# Features

## Authentication System
- JWT-based Authentication
- Secure Login & Registration
- Password Hashing using bcrypt
- Persistent Login Sessions
- Protected Routes
- Logout System
- Multi-user Support

---

## Employee Management
- Add Employees
- Edit Employee Details
- Delete Employees
- Employee Search & Filtering
- Department & Team Organization
- Employee Performance Tracking
- Revenue & Productivity Metrics

---

## Smart Calendar System
- Meetings
- Deadlines
- Reminders
- Holidays
- Personal Events
- Event Management System
- MongoDB Calendar Storage

---

## Attendance Management
- Check-In / Check-Out
- Work Hours Calculation
- Leave Requests
- Attendance Tracking
- Leave Status Management

---

## AI Insights Dashboard
- AI Performance Analytics
- Employee Burnout Prediction
- Smart Recommendations
- Automated Insights
- Productivity Analysis
- Revenue Analytics
- Team Performance Charts

---

## Multi-User SaaS Architecture

Each user gets:
- Separate Dashboard
- Separate Employees
- Separate Attendance
- Separate Calendar
- Separate Analytics

User data isolation is implemented using:

```js
userId
```

---

# Tech Stack

## Frontend
- React.js
- Vite
- Axios
- Context API
- Modern CSS
- Responsive UI

---

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

---

# Project Structure

```bash
NexusCorp-AI-CRM/
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── components/
│   │   ├── styles/
│   │   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

---

# ⚡ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/nexuscorp-ai-crm.git
```

---

## 2️⃣ Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 3️⃣ Install Backend Dependencies

```bash
cd server
npm install
```

---

# Environment Variables

Create `.env` inside `server/`

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

---

# ▶Run Application

## Start Backend

```bash
cd server
npm run server
```

---

## Start Frontend

```bash
cd client
npm run dev
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |

---

## Employees

| Method | Endpoint |
|---|---|
| GET | `/api/employees` |
| POST | `/api/employees` |
| PUT | `/api/employees/:id` |
| DELETE | `/api/employees/:id` |

---

## Attendance

| Method | Endpoint |
|---|---|
| GET | `/api/attendance` |
| POST | `/api/attendance` |
| PUT | `/api/attendance/:id` |
| DELETE | `/api/attendance/:id` |

---

## Events

| Method | Endpoint |
|---|---|
| GET | `/api/events` |
| POST | `/api/events` |
| DELETE | `/api/events/:id` |

---

# Security Features

- Password Encryption
- JWT Authorization
- Protected APIs
- User Data Isolation
- Secure Authentication Flow

---

# UI Highlights

- Modern Enterprise UI
- Futuristic Dashboard
- Responsive Design
- Animated Components
- Professional CRM Layout
- AI Analytics Panels

---

# Future Enhancements

- AI Chat Assistant
- Email Integration
- Real-time Notifications
- Video Meeting System
- Advanced AI Predictions
- Role-Based Access Control
- File Upload System
- Dark/Light Theme Toggle

---

# Deployment

## Frontend
- Vercel
- Netlify

## Backend
- Render
- Railway
- Cyclic

## Database
- MongoDB Atlas

---

#  Author

## Soham Ghosh

AI Developer • MERN Stack Developer • AI SaaS Builder

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Final Note

NexusCorp AI CRM is not just a CRUD project — it is a scalable enterprise SaaS-style AI platform demonstrating:

- Full Stack Development
- Authentication Systems
- Multi-user Architecture
- AI Dashboard Engineering
- Secure Backend APIs
- Modern UI/UX Design

🚀