# AI Club Portal

A centralized learning and project management platform built for the AI Club. The portal provides separate workspaces for **Admins, Mentors, and Students**, allowing the club to manage learning resources, teams, tasks, projects, notifications, and member activities from one place.

---

## 🚀 Overview

The AI Club Portal is designed to bring the complete club workflow into a single platform.

Instead of managing learning resources, tasks, projects, teams, and communication across multiple platforms, the portal provides a centralized workspace for club members and mentors.

### Main Areas

- 👨‍💼 Admin Management
- 👨‍🏫 Mentor Workspace
- 👨‍🎓 Student Workspace
- 📚 Learning Management
- ✅ Task Management
- 🚀 Project Management
- 👥 Team Management
- 🔔 Notifications
- 📈 Learning Updates
- ⚙️ Account Settings

---

## ✨ Features

### 👨‍💼 Admin

Administrators have complete control over the portal.

- Manage users
- Manage mentors
- Manage students
- Manage teams
- Manage learning resources
- Manage tasks
- Manage projects
- View and manage club data
- Administrative dashboard

---

### 👨‍🏫 Mentor

Mentors can manage the students and teams assigned to them.

- Mentor dashboard
- View assigned teams
- View team members
- Manage learning resources
- Assign tasks
- Create and manage projects
- Send notifications to students
- View notification history
- Manage account settings

---

### 👨‍🎓 Student

Students get their own personalized workspace.

- Student dashboard
- Access learning resources
- Learning updates
- Learning journal
- View assigned tasks
- Track project information
- View team members
- Receive mentor notifications
- Manage account settings

---

## 🔐 Role-Based Access

The portal uses role-based authentication.

There are three primary roles:

| Role | Access |
|------|--------|
| ADMIN | Full portal management |
| MENTOR | Assigned teams, students and learning management |
| STUDENT | Personal learning, tasks, projects and team workspace |

Users do not select their role during login. The role is retrieved from their account and used to control access.

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Next/Image
- Next Navigation

### Backend

- Next.js App Router
- Next.js Route Handlers
- NextAuth.js
- Node.js

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Authentication

- NextAuth.js
- Credentials Provider
- JWT Sessions
- bcryptjs

---

## 📁 Project Structure

```text
aiclubportal/
│
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── learning/
│   │   ├── members/
│   │   ├── mentors/
│   │   ├── projects/
│   │   ├── settings/
│   │   ├── tasks/
│   │   ├── teams/
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── admin/
│   │   │   ├── learning/
│   │   │   ├── members/
│   │   │   ├── projects/
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   └── teams/
│   │   │
│   │   ├── auth/
│   │   │
│   │   ├── mentor/
│   │   │   ├── dashboard/
│   │   │   ├── learning/
│   │   │   ├── learning-updates/
│   │   │   ├── members/
│   │   │   ├── notifications/
│   │   │   ├── projects/
│   │   │   ├── settings/
│   │   │   ├── tasks/
│   │   │   └── teams/
│   │   │
│   │   └── student/
│   │       ├── learning/
│   │       ├── learning-updates/
│   │       ├── notifications/
│   │       │   └── [id]/
│   │       └── settings/
│   │
│   ├── login/
│   │
│   ├── mentor/
│   │   ├── dashboard/
│   │   ├── learning/
│   │   ├── learning-updates/
│   │   ├── members/
│   │   ├── notifications/
│   │   ├── projects/
│   │   ├── settings/
│   │   └── tasks/
│   │
│   ├── student/
│   │   ├── dashboard/
│   │   ├── learning/
│   │   ├── learning-journal/
│   │   ├── notifications/
│   │   ├── projects/
│   │   ├── settings/
│   │   ├── tasks/
│   │   └── team/
│   │
│   ├── page.tsx
│   ├── providers.tsx
│   └── layout.tsx
│
├── lib/
│   ├── auth.ts
│   └── mongodb.ts
│
├── models/
│   ├── User.ts
│   ├── Team.ts
│   ├── Task.ts
│   ├── Project.ts
│   ├── Learning.ts
│   ├── LearningUpdate.ts
│   └── Notification.ts
│
├── public/
│   └── ai-club-logo.png
│
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md