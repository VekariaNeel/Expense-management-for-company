# Testing Guide - Expense Management System

## Manual Testing Checklist

### 🔐 Authentication Tests

#### Test 1: Company Signup
**Steps:**
1. Navigate to `http://localhost:3000/signup`
2. Fill in the form:
   - Company Name: "Tech Solutions Inc"
   - Country: Select "United States"
   - Currency: Should auto-fill to "USD"
   - Admin Name: "John Admin"
   - Admin Email: "john@techsolutions.com"
   - Password: "Admin123!"
   - Confirm Password: "Admin123!"
3. Click "Sign Up"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Redirected to `/admin/users`
- ✅ Navbar shows "John Admin" and "Tech Solutions Inc"
- ✅ JWT token stored in localStorage
- ✅ No console errors

**Edge Cases:**
- ❌ Password mismatch → Shows error
- ❌ Email already exists → Shows error
- ❌ Missing fields → Shows validation error

---

#### Test 2: User Login
**Steps:**
1. Logout (click Logout button)
2. Navigate to `http://localhost:3000/login`
3. Enter credentials:
   - Email: "john@techsolutions.com"
   - Password: "Admin123!"
4. Click "Sign in"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/admin/users`
- ✅ User data loaded correctly
- ✅ Token stored in localStorage

**Edge Cases:**
- ❌ Wrong password → "Invalid credentials"
- ❌ Non-existent email → "Invalid credentials"
- ❌ Empty fields → Validation error

---

#### Test 3: Protected Routes
**Steps:**
1. Logout
2. Try to access `http://localhost:3000/admin/users` directly

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ Cannot access admin pages without authentication

---

### 👥 User Management Tests

#### Test 4: Add Employee
**Steps:**
1. Login as admin
2. Navigate to User Management
3. Click "Add User"
4. Fill in modal:
   - Name: "Alice Employee"
   - Email: "alice@techsolutions.com"
   - Role: "Employee"
   - Manager: Leave empty
5. Click "Add User"

**Expected Results:**
- ✅ Modal closes
- ✅ User appears in table
- ✅ Backend console shows generated password
- ✅ Password format: 12 characters with letters, numbers, symbols

**Backend Console Output:**
```
=================================
📧 EMAIL NOTIFICATION (STUB)
=================================
To: alice@techsolutions.com
Subject: Welcome to Expense Management System
Body: Your account has been created.
Login Email: alice@techsolutions.com
Temporary Password: [Random12Char!]
=================================
```

---

#### Test 5: Add Manager
**Steps:**
1. Click "Add User"
2. Fill in:
   - Name: "Bob Manager"
   - Email: "bob@techsolutions.com"
   - Role: "Manager"
   - Manager: Leave empty
3. Click "Add User"

**Expected Results:**
- ✅ Manager created successfully
- ✅ Appears in table with "Manager" role
- ✅ Password logged to console

---

#### Test 6: Add Employee with Manager
**Steps:**
1. Click "Add User"
2. Fill in:
   - Name: "Charlie Employee"
   - Email: "charlie@techsolutions.com"
   - Role: "Employee"
   - Manager: Select "Bob Manager"
3. Click "Add User"

**Expected Results:**
- ✅ Employee created with manager assigned
- ✅ Table shows "Bob Manager" in Manager column
- ✅ Password logged to console

---

#### Test 7: Change User Role
**Steps:**
1. Find "Alice Employee" in the table
2. Click the Role dropdown
3. Change from "Employee" to "Manager"

**Expected Results:**
- ✅ Role updates immediately
- ✅ No page refresh needed
- ✅ Change persists on page reload

---

#### Test 8: Assign Manager
**Steps:**
1. Find "Alice Employee" in the table
2. Click the Manager dropdown
3. Select "Bob Manager"

**Expected Results:**
- ✅ Manager assigned successfully
- ✅ Dropdown shows "Bob Manager"
- ✅ Change persists

---

#### Test 9: Resend Password
**Steps:**
1. Find any non-admin user in the table
2. Click "Send Password"

**Expected Results:**
- ✅ Alert shows "Password sent successfully"
- ✅ Backend console logs new password
- ✅ New password is different from original

---

#### Test 10: Admin Role Protection
**Steps:**
1. Try to change admin's role or manager

**Expected Results:**
- ✅ Admin role dropdown is disabled (shows badge)
- ✅ Admin manager field shows "-"
- ✅ Cannot send password to admin

---

### 📋 Approval Rules Tests

