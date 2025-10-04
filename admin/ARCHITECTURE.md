# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                              │
│                      http://localhost:3000                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      REACT FRONTEND                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Pages                                                        │  │
│  │  • Signup.jsx          • Login.jsx                           │  │
│  │  • AdminUsers.jsx      • AdminApprovalRules.jsx              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Components                                                   │  │
│  │  • Navbar.jsx          • ProtectedRoute.jsx                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Context                                                      │  │
│  │  • AuthContext.jsx (JWT Token + User State)                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Styling: TailwindCSS                                               │
│  Routing: React Router v6                                           │
│  State: Context API + localStorage                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │ Authorization: Bearer <JWT>
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    EXPRESS BACKEND API                              │
│                   http://localhost:5000                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Routes                                                       │  │
│  │  • /api/auth/signup                                          │  │
│  │  • /api/auth/login                                           │  │
│  │  • /api/users (GET, POST, PUT)                               │  │
│  │  • /api/approval-rules (GET, POST)                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Middleware                                                   │  │
│  │  • auth.js (JWT Verification)                                │  │
│  │  • adminOnly (Role Check)                                    │  │
│  │  • CORS                                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Business Logic                                               │  │
│  │  • User Management                                            │  │
│  │  • Password Generation                                        │  │
│  │  • Approval Rules Configuration                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Read/Write
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    IN-MEMORY DATA STORE                             │
│                        (store.js)                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Data Structures                                              │  │
│  │  • companies: []                                              │  │
│  │  • users: []                                                  │  │
│  │  • approvalRules: []                                          │  │
│  │  • ID Counters                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ⚠️  Data resets on server restart                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Signup Flow

```
┌─────────┐    1. Fill Form     ┌──────────┐
│ Browser │ ──────────────────> │  Signup  │
│         │                     │   Page   │
└─────────┘                     └────┬─────┘
                                     │
                                     │ 2. POST /api/auth/signup
                                     │    {companyName, country, 
                                     │     adminName, email, password}
                                     ▼
                              ┌──────────────┐
                              │   Backend    │
                              │  auth.js     │
                              └──────┬───────┘
                                     │
                                     │ 3. Hash Password
                                     │ 4. Create Company
                                     │ 5. Create Admin User
                                     │
                                     ▼
                              ┌──────────────┐
                              │   store.js   │
                              │  companies[] │
                              │  users[]     │
                              └──────┬───────┘
                                     │
                                     │ 6. Generate JWT
                                     │ 7. Return token + user + company
                                     ▼
                              ┌──────────────┐
                              │   Frontend   │
                              │ AuthContext  │
                              └──────┬───────┘
                                     │
                                     │ 8. Store in localStorage
                                     │ 9. Redirect to /admin/users
                                     ▼
                              ┌──────────────┐
                              │  Dashboard   │
                              └──────────────┘
```

### 2. User Login Flow

```
┌─────────┐    1. Enter Credentials   ┌──────────┐
│ Browser │ ─────────────────────────> │  Login   │
│         │                            │   Page   │
└─────────┘                            └────┬─────┘
                                            │
                                            │ 2. POST /api/auth/login
                                            │    {email, password}
                                            ▼
                                     ┌──────────────┐
                                     │   Backend    │
                                     │  auth.js     │
                                     └──────┬───────┘
                                            │
                                            │ 3. Find User
                                            │ 4. Verify Password
                                            ▼
                                     ┌──────────────┐
                                     │   store.js   │
                                     │  users[]     │
                                     └──────┬───────┘
                                            │
                                            │ 5. Generate JWT
                                            │ 6. Return token + user + company
                                            ▼
                                     ┌──────────────┐
                                     │   Frontend   │
                                     │ AuthContext  │
                                     └──────┬───────┘
                                            │
                                            │ 7. Store in localStorage
                                            │ 8. Redirect to /admin/users
                                            ▼
                                     ┌──────────────┐
                                     │  Dashboard   │
                                     └──────────────┘
```

### 3. Add User Flow

```
┌──────────┐   1. Click "Add User"   ┌──────────────┐
│  Admin   │ ─────────────────────> │ AdminUsers   │
│          │                         │    Page      │
└──────────┘                         └──────┬───────┘
                                            │
                                            │ 2. Fill Form & Submit
                                            │ 3. POST /api/users
                                            │    Authorization: Bearer <JWT>
                                            │    {name, email, role, managerId}
                                            ▼
                                     ┌──────────────┐
                                     │   Backend    │
                                     │  users.js    │
                                     └──────┬───────┘
                                            │
                                            │ 4. Verify JWT (middleware)
                                            │ 5. Check Admin Role
                                            │ 6. Generate Random Password
                                            │ 7. Hash Password
                                            ▼
                                     ┌──────────────┐
                                     │   store.js   │
                                     │  users[]     │
                                     └──────┬───────┘
                                            │
                                            │ 8. Log Password to Console
                                            │ 9. Return User Data
                                            ▼
                                     ┌──────────────┐
                                     │   Frontend   │
                                     │ Refresh List │
                                     └──────────────┘
```

### 4. Configure Approval Rule Flow

