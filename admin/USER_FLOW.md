# User Flow Guide - Expense Management System

## Visual User Journey

### 🎬 Complete User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    START: Open Browser                              │
│                http://localhost:3000                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Auto Redirect │
                    │   to /login    │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │ New User?    │          │ Existing     │
        │ Click Signup │          │ User Login   │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               ▼                         ▼
        ┌──────────────┐          ┌──────────────┐
        │ SIGNUP PAGE  │          │  LOGIN PAGE  │
        │              │          │              │
        │ Fill Form:   │          │ Enter:       │
        │ • Company    │          │ • Email      │
        │ • Country    │          │ • Password   │
        │ • Admin Info │          │              │
        │ • Password   │          │ Click Login  │
        │              │          │              │
        │ Click Signup │          │              │
        └──────┬───────┘          └──────┬───────┘
               │                         │
               └────────────┬────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Authentication  │
                   │ Successful      │
                   │ JWT Token Saved │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ ADMIN DASHBOARD │
                   │ /admin/users    │
                   └────────┬────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        ┌──────────────┐        ┌──────────────────┐
        │ USER         │        │ APPROVAL RULES   │
        │ MANAGEMENT   │        │ MANAGEMENT       │
        └──────┬───────┘        └──────┬───────────┘
               │                       │
               │                       │
        [See detailed                [See detailed
         flow below]                  flow below]
```

---

## 📝 Detailed Page Flows

### 1. Signup Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIGNUP PAGE                                 │
│                      /signup (Public)                               │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Fill Company Information
┌─────────────────────────────────────┐
│ Company Name:  [____________]       │
│ Country:       [▼ Select Country]   │ ← Dropdown from REST Countries API
│ Currency:      [USD] (auto-filled)  │ ← Auto-populated based on country
└─────────────────────────────────────┘

Step 2: Fill Admin Information
┌─────────────────────────────────────┐
│ Admin Name:    [____________]       │
│ Admin Email:   [____________]       │
│ Password:      [____________]       │
│ Confirm Pass:  [____________]       │
└─────────────────────────────────────┘

Step 3: Submit
┌─────────────────────────────────────┐
│        [Sign Up] Button             │
└─────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ Validation    │
        │ • All fields  │
        │ • Email valid │
        │ • Passwords   │
        │   match       │
        └───────┬───────┘
                │
        ┌───────┴────────┐
        │ ✓ Valid        │ ✗ Invalid
        ▼                ▼
┌───────────────┐  ┌──────────────┐
│ Create:       │  │ Show Error   │
│ • Company     │  │ Message      │
│ • Admin User  │  │              │
│ • JWT Token   │  │ User Fixes   │
└───────┬───────┘  └──────┬───────┘
        │                 │
        │                 └─────────┐
        ▼                           │
┌───────────────┐                   │
│ Auto Login    │                   │
│ Redirect to   │                   │
│ /admin/users  │◄──────────────────┘
└───────────────┘
```

---

### 2. Login Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LOGIN PAGE                                 │
│                       /login (Public)                               │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Enter Credentials
┌─────────────────────────────────────┐
│ Email:     [____________]           │
│ Password:  [____________]           │
└─────────────────────────────────────┘

Step 2: Submit
┌─────────────────────────────────────┐
│        [Sign in] Button             │
└─────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │ Verify        │
        │ Credentials   │
        └───────┬───────┘
                │
        ┌───────┴────────┐
        │ ✓ Valid        │ ✗ Invalid
        ▼                ▼
┌───────────────┐  ┌──────────────┐
│ Generate JWT  │  │ Show Error:  │
│ Return User   │  │ "Invalid     │
│ Return Co.    │  │ credentials" │
└───────┬───────┘  └──────┬───────┘
        │                 │
        ▼                 │
┌───────────────┐         │
│ Store in      │         │
│ localStorage: │         │
│ • token       │         │
│ • user        │         │
│ • company     │         │
└───────┬───────┘         │
        │                 │
        ▼                 │