#### Test 11: Configure Basic Approval Rule
**Steps:**
1. Navigate to "Approval Rules"
2. Select "Charlie Employee" from dropdown
3. Configure:
   - Manager: "Bob Manager"
   - Approvers: Check "Bob Manager"
   - Is Manager Approver: Unchecked
   - Required Approver: Checked
   - Approval Type: Sequential
   - Minimum Approval %: 100
4. Click "Save Approval Rule"

**Expected Results:**
- ✅ Success alert shown
- ✅ Rule appears in "Existing Approval Rules" section
- ✅ All fields displayed correctly

---

#### Test 12: Configure Multi-Approver Rule
**Steps:**
1. Select "Alice Employee"
2. Configure:
   - Manager: "Bob Manager"
   - Approvers: Check "Bob Manager" and "Charlie Employee"
   - Is Manager Approver: Checked
   - Required Approver: Unchecked
   - Approval Type: Parallel
   - Minimum Approval %: 50
3. Click "Save Approval Rule"

**Expected Results:**
- ✅ Rule saved with multiple approvers
- ✅ Shows both approvers in rules list
- ✅ Parallel type displayed
- ✅ 50% threshold shown

---

#### Test 13: Update Existing Rule
**Steps:**
1. Select "Charlie Employee" (who already has a rule)
2. Change Minimum Approval % to 75
3. Click "Save Approval Rule"

**Expected Results:**
- ✅ Rule updated (not duplicated)
- ✅ New percentage shown in rules list
- ✅ Other fields remain unchanged

---

#### Test 14: Sequential vs Parallel
**Steps:**
1. Create rule with Sequential type
2. Edit same user and change to Parallel
3. Save

**Expected Results:**
- ✅ Type updates correctly
- ✅ UI shows radio button selection
- ✅ Rules list reflects change

---

### 🔄 Data Persistence Tests

#### Test 15: Page Refresh
**Steps:**
1. Add several users
2. Configure approval rules
3. Refresh the page (F5)

**Expected Results:**
- ✅ Still logged in
- ✅ All users still visible
- ✅ All rules still visible
- ✅ No data loss

---

#### Test 16: Logout and Login
**Steps:**
1. Logout
2. Login again with same credentials

**Expected Results:**
- ✅ Can login successfully
- ✅ All data still present
- ✅ Users and rules intact

---

#### Test 17: Server Restart
**Steps:**
1. Stop backend server (Ctrl+C)
2. Restart backend server (npm start)
3. Refresh frontend

**Expected Results:**
- ✅ All data is LOST (expected behavior)
- ✅ Need to signup again
- ✅ localStorage still has old token (will fail)
- ✅ Redirected to login

---

### 🎨 UI/UX Tests

#### Test 18: Responsive Design
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ Tables are scrollable on mobile
- ✅ Forms are usable on all devices
- ✅ Navigation works on mobile

---

#### Test 19: Form Validation
**Steps:**
1. Try to submit forms with:
   - Empty required fields
   - Invalid email format
   - Mismatched passwords

**Expected Results:**
- ✅ Browser validation triggers
- ✅ Error messages shown
- ✅ Form doesn't submit
- ✅ User can correct and resubmit

---

#### Test 20: Loading States
**Steps:**
1. Watch for loading indicators during:
   - Signup
   - Login
   - Page loads

**Expected Results:**
- ✅ "Loading..." or button text changes
- ✅ Buttons disabled during submission
- ✅ No double-submission possible

---

### 🐛 Error Handling Tests

#### Test 21: Backend Offline
**Steps:**
1. Stop backend server
2. Try to login or add user

**Expected Results:**
- ✅ Error message shown
- ✅ No crash
- ✅ User can retry after backend restarts

---

#### Test 22: Invalid Token
**Steps:**
1. Login successfully
2. Manually edit token in localStorage to invalid value
3. Try to access protected route

**Expected Results:**
- ✅ Redirected to login
- ✅ Token cleared
- ✅ Error message shown

---

#### Test 23: Duplicate Email
**Steps:**
1. Add user with email "test@example.com"
2. Try to add another user with same email

**Expected Results:**
- ✅ Error: "Email already exists"
- ✅ User not created
- ✅ First user unchanged

---

### 🔍 API Tests (Using Browser DevTools)

#### Test 24: Network Requests
**Steps:**
1. Open DevTools → Network tab
2. Perform various actions
3. Inspect requests

