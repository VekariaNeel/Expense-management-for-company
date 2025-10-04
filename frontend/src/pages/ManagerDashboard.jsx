import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check, X, Eye, DollarSign, TrendingUp, Users, FileText, AlertCircle, LogOut
} from 'lucide-react';

const ManagerDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [teamBudgets, setTeamBudgets] = useState([]);
  const [companyCurrency, setCompanyCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [comment, setComment] = useState('');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  // Simple toast system
  const pushToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  useEffect(() => {
    if (company) {
      setCompanyCurrency(company.currency || 'USD');
      fetchExchangeRates(company.currency || 'USD');
    }
    fetchExpenses();
    // Mock team budgets - in real app, this would come from API
    setTeamBudgets([
      { team: 'Engineering', budget: 50000, spent: 32500, currency: 'USD', leader: user?.name || 'Manager', employees: [] },
      { team: 'Sales', budget: 75000, spent: 68200, currency: 'USD', leader: user?.name || 'Manager', employees: [] }
    ]);
  }, [company, user]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/expenses/team-expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Map to expected format
        const mappedExpenses = data.map(exp => ({
          ...exp,
          subject: exp.description,
          teamName: exp.category, // Using category as team for now
          status: exp.status === 'Waiting Approval' ? 'pending' : exp.status.toLowerCase()
        }));
        setExpenses(mappedExpenses);
      } else {
        console.error('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRates = async (baseCurrency) => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      const data = await response.json();
      setExchangeRates(data.rates || {});
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRates({ USD: 1, EUR: 0.92, INR: 83, GBP: 0.77, CAD: 1.35 });
    }
  };

  const convertToCompanyCurrency = (amount, fromCurrency) => {
    if (!exchangeRates || Object.keys(exchangeRates).length === 0) return amount;
    if (fromCurrency === companyCurrency) return amount;

    const rateFrom = exchangeRates[fromCurrency] ?? 1;
    const rateTarget = exchangeRates[companyCurrency] ?? 1;
    const amountInBase = amount / rateFrom;
    return amountInBase * rateTarget;
  };

  const formatCurrency = (amount, currency) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const handleApprove = async (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;
    const convertedAmount = convertToCompanyCurrency(expense.amount, expense.currency);

    const team = teamBudgets.find(t => t.team === expense.teamName);
    if (!team) {
      pushToast(`Team not found for ${expense.teamName}`, 'error');
      return;
    }

    const remaining = team.budget - team.spent;
    if (convertedAmount > remaining) {
      pushToast(`Budget limit exceeded for ${expense.teamName}. Auto-rejecting.`, 'error');
      await handleReject(expenseId, 'Budget exceeded');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/expenses/${expenseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment })
      });

      if (response.ok) {
        setTeamBudgets(prev => prev.map(t =>
          t.team === expense.teamName ? { ...t, spent: t.spent + convertedAmount } : t
        ));

        await fetchExpenses();
        setComment('');
        setConfirmAction(null);
        setSelectedExpense(null);

        const pct = (((team.spent + convertedAmount) / team.budget) * 100).toFixed(1);
        pushToast(`Approved ✓ — ${expense.teamName} now at ${pct}% of budget.`, 'success');
      } else {
        pushToast('Failed to approve expense', 'error');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      pushToast('Error approving expense', 'error');
    }
  };

  const handleReject = async (expenseId, reason = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/expenses/${expenseId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason: reason || comment || 'No reason provided' })
      });

      if (response.ok) {
        await fetchExpenses();
        setComment('');
        setConfirmAction(null);
        setSelectedExpense(null);
        pushToast('Expense rejected.', 'warning');
      } else {
        pushToast('Failed to reject expense', 'error');
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
      pushToast('Error rejecting expense', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    return styles[status] || styles.pending;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food & Beverage': return '🍽';
      case 'Travel': return '✈';
      case 'Healthcare': return '🏥';
      case 'Office Supplies': return '📎';
      case 'Entertainment': return '🎉';
      default: return '📄';
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (activeTab === 'pending') return exp.status === 'pending';
      if (activeTab === 'approved') return exp.status === 'approved';
      if (activeTab === 'rejected') return exp.status === 'rejected';
      return true;
    });
  }, [expenses, activeTab]);

  const totalPendingAmount = useMemo(() => {
    return expenses
      .filter(exp => exp.status === 'pending')
      .reduce((sum, exp) => sum + convertToCompanyCurrency(exp.amount, exp.currency), 0);
  }, [expenses, exchangeRates, companyCurrency]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 overflow-hidden flex flex-col">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-sm font-medium border ${
              t.type === 'success' ? 'bg-green-50 text-green-800 border-green-300' :
              t.type === 'error'   ? 'bg-red-50 text-red-800 border-red-300'     :
              t.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                                      'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>

      <div className="bg-white shadow-md border-b border-blue-200" style={{ backgroundColor: '#ADE8F4' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
              <p className="text-sm text-gray-700 mt-1">Expense Approval & Team Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-700">Welcome, {user?.name}</p>
                <p className="text-xs text-gray-600">{company?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <div className="h-full flex flex-col gap-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {expenses.filter(e => e.status === 'pending').length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Pending Amount</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">
                    {formatCurrency(totalPendingAmount, companyCurrency)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Approved This Month</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {expenses.filter(e => e.status === 'approved').length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Team Members</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {teamBudgets.reduce((sum, t) => sum + (t.employees?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
            {/* Expenses Table */}
            <div className="col-span-2 bg-white rounded-lg shadow-md border-2 border-blue-200 flex flex-col overflow-hidden">
              <div className="border-b" style={{ backgroundColor: '#ADE8F4' }}>
                <div className="flex items-center justify-between px-4">
                  <div className="flex space-x-6">
                    {['pending', 'approved', 'rejected', 'all'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                          activeTab === tab
                            ? 'border-blue-700 text-blue-900'
                            : 'border-transparent text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span className="ml-2 bg-white text-gray-700 py-0.5 px-2 rounded-full text-xs font-semibold">
                          {expenses.filter(e => tab === 'all' || e.status === tab).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">Loading expenses...</div>
                ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Subject</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Owner</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Team</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => {
                      const convertedAmount = convertToCompanyCurrency(expense.amount, expense.currency);
                      const isPending = expense.status === 'pending';
                      const team = teamBudgets.find(t => t.team === expense.teamName);
                      const remaining = team ? team.budget - team.spent : 0;
                      const willExceed = isPending && team && convertedAmount > remaining;

                      return (
                        <tr key={expense.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{getCategoryIcon(expense.category)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{expense.subject}</div>
                                <div className="text-xs text-gray-500">{expense.date}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm text-gray-900">{expense.requestOwner}</div>
                            <div className="text-xs text-gray-500">{expense.employeeId}</div>
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              {expense.teamName}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm text-gray-900">{expense.category}</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(convertedAmount, companyCurrency)}
                            </div>
                            {expense.currency !== companyCurrency && (
                              <div className="text-xs text-gray-500">
                                {formatCurrency(expense.amount, expense.currency)}
                              </div>
                            )}
                            {willExceed && (
                              <div className="text-xs mt-1 font-semibold text-red-700">
                                Will exceed remaining: {formatCurrency(remaining, team.currency)}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusBadge(expense.status)}`}>
                              {expense.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {isPending ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setConfirmAction('approve');
                                  }}
                                  className="text-white bg-green-600 hover:bg-green-700 font-medium px-3 py-1 rounded flex items-center text-xs disabled:opacity-60"
                                  disabled={willExceed}
                                  title={willExceed ? 'Exceeds budget' : 'Approve'}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedExpense(expense);
                                    setConfirmAction('reject');
                                  }}
                                  className="text-white bg-red-600 hover:bg-red-700 font-medium px-3 py-1 rounded flex items-center text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedExpense(expense)}
                                className="text-blue-700 hover:text-blue-900 font-medium flex items-center text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}
              </div>

              {!loading && filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No expenses found</p>
                </div>
              )}
            </div>

            {/* Team Budgets */}
            <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: '#ADE8F4' }}>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-gray-800 mr-2" />
                  <h2 className="text-lg font-bold text-gray-900">Team Budgets</h2>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {teamBudgets.map((team, idx) => {
                  const percentage = (team.spent / team.budget) * 100;
                  const isOverBudget = percentage >= 100;
                  const warnNear = !isOverBudget && percentage > 90;

                  return (
                    <div key={idx} className="border-2 border-blue-200 rounded-lg p-3 bg-gradient-to-br from-white to-blue-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-0.5 text-sm">{team.team}</h3>
                          <p className="text-xs text-gray-600">Leader: <span className="font-medium text-gray-800">{team.leader || '—'}</span></p>
                        </div>
                      </div>

                      {(isOverBudget || warnNear) && (
                        <div className={`mt-2 px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 border ${
                          isOverBudget
                            ? 'bg-red-50 text-red-800 border-red-300'
                            : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                        }`}>
                          <AlertCircle className="w-3 h-3" />
                          {isOverBudget ? 'Budget limit reached' : 'Approaching budget limit'}
                        </div>
                      )}

                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 font-medium">Budget:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(team.budget, team.currency)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 font-medium">Spent:</span>
                          <span className="font-bold text-gray-900">{formatCurrency(team.spent, team.currency)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-2 border border-gray-300">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOverBudget
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-700'}`}>
                          {percentage.toFixed(1)}% Utilized
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {selectedExpense && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border-4" style={{ borderColor: '#ADE8F4' }}>
            <div className="px-6 py-4 border-b flex items-center" style={{ backgroundColor: '#ADE8F4' }}>
              <AlertCircle className="w-6 h-6 text-gray-800 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Confirm {confirmAction === 'approve' ? 'Approval' : 'Rejection'}
              </h2>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  You are about to {confirmAction} the following expense:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600">Subject</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedExpense.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Employee</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.requestOwner}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Team</label>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {selectedExpense.teamName}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Category</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.category}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Date</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.date}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Amount</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      convertToCompanyCurrency(selectedExpense.amount, selectedExpense.currency),
                      companyCurrency
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-gray-600">Description</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedExpense.description}
                </p>
              </div>

              <div className="mt-4">
                <label className="text-xs font-bold text-gray-600">Add Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full mt-2 p-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows="2"
                  placeholder="Add your comments..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setComment('');
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-bold hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() =>
                  confirmAction === 'approve'
                    ? handleApprove(selectedExpense.id)
                    : handleReject(selectedExpense.id)
                }
                className={`flex-1 text-white py-3 px-4 rounded-lg font-bold transition-colors ${
                  confirmAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedExpense && !confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border-4" style={{ borderColor: '#ADE8F4' }}>
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ backgroundColor: '#ADE8F4' }}>
              <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-700 hover:text-gray-900 font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600">Subject</label>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedExpense.subject}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${getStatusBadge(selectedExpense.status)}`}>
                      {selectedExpense.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Employee</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.requestOwner}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Team</label>
                  <p className="text-sm text-gray-900 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {selectedExpense.teamName}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Category</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.category}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600">Date</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.date}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-600">Amount</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {formatCurrency(
                      convertToCompanyCurrency(selectedExpense.amount, selectedExpense.currency),
                      companyCurrency
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600">Description</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedExpense.description}
                </p>
              </div>

              {selectedExpense.status === 'approved' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-semibold">
                    Approved by {selectedExpense.approvedBy} on {selectedExpense.approvalDate}
                  </p>
                </div>
              )}

              {selectedExpense.status === 'rejected' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-semibold">
                    Rejected by {selectedExpense.rejectedBy} on {selectedExpense.rejectionDate}
                  </p>
                  <p className="text-sm text-red-800 mt-1">
                    Reason: {selectedExpense.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setSelectedExpense(null)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
