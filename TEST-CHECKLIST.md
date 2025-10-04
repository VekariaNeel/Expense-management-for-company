# ✅ Complete Test Checklist

## Pre-Test Setup

### 1. Backend Running ✓
```bash
cd backend
npm start
```
Expected output:
```
🚀 Server running on port 5000
📝 In-memory storage active - data will reset on restart
```

### 2. Frontend Running ✓
```bash
cd frontend
npm start
```
Expected: Opens browser at http://localhost:3000

---

## Test Scenario: Employee → Manager Flow

### STEP 1: Create Manager User (Admin Panel)

- [ ] Login as Admin
- [ ] Go to "User Management"
- [ ] Click "Add User"
- [ ] Fill form:
  - Name: `Test Manager`
  - Email: `manager@test.com`
  - Role: `Manager`
- [ ] Click "Add User"
- [ ] **Copy password from backend console** (e.g., `Abc123XYZ!@#`)

### STEP 2: Create Employee User (Admin Panel)

- [ ] Still in "User Management"
- [ ] Click "Add User"
- [ ] Fill form:
  - Name: `Test Employee`
  - Email: `employee@test.com`
  - Role: `Employee`
  - **Manager: Select "Test Manager"** ← CRITICAL!
- [ ] Click "Add User"
- [ ] **Copy password from backend console**

### STEP 3: Submit Expense (Employee Dashboard)

- [ ] Logout from Admin
- [ ] Login as: `employee@test.com` (use password from console)
- [ ] Should redirect to Employee Dashboard
- [ ] Click "New Expense" button
- [ ] Fill form:
  - Expense Date: `Today's date`
  - Category: `Food`
  - Description: `Test Lunch`
  - Paid By: `Cash`
  - Amount: `500`
  - Currency: `INR`
  - Remarks: `Testing workflow`
- [ ] Click **"Submit"** button (NOT "Save Draft")
- [ ] Verify:
  - Drawer closes
  - Expense appears in table
  - Status badge shows "Waiting Approval" (yellow/amber color)

### STEP 4: View in Manager Dashboard

- [ ] Logout from Employee account
- [ ] Login as: `manager@test.com` (use password from console)
- [ ] Should redirect to Manager Dashboard
- [ ] Check "Pending" tab (should be active by default)
- [ ] **Verify expense appears:**
  - Subject: "Test Lunch"
  - Owner: "Test Employee"
  - Category: "Food"
  - Amount: Converted to company currency (e.g., $6.02 USD)
  - Original amount shown below: ₹500 INR
  - Status: "PENDING" (yellow badge)

### STEP 5: Approve Expense

- [ ] Click "Approve" button on the expense
- [ ] Modal opens showing expense details
- [ ] Add comment (optional): `Approved for team lunch`
- [ ] Click "Confirm Approval"
- [ ] Verify:
  - Toast notification: "Approved ✓"
  - Expense moves to "Approved" tab
  - Status changes to "APPROVED" (green badge)

### STEP 6: Verify in Employee Dashboard

- [ ] Logout from Manager
- [ ] Login as: `employee@test.com`
- [ ] Go to Employee Dashboard
- [ ] Find the expense in table
- [ ] Verify:
  - Status shows "Approved" (green badge)
  - Can click to view details

---

## Backend Console Verification

When Manager opens dashboard, backend should log:

```
Team Expenses - Manager ID: 2
Team Expenses - Managed User IDs: [3]
Team Expenses - Total expenses in store: 1
Team Expenses - Found: 1
```

**What each means:**
- Manager ID: The logged-in manager's user ID
- Managed User IDs: Employees assigned to this manager
- Total expenses: All expenses in the system
- Found: Expenses from managed employees

---

## Troubleshooting

### ❌ "Managed User IDs: []"

**Problem:** Employee not assigned to manager

**Fix:**
1. Login as Admin
2. User Management
3. Find "Test Employee"
4. Click "Change Manager"
5. Select "Test Manager"
6. Click "Update Manager"
7. Logout and login as Manager again

### ❌ "Found: 0" but Managed User IDs has values

**Problem:** No submitted expenses OR expenses in Draft status

**Fix:**
1. Login as Employee
2. Check expense status
3. If "Draft", edit and click "Submit"
4. If no expense, create and submit one

### ❌ Expense not showing in Manager view

**Check:**
- [ ] Employee has manager assigned? (Admin → User Management)
- [ ] Expense status is "Waiting Approval"? (Not "Draft")
- [ ] Logged in as correct manager? (The one assigned to employee)
- [ ] Backend restarted after adding expense routes?

### ❌ "Failed to submit expense" error

**Check:**
1. Backend is running on port 5000
2. Browser console shows actual error
3. Backend console shows any errors
4. Token is valid (try logout/login)

---

## Success Criteria

✅ **All these should work:**

1. Employee can submit expense → Shows in their dashboard
2. Manager can see expense → Shows in Pending tab
3. Manager can approve → Status updates to Approved
4. Employee sees updated status → Shows as Approved
5. Currency conversion works → Manager sees company currency
6. Original currency shown → As secondary text below

---

## Quick Reset (If Needed)

If you want to start fresh:

1. **Restart backend** (Ctrl+C, then `npm start`)
   - This clears all data (in-memory storage)
2. **Signup new company** at `/signup`
3. **Follow test steps** from beginning

---

## Current Integration Status

### ✅ FULLY WORKING:
- Employee Dashboard → Backend API
- Backend API → Manager Dashboard
- Approve/Reject → Updates both dashboards
- Currency conversion
- Status filtering
- Receipt upload

### ⚠️ REQUIRES SETUP:
- Employee-Manager relationship (Admin must assign)
- Expense must be submitted (not draft)
- Correct manager must login

---

## Final Verification

After completing all steps, you should have:

**Employee Dashboard:**
- 1 expense showing
- Status: "Approved"
- Green badge

**Manager Dashboard:**
- 1 expense in "Approved" tab
- Status: "APPROVED"
- Shows approval date and manager name

**Backend Console:**
- No errors
- Shows successful API calls
- Logs show correct filtering

✅ **If all above are true → Integration is working perfectly!**
