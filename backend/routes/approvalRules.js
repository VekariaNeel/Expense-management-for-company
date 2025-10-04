const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const store = require('../data/store');

const router = express.Router();

// Get all approval rules for company
router.get('/', auth, adminOnly, (req, res) => {
  try {
    const rules = store.approvalRules
      .filter(r => r.companyId === req.user.companyId)
      .map(rule => {
        // Enrich with user names
        const user = store.users.find(u => u.id === rule.userId);
        const manager = store.users.find(u => u.id === rule.managerId);
        const approvers = rule.approverIds.map(id => {
          const approver = store.users.find(u => u.id === id);
          return approver ? { id: approver.id, name: approver.name } : null;
        }).filter(Boolean);
        
        return {
          ...rule,
          userName: user ? user.name : null,
          managerName: manager ? manager.name : null,
          approvers
        };
      });
    
    res.json(rules);
  } catch (error) {
    console.error('Get approval rules error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get approval rule for specific user
router.get('/:userId', auth, adminOnly, (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const rule = store.approvalRules.find(
      r => r.userId === userId && r.companyId === req.user.companyId
    );
    
    if (!rule) {
      return res.status(404).json({ error: 'Approval rule not found' });
    }
    
    res.json(rule);
  } catch (error) {
    console.error('Get approval rule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update approval rule
router.post('/', auth, adminOnly, (req, res) => {
  try {
    const {
      userId,
      managerId,
      approverIds,
      isManagerApprover,
      isRequiredApprover,
      approvalType,
      minimumApprovalPercentage
    } = req.body;
    
    // Validation
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Verify user exists
    const user = store.users.find(u => u.id === userId && u.companyId === req.user.companyId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify manager if provided
    if (managerId) {
      const manager = store.users.find(u => u.id === managerId && u.companyId === req.user.companyId);
      if (!manager) {
        return res.status(400).json({ error: 'Invalid manager ID' });
      }
    }
    
    // Verify approvers
    const validApproverIds = approverIds || [];
    for (const approverId of validApproverIds) {
      const approver = store.users.find(u => u.id === approverId && u.companyId === req.user.companyId);
      if (!approver) {
        return res.status(400).json({ error: `Invalid approver ID: ${approverId}` });
      }
    }
    
    // Validate approval type
    if (approvalType && !['Sequential', 'Parallel'].includes(approvalType)) {
      return res.status(400).json({ error: 'Approval type must be Sequential or Parallel' });
    }
    
    // Validate minimum approval percentage
    const minPercentage = minimumApprovalPercentage || 100;
    if (minPercentage < 0 || minPercentage > 100) {
      return res.status(400).json({ error: 'Minimum approval percentage must be between 0 and 100' });
    }
    
    // Check if rule already exists
    const existingRuleIndex = store.approvalRules.findIndex(
      r => r.userId === userId && r.companyId === req.user.companyId
    );
    
    const ruleData = {
      userId,
      companyId: req.user.companyId,
      managerId: managerId || null,
      approverIds: validApproverIds,
      isManagerApprover: isManagerApprover || false,
      isRequiredApprover: isRequiredApprover || false,
      approvalType: approvalType || 'Sequential',
      minimumApprovalPercentage: minPercentage,
      updatedAt: new Date().toISOString()
    };
    
    if (existingRuleIndex >= 0) {
      // Update existing rule
      store.approvalRules[existingRuleIndex] = {
        ...store.approvalRules[existingRuleIndex],
        ...ruleData
      };
      res.json(store.approvalRules[existingRuleIndex]);
    } else {
      // Create new rule
      const newRule = {
        id: store.nextRuleId++,
        ...ruleData,
        createdAt: new Date().toISOString()
      };
      store.approvalRules.push(newRule);
      res.status(201).json(newRule);
    }
  } catch (error) {
    console.error('Create/update approval rule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
