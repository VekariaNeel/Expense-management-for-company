const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');

const router = express.Router();

// Signup - Create Company + Admin
router.post('/signup', async (req, res) => {
  try {
    const { companyName, country, currency, adminName, adminEmail, password, confirmPassword } = req.body;
    
    // Validation
    if (!companyName || !country || !currency || !adminName || !adminEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Check if email already exists
    const existingUser = store.users.find(u => u.email === adminEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create company
    const company = {
      id: store.nextCompanyId++,
      name: companyName,
      country,
      currency,
      createdAt: new Date().toISOString()
    };
    store.companies.push(company);
    
    // Create admin user
    const admin = {
      id: store.nextUserId++,
      companyId: company.id,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      managerId: null,
      createdAt: new Date().toISOString()
    };
    store.users.push(admin);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: admin.id, companyId: company.id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    // Return response without password
    const { password: _, ...adminData } = admin;
    
    res.status(201).json({
      token,
      user: adminData,
      company
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = store.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Find company
    const company = store.companies.find(c => c.id === user.companyId);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    // Return response without password
    const { password: _, ...userData } = user;
    
    res.json({
      token,
      user: userData,
      company
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Reset Password (for users with temporary passwords)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    
    // Validation
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Find user
    const user = store.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Find company
    const company = store.companies.find(c => c.id === user.companyId);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    // Return response without password
    const { password: _, ...userData } = user;
    
    res.json({
      token,
      user: userData,
      company,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

module.exports = router;
