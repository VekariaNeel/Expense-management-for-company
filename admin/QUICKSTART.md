# Quick Start Guide

## Setup Instructions

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and modify if needed)
# On Windows:
copy .env.example .env

# On Mac/Linux:
# cp .env.example .env

# Start backend server
npm start
```

Backend will run on: **http://localhost:5000**

### Step 2: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

Frontend will run on: **http://localhost:3000**

## First Time Usage

### 1. Create Company & Admin Account

1. Open browser to `http://localhost:3000`
2. Click "Sign up" or navigate to `/signup`
3. Fill in the form:
   - **Company Name**: Your Company Name
   - **Country**: Select from dropdown (auto-populates currency)
   - **Currency**: Auto-filled based on country
   - **Admin Name**: Your Name
   - **Admin Email**: admin@company.com
   - **Password**: YourPassword123
   - **Confirm Password**: YourPassword123
4. Click "Sign Up"
5. You'll be automatically logged in and redirected to User Management

### 2. Add Users

1. On the User Management page, click "Add User"
2. Fill in user details:
   - **Name**: Employee Name
   - **Email**: employee@company.com
   - **Role**: Employee or Manager
   - **Manager**: Select from dropdown (optional)
3. Click "Add User"
4. **Check the backend console** for the generated password
5. The password will be displayed like this:

```
=================================
📧 EMAIL NOTIFICATION (STUB)
=================================
To: employee@company.com
Subject: Welcome to Expense Management System
Body: Your account has been created.
Login Email: employee@company.com
Temporary Password: Abc123XYZ!@#
=================================
```

### 3. Configure Approval Rules

1. Click "Approval Rules" in the navigation
2. Select an employee from the dropdown
3. Configure their approval workflow:
   - **Manager**: Select their manager
   - **Approvers**: Check users who can approve
   - **Is Manager Approver**: Check if manager should approve
   - **Required Approver**: Check if approval is mandatory
   - **Approval Type**: Sequential or Parallel
   - **Minimum Approval %**: Set percentage (0-100)
4. Click "Save Approval Rule"

## Testing Tips

### Sample Test Data

**Admin Account:**
```
Email: admin@techcorp.com
Password: Admin123!
```

**Add Sample Users:**
1. Jane Manager (Manager role)
2. Bob Employee (Employee role, Manager: Jane)
3. Alice Employee (Employee role, Manager: Jane)

**Configure Approval Rules:**
- For Bob: Manager = Jane, Approvers = [Jane, Alice], Sequential, 100%
- For Alice: Manager = Jane, Approvers = [Jane, Bob], Parallel, 50%

## Common Issues

### Backend won't start
- Check if port 5000 is already in use
- Make sure you ran `npm install` in the backend directory
- Verify `.env` file exists (copy from `.env.example`)

### Frontend won't start
- Check if port 3000 is already in use
- Make sure you ran `npm install` in the frontend directory
- Clear browser cache and restart

### API errors
- Ensure backend is running on port 5000
- Check browser console for detailed error messages
- Verify JWT token is being sent (check Network tab)

### Data disappeared
- This is expected! Data is stored in-memory and resets when you restart the backend server
- You'll need to signup again after restarting

## Development Commands

### Backend
```bash
cd backend
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
```

### Frontend
```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

## API Testing with curl

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Corp",
    "country": "United States",
    "currency": "USD",
    "adminName": "Admin User",
    "adminEmail": "admin@test.com",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!"
  }'
```

### Get Users (requires JWT token)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Next Steps

After setting up the admin functionality, you can extend the system with:
- Expense submission pages
- Approval workflow execution
- Reports and analytics
- Database integration
- Email service integration

---

**Happy coding! 🚀**
