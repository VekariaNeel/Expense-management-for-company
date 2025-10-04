# Expense Management System

A full-stack expense management system with company signup, user management, and approval rules configuration.

## 🎯 Features

### Implemented (Admin Pages)
- **Company Signup**: Register company with admin account
- **User Authentication**: JWT-based login/logout
- **User Management**: 
  - Add employees and managers
  - Assign/change roles
  - Assign/change managers
  - Generate and resend passwords
- **Approval Rules**:
  - Configure approval workflows per employee
  - Set managers and approvers
  - Define sequential/parallel approval
  - Set minimum approval percentages

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**
- **In-memory storage** (no database - data resets on restart)
- **JWT** authentication with bcryptjs
- **CORS** enabled for frontend communication

### Frontend
- **React 18** with React Router
- **TailwindCSS** for styling
- **Context API** for state management
- Protected routes with authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Start the server
npm start
```

The backend server will run on `http://localhost:5000`

#### 2. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register company + admin
- `POST /api/auth/login` - Login user

### Users (Admin only)
- `GET /api/users` - Get all users in company
- `POST /api/users` - Create new user
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/manager` - Update user manager
- `POST /api/users/:id/send-password` - Resend password

### Approval Rules (Admin only)
- `GET /api/approval-rules` - Get all approval rules
- `GET /api/approval-rules/:userId` - Get rule for specific user
- `POST /api/approval-rules` - Create/update approval rule

## 🔐 Authentication

The system uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Protected routes require valid JWT token
- Admin-only routes check for Admin role
- Token expires in 7 days

## 💾 Data Storage

All data is stored **in-memory** using JavaScript arrays/objects:
- **Companies**: Company information with country and currency
- **Users**: User accounts with roles (Admin/Manager/Employee)
- **Approval Rules**: Approval workflow configurations

**⚠️ Important**: Data will be **lost on server restart**. This is intentional for development/demo purposes.

## 📧 Email Notifications

Email functionality is **stubbed** - passwords are logged to the console instead of being sent via email:

```
=================================
📧 EMAIL NOTIFICATION (STUB)
=================================
To: user@example.com
Subject: Welcome to Expense Management System
Body: Your account has been created.
Login Email: user@example.com
Temporary Password: Abc123XYZ!@#
=================================
```

## 🎨 User Interface

### Pages
1. **Signup** (`/signup`)
   - Company registration form
   - Country dropdown with auto-populated currency
   - Admin account creation

2. **Login** (`/login`)
   - Email and password authentication
   - Redirects to admin dashboard on success

3. **User Management** (`/admin/users`)
   - Table view of all users
   - Add new users with random password generation
   - Change roles (Employee/Manager)
   - Assign/change managers
   - Resend passwords

4. **Approval Rules** (`/admin/approval-rules`)
   - Configure approval workflows per employee
   - Select manager and approvers
   - Set approval type (Sequential/Parallel)
   - Define minimum approval percentage
   - View existing rules

## 🔧 Configuration

### Backend (.env)
```env
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

### Frontend
The frontend is configured to connect to `http://localhost:5000` for API calls. Update the API base URL in the page files if your backend runs on a different port.

## 🧪 Testing the Application

### Quick Start Flow:

1. **Signup**: Create a company and admin account at `/signup`
2. **Login**: Sign in with admin credentials at `/login`
3. **Add Users**: Navigate to User Management and add employees/managers
4. **Configure Rules**: Set up approval rules for employees

### Sample Test Data:

**Company Signup:**
- Company Name: Tech Corp
- Country: United States
- Currency: USD
- Admin Name: John Admin
- Admin Email: admin@techcorp.com
- Password: Admin123!

**Add Users:**
- Manager: Jane Manager (manager@techcorp.com)
- Employee: Bob Employee (bob@techcorp.com)

## 🐛 Known Limitations

1. **No Persistence**: Data resets on server restart
2. **No Email**: Passwords logged to console only
3. **Basic Validation**: Minimal input validation
4. **No Password Recovery**: Admin must reset passwords
5. **Single Company Context**: No multi-tenancy features beyond company isolation

## 🔜 Future Enhancements (Not Implemented)

- Expense submission and tracking
- Approval workflow execution
- Expense reports and analytics
- File attachments
- Real database integration
- Email service integration
- Password strength requirements
- Audit logs

## 📝 License

This project is for demonstration purposes.

## 👥 Support

For issues or questions, check the console logs for detailed error messages.

---

**Built with ❤️ using Node.js, Express, React, and TailwindCSS**
