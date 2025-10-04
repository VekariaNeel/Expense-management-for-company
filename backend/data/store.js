// In-memory storage for all data
const store = {
  companies: [],
  users: [],
  approvalRules: [],
  expenses: [],
  receipts: [],
  
  // Helper counters for IDs
  nextCompanyId: 1,
  nextUserId: 1,
  nextRuleId: 1,
  nextExpenseId: 1,
  nextReceiptId: 1
};

module.exports = store;
