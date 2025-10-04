const express = require('express');
const bcrypt = require('bcryptjs');
const { auth, adminOnly } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get all users in company
router.get('/', auth, adminOnly, (req, res) => {
  try {
    const users = store.users
      .filter(u => u.companyId === req.user.companyId)
      .map(u => {
        const { password, ...userData } = u;
        // Get manager name if exists
        if (u.managerId) {
          const manager = store.users.find(m => m.id === u.managerId);
          userData.managerName = manager ? manager.name : null;
        }
        return userData;
      });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, role, managerId } = req.body;
    
    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    
    if (!['Employee', 'Manager'].includes(role)) {
      return res.status(400).json({ error: 'Role must be Employee or Manager' });
    }
    
    // Check if email already exists
    const existingUser = store.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Verify manager exists if provided
    if (managerId) {
      const manager = store.users.find(u => u.id === managerId && u.companyId === req.user.companyId);
      if (!manager) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }
    
    // Generate random password
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Create user
    const user = {
      id: store.nextUserId++,
      companyId: req.user.companyId,
      name,
      email,
      password: hashedPassword,
      role,
      managerId: managerId || null,
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
    
    // Log password (stub email)
    console.log('=================================');
    console.log('📧 EMAIL NOTIFICATION (STUB)');
    console.log('=================================');
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to Expense Management System`);
    console.log(`Body: Your account has been created.`);
    console.log(`Login Email: ${email}`);
    console.log(`Temporary Password: ${plainPassword}`);
    console.log('=================================\n');
    
    // Return user without password
    const { password, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role
router.put('/:id/role', auth, adminOnly, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (!['Employee', 'Manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = store.users.find(u => u.id === userId && u.companyId === req.user.companyId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot change admin role' });
    }
    
    user.role = role;
    
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user manager
router.put('/:id/manager', auth, adminOnly, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { managerId } = req.body;
    
    const user = store.users.find(u => u.id === userId && u.companyId === req.user.companyId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot assign manager to admin' });
    }
    
    // Verify manager exists if provided
    if (managerId) {
      const manager = store.users.find(u => u.id === managerId && u.companyId === req.user.companyId);
      if (!manager) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }
    
    user.managerId = managerId || null;
    
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Update manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend password
router.post('/:id/send-password', auth, adminOnly, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = store.users.find(u => u.id === userId && u.companyId === req.user.companyId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'Admin') {
      return res.status(400).json({ error: 'Cannot reset admin password this way' });
    }
    
    // Generate new password
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    user.password = hashedPassword;
    
    // Log password (stub email)
    console.log('=================================');
    console.log('📧 EMAIL NOTIFICATION (STUB)');
    console.log('=================================');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Password Reset - Expense Management System`);
    console.log(`Body: Your password has been reset.`);
    console.log(`Login Email: ${user.email}`);
    console.log(`New Password: ${plainPassword}`);
    console.log('=================================\n');
    
    res.json({ message: 'Password sent successfully' });
  } catch (error) {
    console.error('Send password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
