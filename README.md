# Enterprise Feature Flag & Environment Management System

A centralized enterprise platform for managing application features, controlled releases, environments, user-specific access, percentage-based rollouts, scheduled activation, analytics, audit history, and rollback — without requiring application redeployment.

---

## 📌 Overview

The **Enterprise Feature Flag & Environment Management System** provides a centralized control layer for dynamically managing application features across different environments.

Instead of modifying application code and redeploying whenever a feature needs to be enabled or disabled, administrators and authorized users can control feature availability through a web-based management platform.

The system supports:

* Feature flag creation and management
* Enable/disable controls
* Development, Testing, Staging, and Production environments
* Percentage-based feature rollouts
* User-specific feature assignments
* Scheduled feature activation
* Feature evaluation
* Usage analytics
* Audit logs
* Rollback support
* Role-based access control
* Enterprise dashboard

---

## 🎯 Project Objective

The main objective is to provide a **centralized feature management platform** that allows organizations to safely release, test, control, monitor, and roll back application features without redeploying the application.

### Core Principle

> **Control when, where, and for whom application features are available.**

---

## 🚀 Key Features

### 🔐 Authentication & Security

* User registration
* User login
* JWT authentication
* Secure password hashing
* Protected API endpoints
* Active/inactive user control
* Role-based authorization

### 👥 Role-Based Access Control

Supported roles include:

* **ADMIN**
* **DEVELOPER**
* **USER**

Different roles receive different permissions for managing features, environments, rollouts, assignments, analytics, and audit information.

---

### 🚩 Feature Flag Management

Administrators and authorized users can:

* Create feature flags
* Update feature details
* Enable features
* Disable features
* Configure default values
* Delete feature flags
* Search and manage feature flags

Example:

```text
Feature Key:
new_dashboard

Name:
New Dashboard V2

Status:
Enabled / Disabled

Default Value:
True / False
```

---

### 🌎 Environment Management

The system supports multiple environments:

```text
Development
Testing
Staging
Production
```

Each environment can be:

* Created
* Updated
* Activated
* Deactivated
* Deleted

This allows the same feature to behave differently depending on the deployment environment.

---

### 🚀 Percentage-Based Rollouts

Features can be released gradually using percentage-based rollout strategies.

Example:

```text
Feature:
New Dashboard

Environment:
Production

Rollout:
50%
```

This allows organizations to expose a feature to a controlled percentage of users before making it fully available.

---

### 👤 User-Specific Feature Access

Specific users can be granted or denied access to individual features.

Example:

```text
User:
Naresh Kumar

Feature:
Dark Mode

Assignment:
Enabled
```

User-specific assignments take priority during feature evaluation.

---

### ⏰ Scheduled Feature Activation

Feature rollouts can be configured with:

* Scheduled start time
* Scheduled end time
* Priority
* Rollout percentage
* Enable/disable status

Example:

```text
Feature:
New Dashboard

Start:
24 September 2026 10:00

End:
30 September 2026 23:59

Rollout:
75%
```

---

### 🧠 Feature Evaluation Engine

The feature evaluation engine determines whether a feature should be enabled for a specific user and environment.

Evaluation priority:

```text
1. User-Specific Assignment
          ↓
2. Scheduled Rollout
          ↓
3. Percentage Rollout
          ↓
4. Feature Flag Configuration
          ↓
5. Environment Default
          ↓
6. Disabled
```

Example request:

```json
{
  "feature_key": "dark_mode",
  "environment_name": "DEVELOPMENT",
  "user_id": 1
}
```

Example response:

```json
{
  "feature_key": "dark_mode",
  "environment": "DEVELOPMENT",
  "user_id": 1,
  "enabled": true,
  "source": "USER_ASSIGNMENT",
  "message": "Feature evaluated using user-specific assignment"
}
```

---

### 📊 Feature Usage Analytics

Every valid feature evaluation can be recorded for analytics.

The analytics system tracks:

* Total evaluations
* Enabled evaluations
* Disabled evaluations
* Enabled percentage
* Unique features
* Unique users
* Environment-level usage
* Feature-level usage

