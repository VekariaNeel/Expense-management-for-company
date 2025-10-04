import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-blue-200" style={{ backgroundColor: '#ADE8F4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Expense Management
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/admin/users"
                className={`${
                  isActive('/admin/users')
                    ? 'border-blue-700 text-blue-900'
                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Users Management
              </Link>
              <Link
                to="/admin/approval-rules"
                className={`${
                  isActive('/admin/approval-rules')
                    ? 'border-blue-700 text-blue-900'
                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-900'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Approval Rules
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500">{company?.name}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
