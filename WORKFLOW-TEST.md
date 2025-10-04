# Complete Expense Workflow Test

## Current Implementation Status

### ✅ Backend API (All Connected)
- `POST /api/expenses` - Employee creates expense
- `GET /api/expenses/my-expenses` - Employee views their expenses
- `GET /api/expenses/team-expenses` - Manager views team expenses
- `PUT /api/expenses/:id/approve` - Manager approves expense
- `PUT /api/expenses/:id/reject` - Manager rejects expense

### ✅ Frontend Pages (All Connected)
- **EmployeeDashboard** - Fetches from `/api/expenses/my-expenses`
- **ManagerDashboard** - Fetches from `/api/expenses/team-expenses`

## The Flow

```
Employee Submits Expense
         ↓
   Backend stores it
         ↓
Manager's Dashboard fetches team-expenses
         ↓
   Filters by managerId
         ↓
Shows expenses from managed employees
```

## Critical Requirement

**For the flow to work, the employee MUST have a manager assigned!**

### Backend Logic (expenses.js line 69-71):
```javascript
const managedUserIds = store.users
  .filter(u => u.managerId === req.user.id && u.companyId === req.user.companyId)
  .map(u => u.id);
```

This means:
- Backend looks for users where `managerId === current manager's id`
- If employee has NO managerId, they won't appear in ANY manager's view
- If employee has managerId = 5, only manager with id = 5 will see their expenses

## Step-by-Step Test

### 1. Setup Users (Admin Panel)

**Create Manager:**
- Login as Admin
- Go to User Management
- Add User:
  - Name: John Manager
  - Email: john.manager@company.com
  - Role: Manager
- Note the password from console

**Create Employee:**
- Add User:
  - Name: Jane Employee
  - Email: jane.employee@company.com
  - Role: Employee
  - **Manager: John Manager** ← CRITICAL!
- Note the password from console

### 2. Submit Expense (Employee)

- Logout from Admin
- Login as: jane.employee@company.com
- Go to Employee Dashboard
- Click "New Expense"
- Fill form:
  - Date: Today
  - Category: Food
  - Description: Team Lunch
  - Paid By: Cash
  - Amount: 500
  - Currency: INR
- Click **"Submit"** (NOT "Save Draft")
- Verify status shows "Waiting Approval"

### 3. View in Manager Dashboard

- Logout from Employee
- Login as: john.manager@company.com
- Go to Manager Dashboard
- **Should see the expense in "Pending" tab**

### 4. Check Backend Logs

In the backend terminal, you should see:
```
Team Expenses - Manager ID: 2
Team Expenses - Managed User IDs: [3]
Team Expenses - Total expenses in store: 1
Team Expenses - Found: 1
```

## Troubleshooting

### Issue: "Managed User IDs: []" (Empty Array)

**Problem:** No employees assigned to this manager

**Solution:**
1. Login as Admin
2. Go to User Management
3. Find the employee
4. Click "Change Manager"
5. Select the manager
6. Click "Update Manager"

### Issue: "Found: 0" but "Managed User IDs: [3]"

**Problem:** Employee hasn't submitted expenses OR expenses are in Draft status

**Solution:**
1. Login as Employee
2. Check if expense exists
3. If status is "Draft", edit it and click "Submit"
4. If no expense, create and submit one

### Issue: Expense shows in Employee view but not Manager view

**Possible Causes:**
1. **Wrong manager logged in** - Check if the logged-in manager is the one assigned to the employee
2. **Status is Draft** - Only "Waiting Approval" expenses show in manager view
3. **Backend not restarted** - Restart backend after code changes

## Verification Checklist

Before testing, verify:

- [ ] Backend server is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Backend has been restarted after adding expense routes
- [ ] Employee user has a manager assigned (check managerId field)
- [ ] Expense status is "Waiting Approval" (not "Draft")
- [ ] Logged in as the correct manager (the one assigned to employee)

## Expected Behavior

✅ **Employee Dashboard:**
- Shows all expenses created by logged-in employee
- Can filter by: All, Draft, Waiting Approval, Approved, Rejected
- Can edit Draft expenses
- Can view rejection details

✅ **Manager Dashboard:**
- Shows expenses from ALL employees assigned to this manager
- Pending tab: Shows "Waiting Approval" expenses
- Approved tab: Shows approved expenses
- Rejected tab: Shows rejected expenses
- All tab: Shows all expenses from managed employees
- Can approve/reject with comments
- Shows currency conversion to company currency

## Database State (In-Memory)

After successful test, the store should have:

**store.users:**
```javascript
[
  { id: 1, role: 'Admin', name: 'Admin', ... },
  { id: 2, role: 'Manager', name: 'John Manager', managerId: null, ... },
  { id: 3, role: 'Employee', name: 'Jane Employee', managerId: 2, ... }
]
```

**store.expenses:**
```javascript
[
  {
    id: 1,
    userId: 3,  // Jane Employee
    companyId: 1,
    description: 'Team Lunch',
    amount: 500,
    currency: 'INR',
    status: 'Waiting Approval',
    ...
  }
]
```

When Manager (id: 2) logs in:
1. Backend finds users where managerId === 2 → finds user id: 3
2. Backend filters expenses where userId === 3 → finds expense id: 1
3. Returns expense to Manager Dashboard
4. Manager sees "Team Lunch - 500 INR" in Pending tab

## Quick Debug Commands

Check if backend is running:
```bash
curl http://localhost:5000/api/health
```

Check network tab in browser:
- Should see request to `/api/expenses/team-expenses`
- Should return 200 OK with array of expenses
- If returns 403: Not logged in as Manager
- If returns empty array: No managed employees or no expenses