This provides visibility into how features are being used.

---

### 📈 Dashboard

The enterprise dashboard provides a centralized overview of:

* Total features
* Enabled features
* Disabled features
* Total environments
* Active environments
* Total rollouts
* Active rollouts
* Total feature evaluations
* Enabled evaluations
* Disabled evaluations
* Unique users
* Recent audit activity

---

### 📝 Audit Logs

Important changes are recorded in audit logs.

Tracked actions include:

* Feature creation
* Feature updates
* Feature enable/disable
* Environment changes
* Rollout changes
* Assignments
* Rollbacks

Each audit record can contain:

```text
User
Action
Entity Type
Entity ID
Old Value
New Value
IP Address
Timestamp
```

This provides traceability for configuration changes.

---

### ↩️ Rollback Support

The system supports rollback of previously recorded configuration changes.

Rollback can restore previous feature or rollout configurations using audit history.

Example:

```text
Previous:
enabled = true

Rollback:

enabled = false
```

The rollback operation itself is also recorded in the audit logs.

---

## 🏗️ System Architecture

```text
                    ┌───────────────────────────┐
                    │       React Frontend      │
                    │                           │
                    │ React + TypeScript + MUI  │
                    │ Axios + React Router      │
                    │ Chart.js                  │
                    └─────────────┬─────────────┘
                                  │
                                  │ REST API
                                  ▼
                    ┌───────────────────────────┐
                    │      FastAPI Backend      │
                    │                           │
                    │ JWT Authentication        │
                    │ RBAC                      │
                    │ Feature Management        │
                    │ Rollout Engine             │
                    │ Evaluation Engine          │
                    │ Analytics                  │
                    │ Audit Logs                 │
                    │ Rollback                   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌──────────────────┐       ┌──────────────────┐
          │     MySQL 8.0    │       │      Redis       │
          │                  │       │                  │
          │ Persistent Data  │       │ Fast Caching     │
          │ Feature Config   │       │ Feature State    │
          │ Audit History    │       │                 │
          └──────────────────┘       └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

| Technology   | Purpose                    |
| ------------ | -------------------------- |
| React.js     | UI development             |
| TypeScript   | Type safety                |
| Vite         | Frontend development/build |
| Material UI  | UI components              |
| Axios        | API communication          |
| React Router | Application routing        |
| Chart.js     | Analytics visualization    |

### Backend

| Technology     | Purpose                             |
| -------------- | ----------------------------------- |
| Python 3.12    | Backend development                 |
| FastAPI        | REST API framework                  |
| SQLAlchemy     | ORM                                 |
| Alembic        | Database migrations                 |
| JWT            | Authentication                      |
| Passlib/Bcrypt | Password hashing                    |
| Redis          | Caching and fast feature evaluation |
| Pydantic       | Request/response validation         |

### Database

```text
MySQL 8.0
```

### Development Tools

```text
Visual Studio Code
MySQL Workbench
Swagger / OpenAPI
Postman
Git
GitHub
Docker
PowerShell
```

---

## 🗄️ Database Design

The system uses the following primary tables:

```text
roles
users
feature_flags
environments
feature_rollouts
user_assignments
feature_usage
audit_logs
```

### Relationship Overview

```text
Roles
  │
  └── Users
        │
        ├── User Assignments
        │        │
        │        └── Feature Flags
        │
        └── Audit Logs

Feature Flags
  │
  ├── Feature Rollouts
  │        │
  │        └── Environments
  │
  ├── User Assignments
  │
  └── Feature Usage

Environments
  │
  ├── Feature Rollouts
  └── Feature Usage