**Expected Results:**
- ✅ POST /api/auth/signup → 201 Created
- ✅ POST /api/auth/login → 200 OK
- ✅ GET /api/users → 200 OK
- ✅ POST /api/users → 201 Created
- ✅ Authorization header present on protected routes

---

#### Test 25: JWT Token
**Steps:**
1. Login
2. Open DevTools → Application → Local Storage
3. Check stored data

**Expected Results:**
- ✅ `token` key exists
- ✅ `user` key exists (JSON string)
- ✅ `company` key exists (JSON string)
- ✅ Token format: `xxx.yyy.zzz` (JWT)

---

## Test Data Sets

### Minimal Test Set
```
Company: Test Corp
Admin: admin@test.com / Admin123!
Employee 1: emp1@test.com (Employee, No Manager)
```

### Standard Test Set
```
Company: Tech Solutions Inc
Admin: admin@techsolutions.com / Admin123!
Manager 1: bob@techsolutions.com (Manager)
Employee 1: alice@techsolutions.com (Employee, Manager: Bob)
Employee 2: charlie@techsolutions.com (Employee, Manager: Bob)
```

### Complex Test Set
```
Company: Global Enterprises
Admin: admin@global.com / Admin123!
Manager 1: mgr1@global.com (Manager)
Manager 2: mgr2@global.com (Manager)
Employee 1: emp1@global.com (Employee, Manager: Manager 1)
Employee 2: emp2@global.com (Employee, Manager: Manager 1)
Employee 3: emp3@global.com (Employee, Manager: Manager 2)
Employee 4: emp4@global.com (Employee, Manager: Manager 2)

Approval Rules:
- emp1: Approvers [mgr1, emp2], Sequential, 100%
- emp2: Approvers [mgr1, emp1], Parallel, 50%
- emp3: Approvers [mgr2, mgr1], Sequential, 100%
- emp4: Approvers [mgr2, emp3], Parallel, 75%
```

---

## Automated Testing (Future)

### Unit Tests (Backend)
```javascript
// Example: Test password generation
describe('User Management', () => {
  test('generates 12-character password', () => {
    const password = generatePassword();
    expect(password).toHaveLength(12);
  });
});
```

### Integration Tests (Backend)
```javascript
// Example: Test signup endpoint
describe('POST /api/auth/signup', () => {
  test('creates company and admin', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        companyName: 'Test Corp',
        country: 'USA',
        currency: 'USD',
        adminName: 'Admin',
        adminEmail: 'admin@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!'
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

### E2E Tests (Frontend)
```javascript
// Example: Playwright test
test('user can signup and add employee', async ({ page }) => {
  await page.goto('http://localhost:3000/signup');
  await page.fill('[name="companyName"]', 'Test Corp');
  // ... fill other fields
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/admin/users');
});
```

---

## Performance Tests

### Test 26: Large User List
**Steps:**
1. Add 50+ users
2. Check page load time
3. Test scrolling and filtering

**Expected Results:**
- ✅ Page loads in < 2 seconds
- ✅ Smooth scrolling
- ✅ No lag in dropdowns

---

### Test 27: Concurrent Requests
**Steps:**
1. Open multiple browser tabs
2. Perform actions simultaneously

**Expected Results:**
- ✅ No race conditions
- ✅ Data consistency maintained
- ✅ No server crashes

---

## Security Tests

### Test 28: XSS Prevention
**Steps:**
1. Try to add user with name: `<script>alert('XSS')</script>`

**Expected Results:**
- ✅ Script not executed
- ✅ Displayed as plain text

---

### Test 29: SQL Injection (N/A)
**Note:** Not applicable as we use in-memory storage, but in production with DB:
- Test with inputs like `' OR '1'='1`
- Should be prevented by parameterized queries

---

## Bug Report Template

```markdown
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[If applicable]

**Console Errors:**
[Copy from browser/backend console]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Node: v18.17.0
```

---

## Testing Checklist Summary

- [ ] All authentication flows work
- [ ] Users can be created, updated, managed
- [ ] Approval rules can be configured
- [ ] Protected routes are secure
- [ ] Data persists during session
- [ ] Data resets on server restart (expected)
- [ ] UI is responsive
- [ ] Forms validate properly
- [ ] Errors are handled gracefully
- [ ] No console errors in normal operation
- [ ] JWT tokens work correctly
- [ ] Role-based access control works
- [ ] Passwords are generated and logged
- [ ] All CRUD operations function

---

**Testing Status:** ✅ Ready for Manual Testing

Run through this guide to verify all functionality works as expected!