┌───────────────┐         │
│ Redirect to   │         │
│ /admin/users  │◄────────┘
└───────────────┘
```

---

### 3. User Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT PAGE                             │
│                  /admin/users (Protected)                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Navbar: [User Management] [Approval Rules]  John Admin  [Logout]  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  User Management                                    [Add User]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Name        │ Email           │ Role     │ Manager │ Actions  │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ John Admin  │ john@tech.com   │ [Admin]  │ -       │ -        │ │
│  │ Bob Manager │ bob@tech.com    │ [▼Mgr]   │ [▼None] │ [Send]   │ │
│  │ Alice Emp   │ alice@tech.com  │ [▼Emp]   │ [▼Bob]  │ [Send]   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

Action Flows:

A. Add User Flow
   │
   ├─► Click [Add User]
   │
   ├─► Modal Opens
   │   ┌─────────────────────────────┐
   │   │ Add New User                │
   │   ├─────────────────────────────┤
   │   │ Name:     [____________]    │
   │   │ Email:    [____________]    │
   │   │ Role:     [▼ Employee]      │
   │   │ Manager:  [▼ Select...]     │
   │   │                             │
   │   │ [Add User]  [Cancel]        │
   │   └─────────────────────────────┘
   │
   ├─► Fill Form & Submit
   │
   ├─► Backend Generates Password
   │
   ├─► Console Logs Password
   │   =================================
   │   📧 EMAIL NOTIFICATION (STUB)
   │   =================================
   │   To: newuser@tech.com
   │   Temporary Password: Abc123XYZ!@#
   │   =================================
   │
   ├─► User Added to Table
   │
   └─► Modal Closes

B. Change Role Flow
   │
   ├─► Click Role Dropdown
   │
   ├─► Select New Role
   │   [Employee] → [Manager]
   │
   ├─► API Call: PUT /api/users/:id/role
   │
   ├─► Table Updates Immediately
   │
   └─► No Page Refresh

C. Assign Manager Flow
   │
   ├─► Click Manager Dropdown
   │
   ├─► Select Manager
   │   [No Manager] → [Bob Manager]
   │
   ├─► API Call: PUT /api/users/:id/manager
   │
   ├─► Table Updates
   │
   └─► Manager Assigned

D. Resend Password Flow
   │
   ├─► Click [Send Password]
   │
   ├─► Backend Generates New Password
   │
   ├─► Console Logs Password
   │
   ├─► Alert: "Password sent successfully!"
   │
   └─► Check Backend Console
```

---

### 4. Approval Rules Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                  APPROVAL RULES PAGE                                │
│              /admin/approval-rules (Protected)                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Navbar: [User Management] [Approval Rules]  John Admin  [Logout]  │
└─────────────────────────────────────────────────────────────────────┘

Layout: Two Columns

┌──────────────────────────┬──────────────────────────────────────────┐
│ Configure Approval Rule  │ Existing Approval Rules                  │
├──────────────────────────┼──────────────────────────────────────────┤
│                          │                                          │
│ Select Employee:         │ ┌──────────────────────────────────────┐ │
│ [▼ Choose employee...]   │ │ Alice Employee                       │ │
│                          │ │ Manager: Bob Manager                 │ │
│ ↓ (After Selection)      │ │ Approvers: Bob, Charlie              │ │
│                          │ │ Manager is Approver: Yes             │ │
│ Manager:                 │ │ Required: No                         │ │
│ [▼ Bob Manager]          │ │ Type: Parallel                       │ │
│                          │ │ Min Approval %: 50%                  │ │
│ Select Approvers:        │ └──────────────────────────────────────┘ │
│ ☑ Bob Manager            │                                          │
│ ☐ Charlie Employee       │ ┌──────────────────────────────────────┐ │
│ ☐ Alice Employee         │ │ Charlie Employee                     │ │
│                          │ │ Manager: Bob Manager                 │ │
│ ☑ Is Manager Approver?   │ │ Approvers: Bob                       │ │
│ ☐ Required Approver      │ │ Manager is Approver: Yes             │ │
│                          │ │ Required: Yes                        │ │
│ Approval Type:           │ │ Type: Sequential                     │ │
│ ⦿ Sequential             │ │ Min Approval %: 100%                 │ │
│ ○ Parallel               │ └──────────────────────────────────────┘ │
│                          │                                          │
│ Min Approval %:          │                                          │
│ [100] (0-100)            │                                          │
│                          │                                          │
│ [Save Approval Rule]     │                                          │
└──────────────────────────┴──────────────────────────────────────────┘

Configuration Flow:

Step 1: Select Employee
   │
   ├─► Click Employee Dropdown
   │
   ├─► Choose "Alice Employee"
   │
   ├─► Form Loads Existing Rule (if any)
   │   OR
   │   Form Loads Defaults
   │
   └─► Manager auto-filled from user's manager

Step 2: Configure Manager
   │
   ├─► Select/Change Manager
   │
   └─► Manager dropdown shows all Managers + Admin

Step 3: Select Approvers
   │
   ├─► Checkbox List Shows All Users (except selected employee)
   │
   ├─► Check Multiple Approvers
   │   ☑ Bob Manager
   │   ☑ Charlie Employee
   │
   └─► Can select multiple

Step 4: Set Options
   │
   ├─► Toggle "Is Manager Approver?"
   │   ☑ Yes → Manager must approve
   │   ☐ No  → Manager optional
   │
   ├─► Toggle "Required Approver"
   │   ☑ Yes → Approval mandatory
   │   ☐ No  → Approval optional
   │
   ├─► Select Approval Type
   │   ⦿ Sequential → One by one
   │   ○ Parallel   → All at once
   │
   └─► Set Minimum Approval %
       [75] → Need 75% approval