```

---

## 📁 Project Structure

```text
Feature Flag And Environment Management System/
│
├── backend/
│   │
│   ├── alembic/
│   │   └── versions/
│   │
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── role.py
│   │   │   ├── feature_flag.py
│   │   │   ├── environment.py
│   │   │   ├── feature_rollout.py
│   │   │   ├── user_assignment.py
│   │   │   ├── audit_log.py
│   │   │   └── feature_usage.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── feature_flag.py
│   │   │   ├── environment.py
│   │   │   ├── rollout.py
│   │   │   ├── audit.py
│   │   │   ├── feature_evaluation.py
│   │   │   ├── rollback.py
│   │   │   ├── analytics.py
│   │   │   └── dashboard.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── feature_flags.py
│   │   │   ├── environments.py
│   │   │   ├── rollouts.py
│   │   │   ├── assignments.py
│   │   │   ├── analytics.py
│   │   │   ├── audit_logs.py
│   │   │   ├── feature_evaluation.py
│   │   │   ├── rollback.py
│   │   │   ├── dashboard.py
│   │   │   ├── users.py
│   │   │   └── rbac_test.py
│   │   │
│   │   ├── services/
│   │   │   ├── feature_service.py
│   │   │   ├── rollout_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── rollback_service.py
│   │   │   └── dashboard_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── .env
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
│
├── frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── features/
│   │   │   ├── environments/
│   │   │   ├── rollouts/
│   │   │   ├── analytics/
│   │   │   ├── audit/
│   │   │   └── assignments/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── postman/
│   └── Feature-Flag-System.postman_collection.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## ⚙️ Backend Setup

### 1. Navigate to backend

```powershell
cd "C:\Users\nares\Desktop\Feature Flag And Environment Management System\backend"
```

### 2. Create virtual environment

```powershell
python -m venv venv
```

### 3. Activate virtual environment

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
pip install -r requirements.txt
```

### 5. Configure environment variables

Create/update:

```text
backend/.env
```

Example:

```env
APP_NAME=Feature Flag & Environment Management System
APP_VERSION=1.0.0
DEBUG=True

DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/feature_flag_management

JWT_SECRET_KEY=change-this-to-a-strong-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

Replace `YOUR_MYSQL_PASSWORD` with your local MySQL password.

---

## 🗃️ Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE feature_flag_management;
```

Run migrations:

```powershell
alembic upgrade head
```

Verify the database connection:

```powershell
python test_db.py
```

Expected:

```text
Database connection successful!
Result: 1
```

---

## ▶️ Run Backend

From the `backend` directory:

```powershell
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

OpenAPI documentation:

```text
http://127.0.0.1:8000/redoc
```

Health check:

```text
http://127.0.0.1:8000/health
```

---

## 💻 Frontend Setup

Open a new PowerShell terminal.

Navigate to:

```powershell
cd "C:\Users\nares\Desktop\Feature Flag And Environment Management System\frontend"
```

Install dependencies:

```powershell
npm install
```

Run the frontend:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔑 Authentication Flow

```text
User
 │
 ▼
Login
 │
 ▼
FastAPI Authentication API
 │
 ▼
Validate Email + Password
 │
 ▼
Generate JWT
 │
 ▼
Frontend stores Access Token
 │
 ▼
Axios Authorization Header
 │
 ▼
Protected API
```

Protected requests use:

```text
Authorization: Bearer <access_token>
```

---

## 🔄 Feature Evaluation Flow

```text
Application
     │
     ▼
Feature Evaluation Request
     │
     ▼
Find Feature Flag
     │
     ▼
Find Environment
     │
     ▼
Check User Assignment
     │
     ├── Found → Return Assignment Result
     │
     ▼
Check Scheduled Rollout
     │
     ├── Active → Evaluate Rollout
     │
     ▼
Check Percentage Rollout
     │
     ├── Match → Enable
     │
     ▼
Check Feature Configuration
     │
     ▼
Environment Default
     │
     ▼
Return Final Result
     │
     ▼
Record Feature Usage
```

---

## 🔌 Important API Endpoints

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Feature Flags

```text
GET    /feature-flags
POST   /feature-flags
GET    /feature-flags/{id}
PUT    /feature-flags/{id}
PATCH  /feature-flags/{id}/enable
PATCH  /feature-flags/{id}/disable
DELETE /feature-flags/{id}
```

### Environments