```
┌──────────┐   1. Select Employee    ┌──────────────────┐
│  Admin   │ ──────────────────────> │ AdminApproval    │
│          │                          │  Rules Page      │
└──────────┘                          └────────┬─────────┘
                                               │
                                               │ 2. Configure Options
                                               │ 3. POST /api/approval-rules
                                               │    Authorization: Bearer <JWT>
                                               │    {userId, managerId, 
                                               │     approverIds, ...}
                                               ▼
                                        ┌──────────────┐
                                        │   Backend    │
                                        │ approvalRules│
                                        │     .js      │
                                        └──────┬───────┘
                                               │
                                               │ 4. Verify JWT
                                               │ 5. Check Admin Role
                                               │ 6. Validate Approvers
                                               │ 7. Create/Update Rule
                                               ▼
                                        ┌──────────────┐
                                        │   store.js   │
                                        │ approvalRules│
                                        │     []       │
                                        └──────┬───────┘
                                               │
                                               │ 8. Return Rule Data
                                               ▼
                                        ┌──────────────┐
                                        │   Frontend   │
                                        │ Show Success │
                                        └──────────────┘
```

## Component Hierarchy

```
App.jsx
├── AuthProvider (Context)
│   └── Router
│       ├── Route: /signup
│       │   └── Signup.jsx
│       │
│       ├── Route: /login
│       │   └── Login.jsx
│       │
│       ├── Route: /admin/users
│       │   └── ProtectedRoute
│       │       └── AdminUsers.jsx
│       │           └── Navbar.jsx
│       │
│       └── Route: /admin/approval-rules
│           └── ProtectedRoute
│               └── AdminApprovalRules.jsx
│                   └── Navbar.jsx
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication States                      │
└─────────────────────────────────────────────────────────────────┘

State 1: Not Authenticated
┌──────────────┐
│ localStorage │ ─── Empty ───> Show Login/Signup Pages
└──────────────┘

State 2: Authenticated
┌──────────────┐
│ localStorage │ ─── Has Token ───> Verify & Show Protected Pages
│  • token     │
│  • user      │
│  • company   │
└──────────────┘

State 3: Token Expired
┌──────────────┐
│ localStorage │ ─── Invalid Token ───> Clear & Redirect to Login
└──────────────┘
```

## API Request Flow

```
Frontend Request
      │
      │ 1. Add Authorization Header
      │    Authorization: Bearer <JWT_TOKEN>
      ▼
┌──────────────┐
│   Express    │
│   Server     │
└──────┬───────┘
       │
       │ 2. CORS Middleware (Allow Origin)
       ▼
┌──────────────┐
│     auth     │ ──── No Token ────> 401 Unauthorized
│  Middleware  │
└──────┬───────┘
       │
       │ 3. Verify JWT
       │ 4. Decode User Info
       ▼
┌──────────────┐
│  adminOnly   │ ──── Not Admin ───> 403 Forbidden
│  Middleware  │
└──────┬───────┘
       │
       │ 5. Check Role
       ▼
┌──────────────┐
│    Route     │
│   Handler    │
└──────┬───────┘
       │
       │ 6. Business Logic
       │ 7. Access store.js
       ▼
┌──────────────┐
│   Response   │ ───> 200 OK + Data
└──────────────┘
```

## Data Models

### Company
```javascript
{
  id: number,
  name: string,
  country: string,
  currency: string,
  createdAt: ISO8601 timestamp
}
```

### User
```javascript
{
  id: number,
  companyId: number,
  name: string,
  email: string,
  password: string (hashed),
  role: "Admin" | "Manager" | "Employee",
  managerId: number | null,
  createdAt: ISO8601 timestamp
}
```

### Approval Rule
```javascript
{
  id: number,
  userId: number,
  companyId: number,
  managerId: number | null,
  approverIds: number[],
  isManagerApprover: boolean,
  isRequiredApprover: boolean,
  approvalType: "Sequential" | "Parallel",
  minimumApprovalPercentage: number (0-100),
  createdAt: ISO8601 timestamp,
  updatedAt: ISO8601 timestamp
}
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Password Security
├── bcryptjs hashing (10 salt rounds)
├── No plain text storage
└── Random password generation (12 chars)

Layer 2: Authentication
├── JWT tokens (7-day expiry)
├── Signed with secret key
└── Stored in localStorage (frontend)

Layer 3: Authorization
├── Middleware checks JWT validity
├── Role-based access control
└── Admin-only route protection

Layer 4: API Security
├── CORS enabled for localhost:3000
├── Input validation on all endpoints
└── Error handling without data leakage

Layer 5: Transport Security
├── HTTP for development
└── HTTPS recommended for production
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Production Setup                           │
└─────────────────────────────────────────────────────────────────┘

Frontend (Static Hosting)
├── Vercel / Netlify / AWS S3 + CloudFront
├── Build: npm run build
└── Serve: Optimized static files

Backend (Server Hosting)
├── Heroku / AWS EC2 / DigitalOcean
├── Process Manager: PM2
└── Environment: Production .env

Database (Replace In-Memory)
├── MongoDB Atlas / PostgreSQL
├── Connection pooling
└── Backup strategy

Additional Services
├── Email: SendGrid / AWS SES
├── File Storage: AWS S3
├── Monitoring: Sentry / LogRocket
└── Analytics: Google Analytics
```

## Technology Stack Details

```
┌─────────────────────────────────────────────────────────────────┐
│                      Technology Choices                         │
└─────────────────────────────────────────────────────────────────┘

Backend
├── Runtime: Node.js v14+
├── Framework: Express v4.18
├── Auth: jsonwebtoken v9.0, bcryptjs v2.4
├── Middleware: cors v2.8
└── Config: dotenv v16.3

Frontend
├── Library: React v18.2
├── Routing: react-router-dom v6.16
├── Styling: TailwindCSS v3.3
├── Build Tool: react-scripts v5.0
└── State: Context API + localStorage

Development
├── Backend Dev Server: nodemon
├── Frontend Dev Server: webpack-dev-server
├── Package Manager: npm
└── Version Control: git
```

---

This architecture provides a solid foundation for the Expense Management System with clear separation of concerns, security best practices, and scalability considerations.