Step 5: Save
   │
   ├─► Click [Save Approval Rule]
   │
   ├─► Validation
   │   • User selected?
   │   • Valid approvers?
   │   • Valid percentage?
   │
   ├─► API Call: POST /api/approval-rules
   │
   ├─► Success Alert
   │
   ├─► Rule Appears in Right Column
   │
   └─► Form Resets
```

---

## 🔄 Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NAVIGATION STRUCTURE                           │
└─────────────────────────────────────────────────────────────────────┘

Public Routes (No Auth Required)
├── /signup          → Signup Page
├── /login           → Login Page
└── /                → Redirects to /login

Protected Routes (Auth Required)
├── /admin/users              → User Management (Admin Only)
└── /admin/approval-rules     → Approval Rules (Admin Only)

Navigation Bar (When Logged In)
┌─────────────────────────────────────────────────────────────────────┐
│ [Expense Management]  [Users Management]  [Approval Rules]          │
│                                                                      │
│                                      John Admin  Tech Corp  [Logout]│
└─────────────────────────────────────────────────────────────────────┘

Click Actions:
• "Users Management"   → Navigate to /admin/users
• "Approval Rules"     → Navigate to /admin/approval-rules
• "Logout"             → Clear localStorage, redirect to /login
```

---

## 🔐 Authentication States

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION STATE MACHINE                     │
└─────────────────────────────────────────────────────────────────────┘

State 1: UNAUTHENTICATED
┌──────────────────┐
│ No Token         │
│ localStorage     │
│ empty            │
└────────┬─────────┘
         │
         ├─► Can Access: /signup, /login
         ├─► Cannot Access: /admin/*
         └─► Redirect to: /login

State 2: AUTHENTICATED (Admin)
┌──────────────────┐
│ Valid JWT Token  │
│ Role: Admin      │
│ User Data Loaded │
└────────┬─────────┘
         │
         ├─► Can Access: All routes
         ├─► Protected Routes: Allowed
         └─► Navbar: Visible

State 3: TOKEN EXPIRED
┌──────────────────┐
│ Expired Token    │
│ API Returns 401  │
└────────┬─────────┘
         │
         ├─► Clear localStorage
         ├─► Show Error
         └─► Redirect to: /login

State 4: NON-ADMIN (Future)
┌──────────────────┐
│ Valid Token      │
│ Role: Employee/  │
│       Manager    │
└────────┬─────────┘
         │
         ├─► Can Access: Employee routes (not implemented)
         ├─► Cannot Access: /admin/*
         └─► Show: "Admin access required"
```

---

## 📱 Responsive Behavior

```
┌─────────────────────────────────────────────────────────────────────┐
│                      RESPONSIVE DESIGN FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

Desktop (> 1024px)
┌─────────────────────────────────────────────────────────────────────┐
│ [Full Navbar with all items]                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┬──────────────────────┐                   │
│  │ Left Column          │ Right Column         │                   │
│  │ (Form/Config)        │ (List/Results)       │                   │
│  └──────────────────────┴──────────────────────┘                   │
│                                                                     │
│  [Wide Tables with All Columns Visible]                            │
└─────────────────────────────────────────────────────────────────────┘

Tablet (768px - 1024px)
┌─────────────────────────────────────────────────────────────────────┐
│ [Navbar with wrapped items]                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐                                          │
│  │ Form/Config          │                                          │
│  └──────────────────────┘                                          │
│  ┌──────────────────────┐                                          │
│  │ List/Results         │                                          │
│  └──────────────────────┘                                          │
│                                                                     │
│  [Tables with horizontal scroll]                                   │
└─────────────────────────────────────────────────────────────────────┘

Mobile (< 768px)
┌───────────────────────────────┐
│ [☰ Menu] [Logo] [User]        │
├───────────────────────────────┤
│                               │
│  ┌─────────────────────────┐  │
│  │ Stacked Form            │  │
│  │ Full Width              │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ Card-based List         │  │
│  │ (Instead of Table)      │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

---

## 🎯 User Journey Summary

```
First Time User Journey:
1. Open app → Redirected to /login
2. Click "Sign up" → Go to /signup
3. Fill company + admin form
4. Submit → Auto login → /admin/users
5. Add employees and managers
6. Configure approval rules
7. Logout when done

Returning User Journey:
1. Open app → Redirected to /login
2. Enter credentials
3. Submit → /admin/users
4. Manage users or configure rules
5. Logout when done

Admin Daily Tasks:
1. Login
2. Add new employees
3. Assign managers
4. Configure approval rules
5. Resend passwords if needed
6. Logout
```

---

This user flow guide provides a complete visual reference for navigating and using the Expense Management System!