```text
GET    /environments
POST   /environments
GET    /environments/{id}
PUT    /environments/{id}
PATCH  /environments/{id}/activate
PATCH  /environments/{id}/deactivate
DELETE /environments/{id}
```

### Rollouts

```text
GET    /rollouts
POST   /rollouts
GET    /rollouts/{id}
PUT    /rollouts/{id}
PATCH  /rollouts/{id}/enable
PATCH  /rollouts/{id}/disable
DELETE /rollouts/{id}
```

### User Assignments

```text
GET    /assignments
POST   /assignments
GET    /assignments/{id}
PUT    /assignments/{id}
PATCH  /assignments/{id}/enable
PATCH  /assignments/{id}/disable
DELETE /assignments/{id}
```

### Feature Evaluation

```text
POST /feature-evaluation
```

### Analytics

```text
GET /analytics/summary
GET /analytics/features
GET /analytics/environments
```

### Dashboard

```text
GET /dashboard/summary
GET /dashboard/recent-activity
```

### Audit Logs

```text
GET /audit-logs
GET /audit-logs/my
GET /audit-logs/{id}
```

### Rollback

```text
POST /rollback
```

### Users

```text
GET /users
```

---

## 🧪 Testing

The backend APIs can be tested using:

* Swagger UI
* Postman
* Browser
* Frontend application

Swagger:

```text
http://127.0.0.1:8000/docs
```

Recommended testing sequence:

```text
1. Register/Login
2. Verify /auth/me
3. Create Feature Flag
4. Create Environment
5. Create Rollout
6. Create User Assignment
7. Evaluate Feature
8. Verify Analytics
9. Check Audit Logs
10. Test Rollback
11. Verify Dashboard
```

---

## 📊 Example Use Case

Suppose a company develops a new dashboard.

Instead of immediately releasing it to everyone:

```text
Feature:
new_dashboard
```

The development team can configure:

```text
Development
    → 100%

Testing
    → 50%

Production
    → 10%
```

The company can then gradually increase the production rollout:

```text
10%
 ↓
25%
 ↓
50%
 ↓
75%
 ↓
100%
```

If a problem is discovered, the feature can be disabled or rolled back without redeploying the application.

---

## 🔐 Security Considerations

The system includes:

* JWT authentication
* Password hashing
* Role-based authorization
* Protected API routes
* Active-user validation
* Input validation using Pydantic
* Database constraints
* Audit logging
* Environment-based configuration

Production deployments should additionally use:

* HTTPS
* Strong JWT secrets
* Secure environment variables
* Restricted database access
* Redis authentication
* Proper CORS configuration
* Secret management

---

## 🐳 Docker

The project includes Docker configuration for containerized deployment.

Expected services:

```text
Frontend
Backend
MySQL
Redis
```

Run:

```powershell
docker compose up --build
```

Stop:

```powershell
docker compose down
```

---

## 📦 Postman

A Postman collection is included:

```text
postman/
└── Feature-Flag-System.postman_collection.json
```

The collection can be used to test authentication, feature flags, environments, rollouts, assignments, evaluation, analytics, audit logs, and rollback APIs.

---

## 📈 Future Enhancements

Potential future improvements include:

* Advanced percentage rollout algorithms
* Real-time Redis-based feature evaluation
* Feature targeting rules
* Geographic targeting
* Device-based targeting
* Organization/tenant-based feature flags
* WebSocket-based real-time dashboard updates
* Email notifications
* Slack/Teams notifications
* Advanced analytics charts
* Feature performance monitoring
* Automated rollout progression
* CI/CD integration
* Kubernetes deployment
* Cloud deployment

---

## 🎓 Project Learning Outcomes

This project demonstrates practical experience with:

* FastAPI REST API development
* React + TypeScript application development
* JWT authentication
* RBAC implementation
* SQLAlchemy ORM
* Alembic migrations
* MySQL database design
* Redis integration
* Feature flag architecture
* Percentage-based rollouts
* Scheduled configuration
* Audit logging
* Rollback mechanisms
* Analytics
* Dashboard development
* REST API integration
* Docker
* Git/GitHub
* Swagger/OpenAPI

