import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminApprovalRules = () => {
  const [users, setUsers] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    managerId: '',
    approverIds: [],
    isManagerApprover: false,
    isRequiredApprover: false,
    approvalType: 'Sequential',
    minimumApprovalPercentage: 100
  });
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.filter(u => u.role !== 'Admin'));
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/approval-rules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rules');
      }

      const data = await response.json();
      setRules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRules();
  }, [token]);

  const handleUserSelect = async (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);

    // Try to fetch existing rule
    try {
      const response = await fetch(`http://localhost:5000/api/approval-rules/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const rule = await response.json();
        setFormData({
          managerId: rule.managerId || user.managerId || '',
          approverIds: rule.approverIds || [],
          isManagerApprover: rule.isManagerApprover || false,
          isRequiredApprover: rule.isRequiredApprover || false,
          approvalType: rule.approvalType || 'Sequential',
          minimumApprovalPercentage: rule.minimumApprovalPercentage || 100
        });
      } else {
        // No existing rule, use defaults
        setFormData({
          managerId: user.managerId || '',
          approverIds: [],
          isManagerApprover: false,
          isRequiredApprover: false,
          approvalType: 'Sequential',
          minimumApprovalPercentage: 100
        });
      }
    } catch (err) {
      console.error('Error fetching rule:', err);
    }
  };

  const handleApproverToggle = (approverId) => {
    setFormData(prev => ({
      ...prev,
      approverIds: prev.approverIds.includes(approverId)
        ? prev.approverIds.filter(id => id !== approverId)
        : [...prev.approverIds, approverId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/approval-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...formData,
          managerId: formData.managerId ? parseInt(formData.managerId) : null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save rule');
      }

      alert('Approval rule saved successfully!');
      fetchRules();
      setSelectedUser(null);
      setFormData({
        managerId: '',
        approverIds: [],
        isManagerApprover: false,
        isRequiredApprover: false,
        approvalType: 'Sequential',
        minimumApprovalPercentage: 100
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const managers = users.filter(u => u.role === 'Manager');
  const potentialApprovers = users.filter(u => u.id !== selectedUser?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Approval Rules Management</h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Configure Approval Rule</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Employee</label>
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => handleUserSelect(parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Choose an employee...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Manager</label>
                      <select
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">No Manager</option>
                        {managers.map(manager => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Approvers
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                        {potentialApprovers.length === 0 ? (
                          <p className="text-sm text-gray-500">No other users available</p>
                        ) : (
                          potentialApprovers.map(user => (
                            <div key={user.id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`approver-${user.id}`}
                                checked={formData.approverIds.includes(user.id)}
                                onChange={() => handleApproverToggle(user.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`approver-${user.id}`} className="ml-2 text-sm text-gray-700">
                                {user.name} ({user.role})
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isManagerApprover"
                        checked={formData.isManagerApprover}
                        onChange={(e) => setFormData({ ...formData, isManagerApprover: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isManagerApprover" className="ml-2 text-sm text-gray-700">
                        Is Manager Approver?
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRequiredApprover"
                        checked={formData.isRequiredApprover}
                        onChange={(e) => setFormData({ ...formData, isRequiredApprover: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isRequiredApprover" className="ml-2 text-sm text-gray-700">
                        Required Approver
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Approval Type</label>
                      <div className="mt-2 space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="Sequential"
                            checked={formData.approvalType === 'Sequential'}
                            onChange={(e) => setFormData({ ...formData, approvalType: e.target.value })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Sequential</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="Parallel"
                            checked={formData.approvalType === 'Parallel'}
                            onChange={(e) => setFormData({ ...formData, approvalType: e.target.value })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Parallel</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Approval Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.minimumApprovalPercentage}
                        onChange={(e) => setFormData({ ...formData, minimumApprovalPercentage: parseInt(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Save Approval Rule
                    </button>
                  </>
                )}
              </form>
            </div>

            {/* Rules List Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Existing Approval Rules</h2>
              
              {rules.length === 0 ? (
                <p className="text-gray-500">No approval rules configured yet.</p>
              ) : (
                <div className="space-y-4">
                  {rules.map(rule => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900">{rule.userName}</h3>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <p><strong>Manager:</strong> {rule.managerName || 'None'}</p>
                        <p><strong>Approvers:</strong> {rule.approvers.length > 0 ? rule.approvers.map(a => a.name).join(', ') : 'None'}</p>
                        <p><strong>Manager is Approver:</strong> {rule.isManagerApprover ? 'Yes' : 'No'}</p>
                        <p><strong>Required Approver:</strong> {rule.isRequiredApprover ? 'Yes' : 'No'}</p>
                        <p><strong>Type:</strong> {rule.approvalType}</p>
                        <p><strong>Min Approval %:</strong> {rule.minimumApprovalPercentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalRules;
