// In-memory storage for all data
const store = {
  companies: [],
  users: [],
  approvalRules: [],
  
  // Helper counters for IDs
  nextCompanyId: 1,
  nextUserId: 1,
  nextRuleId: 1
};

module.exports = store;
