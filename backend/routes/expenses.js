const express = require('express');
const { auth } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all expenses for the logged-in user (Employee view)
router.get('/my-expenses', auth, (req, res) => {
  try {
    const userExpenses = store.expenses
      .filter(e => e.userId === req.user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(userExpenses);
  } catch (error) {
    console.error('Get my expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending expenses for manager approval
router.get('/pending', auth, (req, res) => {
  try {
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all users managed by this manager
    const managedUserIds = store.users
      .filter(u => u.managerId === req.user.id && u.companyId === req.user.companyId)
      .map(u => u.id);

    console.log('Manager ID:', req.user.id);
    console.log('Managed User IDs:', managedUserIds);
    console.log('All expenses:', store.expenses.map(e => ({ id: e.id, userId: e.userId, status: e.status })));

    // Get pending expenses from managed users
    const pendingExpenses = store.expenses
      .filter(e => 
        managedUserIds.includes(e.userId) && 
        (e.status === 'Waiting Approval' || e.status === 'pending')
      )
      .map(expense => {
        const user = store.users.find(u => u.id === expense.userId);
        return {
          ...expense,
          requestOwner: user?.name || 'Unknown',
          employeeId: `EMP${String(expense.userId).padStart(3, '0')}`
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Pending expenses found:', pendingExpenses.length);
    res.json(pendingExpenses);
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all expenses for manager (all statuses)
router.get('/team-expenses', auth, (req, res) => {
  try {
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all users managed by this manager
    const managedUserIds = store.users
      .filter(u => u.managerId === req.user.id && u.companyId === req.user.companyId)
      .map(u => u.id);

    console.log('Team Expenses - Manager ID:', req.user.id);
    console.log('Team Expenses - Managed User IDs:', managedUserIds);
    console.log('Team Expenses - Total expenses in store:', store.expenses.length);

    // Get all expenses from managed users
    const teamExpenses = store.expenses
      .filter(e => managedUserIds.includes(e.userId))
      .map(expense => {
        const user = store.users.find(u => u.id === expense.userId);
        return {
          ...expense,
          requestOwner: user?.name || 'Unknown',
          employeeId: `EMP${String(expense.userId).padStart(3, '0')}`
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log('Team Expenses - Found:', teamExpenses.length);
    res.json(teamExpenses);
  } catch (error) {
    console.error('Get team expenses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new expense
router.post('/', auth, (req, res) => {
  try {
    const { 
      description, 
      date, 
      category, 
      paidBy, 
      remarks, 
      amount, 
      currency, 
      status,
      receiptId 
    } = req.body;

    // Validation
    if (!description || !amount || !date) {
      return res.status(400).json({ error: 'Description, amount, and date are required' });
    }

    const expense = {
      id: store.nextExpenseId++,
      userId: req.user.id,
      companyId: req.user.companyId,
      employee: req.user.name,
      description,
      date,
      category: category || 'Other',
      paidBy: paidBy || '',
      remarks: remarks || '',
      amount: parseFloat(amount),
      currency: currency || 'USD',
      status: status || 'Draft',
      receiptId: receiptId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.expenses.push(expense);
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, (req, res) => {
  try {
    const expenseId = parseInt(req.params.id);
    const expense = store.expenses.find(e => e.id === expenseId && e.userId === req.user.id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Don't allow editing approved expenses
    if (expense.status === 'Approved') {
      return res.status(400).json({ error: 'Cannot edit approved expenses' });
    }

    const { 
      description, 
      date, 
      category, 
      paidBy, 
      remarks, 
      amount, 
      currency, 
      status,
      receiptId 
    } = req.body;

    // Update fields
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    if (category !== undefined) expense.category = category;
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (remarks !== undefined) expense.remarks = remarks;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (currency !== undefined) expense.currency = currency;
    if (status !== undefined) expense.status = status;
    if (receiptId !== undefined) expense.receiptId = receiptId;
    
    expense.updatedAt = new Date().toISOString();

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve expense (Manager only)
router.put('/:id/approve', auth, (req, res) => {
  try {
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const expenseId = parseInt(req.params.id);
    const expense = store.expenses.find(e => e.id === expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify the expense belongs to a user managed by this manager
    const expenseUser = store.users.find(u => u.id === expense.userId);
    if (!expenseUser || expenseUser.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only approve expenses from your team members' });
    }

    const { comment } = req.body;

    expense.status = 'Approved';
    expense.approvedBy = req.user.name;
    expense.approvalDate = new Date().toISOString().split('T')[0];
    expense.comment = comment || '';
    expense.updatedAt = new Date().toISOString();

    res.json(expense);
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject expense (Manager only)
router.put('/:id/reject', auth, (req, res) => {
  try {
    if (req.user.role !== 'Manager' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const expenseId = parseInt(req.params.id);
    const expense = store.expenses.find(e => e.id === expenseId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify the expense belongs to a user managed by this manager
    const expenseUser = store.users.find(u => u.id === expense.userId);
    if (!expenseUser || expenseUser.managerId !== req.user.id) {
      return res.status(403).json({ error: 'You can only reject expenses from your team members' });
    }

    const { rejectionReason } = req.body;

    expense.status = 'Rejected';
    expense.rejectedBy = req.user.name;
    expense.rejectionDate = new Date().toISOString().split('T')[0];
    expense.rejectionReason = rejectionReason || 'No reason provided';
    expense.updatedAt = new Date().toISOString();

    res.json(expense);
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload receipt
router.post('/receipts', auth, (req, res) => {
  try {
    const { name, dataUrl } = req.body;

    if (!name || !dataUrl) {
      return res.status(400).json({ error: 'Name and dataUrl are required' });
    }

    const receipt = {
      id: store.nextReceiptId++,
      userId: req.user.id,
      name,
      dataUrl,
      addedAt: new Date().toISOString()
    };

    store.receipts.push(receipt);
    res.status(201).json(receipt);
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's receipts
router.get('/receipts', auth, (req, res) => {
  try {
    const userReceipts = store.receipts
      .filter(r => r.userId === req.user.id)
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    
    res.json(userReceipts);
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
