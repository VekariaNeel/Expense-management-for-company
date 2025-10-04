# Debugging Manager Dashboard - No Expenses Showing

## The Problem
Expenses submitted by employees are not showing up in the manager's dashboard.

## Root Cause
For expenses to appear in a manager's dashboard, THREE conditions must be met:

1. ✅ **Employee must have a manager assigned** (managerId field in user record)
2. ✅ **Expense must be submitted** (status = "Waiting Approval", NOT "Draft")
3. ✅ **Correct manager must be logged in** (the one assigned to the employee)

## How to Fix

### Step 1: Restart Backend (if you haven't already)
```bash
cd backend
# Press Ctrl+C to stop
npm start
```

### Step 2: Assign Manager to Employee

1. Login as **Admin**
2. Go to **User Management** page
3. Find the employee who submitted expenses
4. Click **"Change Manager"** button
5. Select a manager from the dropdown
6. Click **"Update Manager"**

### Step 3: Submit Expense (Not Draft)

1. Login as **Employee**
2. Go to Employee Dashboard
3. Click **"New Expense"**
4. Fill in all details
5. Click **"Submit"** button (NOT "Save Draft")
   - Status should show "Waiting Approval"

### Step 4: View in Manager Dashboard

1. **Logout** from employee account
2. **Login** as the **Manager** who was assigned to that employee
3. Go to Manager Dashboard
4. You should now see the expense in the "Pending" tab

## Checking Backend Logs

After restarting backend, when you open Manager Dashboard, check the terminal for logs:

```
Team Expenses - Manager ID: 2
Team Expenses - Managed User IDs: [3, 4]
Team Expenses - Total expenses in store: 5
Team Expenses - Found: 2
```

### What the logs mean:
- **Manager ID**: The logged-in manager's user ID
- **Managed User IDs**: Array of employee IDs assigned to this manager
- **Total expenses in store**: All expenses in the system
- **Found**: Expenses from managed employees

### If "Managed User IDs" is empty []
→ No employees are assigned to this manager
→ Go to Admin panel and assign employees to this manager

### If "Found" is 0 but "Managed User IDs" has values
→ Those employees haven't submitted any expenses yet
→ OR expenses are in "Draft" status (not submitted)

## Quick Test Scenario

1. **Create Manager User** (Admin panel)
   - Name: Test Manager
   - Email: manager@test.com
   - Role: Manager

2. **Create Employee User** (Admin panel)
   - Name: Test Employee
   - Email: employee@test.com
   - Role: Employee
   - **Manager: Test Manager** ← IMPORTANT!

3. **Submit Expense** (Login as employee@test.com)
   - Fill expense form
   - Click **"Submit"** (not Save Draft)

4. **View in Manager Dashboard** (Login as manager@test.com)
   - Should see the expense in Pending tab

## Still Not Working?

Check the backend console logs and share:
1. The "Team Expenses" log output
2. Whether the employee has a managerId assigned
3. The status of the submitted expense
