import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Upload, Plus, Search, X } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [receipts, setReceipts] = useState([]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters / sort
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");

  // Form
  const emptyForm = {
    employee: user?.name || "Employee",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Food",
    paidBy: "",
    remarks: "",
    amount: "",
    currency: company?.currency || "USD",
    status: "Draft",
    receiptId: null,
  };
  const [form, setForm] = useState(emptyForm);

  const currencies = ["USD", "EUR", "INR", "CAD", "GBP", "AUD", "JPY"];
  const categories = ["Food", "Travel", "Office", "Other"];

  const API_URL = 'http://localhost:5000/api';

  // Fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
    fetchReceipts();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/expenses/my-expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        console.error('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/expenses/receipts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReceipts(data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    }
  };

  // Utilities
  const fmtMoney = (amt, cur) => {
    if (amt === "" || amt == null || isNaN(Number(amt))) return "";
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(Number(amt));
    } catch {
      return `${cur} ${Number(amt).toFixed(2)}`;
    }
  };

  const totalsByStatus = (expenses) => {
    const out = { Draft: {}, "Waiting Approval": {}, Approved: {} };
    for (const e of expenses) {
      if (!out[e.status]) continue;
      const cur = e.currency || "USD";
      out[e.status][cur] = (out[e.status][cur] || 0) + Number(e.amount || 0);
    }
    return out;
  };

  const mockOCRFromName = (name) => {
    const base = (name || "").toLowerCase();
    let amountMatch = base.match(/(?:rs|inr|usd|cad|eur|gbp|amt)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i) || base.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
    const amount = amountMatch ? Number(amountMatch[1]).toFixed(2) : (Math.random() * 200 + 20).toFixed(2);

    let date = new Date();
    const ymd = base.match(/(20\d{2})[-_](0[1-9]|1[0-2])[-_](0[1-9]|[12]\d|3[01])/);
    const dmy = base.match(/(0[1-9]|[12]\d|3[01])[-_](0[1-9]|1[0-2])[-_](20\d{2})/);
    if (ymd) date = new Date(`${ymd[1]}-${ymd[2]}-${ymd[3]}`);
    else if (dmy) date = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);

    const desc = base.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
    const description = desc ? desc.replace(/\b\w/g, c => c.toUpperCase()) : "Receipt Expense";
    return { amount, dateISO: date.toISOString().slice(0, 10), description };
  };

  // Derived
  const totals = useMemo(() => totalsByStatus(expenses), [expenses]);

  const filtered = useMemo(() => {
    let rows = [...expenses];
    if (statusFilter !== "All") rows = rows.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (r.description || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (r.paidBy || "").toLowerCase().includes(q) ||
        (r.remarks || "").toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      if (sortKey === "date") {
        const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
        return sortDir === "asc" ? da - db : db - da;
      } else {
        const aa = Number(a.amount || 0), ab = Number(b.amount || 0);
        return sortDir === "asc" ? aa - ab : ab - aa;
      }
    });
    return rows;
  }, [expenses, statusFilter, sortKey, sortDir, search]);

  // Handlers
  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...row });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setOcrLoading(false);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleAmount = (e) => {
    const v = e.target.value;
    if (v === "" || /^[0-9]*\.?[0-9]{0,2}$/.test(v)) setForm(p => ({ ...p, amount: v }));
  };

  const onUploadClick = () => {
    document.getElementById("receipt-input").click();
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    const token = localStorage.getItem('token');
    
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch(`${API_URL}/expenses/receipts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: file.name,
              dataUrl: reader.result
            })
          });
          
          if (response.ok) {
            const receipt = await response.json();
            setReceipts(prev => [receipt, ...prev]);
          }
        } catch (error) {
          console.error('Error uploading receipt:', error);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const attachReceipt = (rec) => {
    setForm(p => ({ ...p, receiptId: rec.id }));
    setOcrLoading(true);
    setTimeout(() => {
      const { amount, dateISO, description } = mockOCRFromName(rec.name);
      setForm(p => ({
        ...p,
        amount: p.amount || amount,
        date: p.date || dateISO,
        description: p.description || description
      }));
      setOcrLoading(false);
    }, 600);
  };

  const clearAttachment = () => {
    setForm(p => ({ ...p, receiptId: null }));
  };

  const saveDraft = async () => {
    if (!form.description) {
      alert("Add a Description to save as Draft.");
      return;
    }
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, status: "Draft" };
      
      if (editingId) {
        const response = await fetch(`${API_URL}/expenses/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          await fetchExpenses();
          closeDrawer();
        } else {
          const errorData = await response.json();
          alert(`Failed to save draft: ${errorData.error || 'Unknown error'}`);
          console.error('Save draft error:', errorData);
        }
      } else {
        const response = await fetch(`${API_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          await fetchExpenses();
          closeDrawer();
        } else {
          const errorData = await response.json();
          alert(`Failed to save draft: ${errorData.error || 'Unknown error'}`);
          console.error('Save draft error:', errorData);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(`Error saving draft: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitExpense = async () => {
    if (!form.description || !form.amount || !form.date) {
      alert("Please fill Description, Amount and Date.");
      return;
    }
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, status: "Waiting Approval" };
      console.log('Submitting expense:', payload);
      
      if (editingId) {
        const response = await fetch(`${API_URL}/expenses/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          await fetchExpenses();
          closeDrawer();
        } else {
          const errorData = await response.json();
          alert(`Failed to submit expense: ${errorData.error || 'Unknown error'}`);
          console.error('Submit error:', errorData);
        }
      } else {
        const response = await fetch(`${API_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          await fetchExpenses();
          closeDrawer();
        } else {
          const errorData = await response.json();
          alert(`Failed to submit expense: ${errorData.error || 'Unknown error'}`);
          console.error('Submit error:', errorData);
        }
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert(`Error submitting expense: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrencyChips = (map) => {
    const curKeys = Object.keys(map);
    if (!curKeys.length) return <span className="text-gray-400">0</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {curKeys.map(cur => (
          <span key={cur} className="px-2 py-0.5 rounded-full bg-white border text-xs">
            {fmtMoney(map[cur], cur)}
          </span>
        ))}
      </div>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-blue-200" style={{ backgroundColor: '#ADE8F4' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Expense Submission</h1>
              <p className="text-sm text-gray-700 mt-1">Upload receipts, add expenses, manage drafts and submissions</p>
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

      <div className="p-4 md:p-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
          <input id="receipt-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          <button
            onClick={onUploadClick}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white shadow-md border-2 border-blue-200 hover:bg-gray-50 font-medium transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Receipts
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </button>
          {ocrLoading && <span className="text-sm text-blue-600 animate-pulse">Running OCR… (mock)</span>}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-3 py-2 rounded-lg border-2 border-blue-200 bg-white w-40 md:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {["All", "Draft", "Waiting Approval", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="flex gap-1">
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort: Date</option>
                <option value="amount">Sort: Amount</option>
              </select>
              <button
                onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
                className="px-3 py-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-gray-50 font-bold"
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary rail */}
        <div className="mb-4 bg-white rounded-lg p-3 md:p-4 shadow-md border-2 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">📝</div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Drafted (not submitted)</div>
                <div className="font-semibold">{renderCurrencyChips(totals["Draft"])}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center text-xl">⏳</div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Waiting (submitted)</div>
                <div className="font-semibold">{renderCurrencyChips(totals["Waiting Approval"])}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-xl">✅</div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Accepted</div>
                <div className="font-semibold">{renderCurrencyChips(totals["Approved"])}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main table */}
        <div className="bg-white rounded-lg p-4 md:p-5 shadow-md border-2 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Submitted Expenses</h2>
            <span className="text-sm text-gray-600">Rows: {filtered.length}</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading expenses...</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 border-b-2 border-blue-200 font-bold">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Paid By</th>
                  <th className="py-2 pr-4">Remarks</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-500">No matching expenses.</td>
                  </tr>
                ) : filtered.map(row => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => openEdit(row)}
                  >
                    <td className="py-3 pr-4">{row.employee}</td>
                    <td className="py-3 pr-4 max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.description}>
                      {row.description}
                    </td>
                    <td className="py-3 pr-4">{row.date}</td>
                    <td className="py-3 pr-4">{row.category}</td>
                    <td className="py-3 pr-4 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.paidBy}>
                      {row.paidBy || "-"}
                    </td>
                    <td className="py-3 pr-4 max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap" title={row.remarks}>
                      {row.remarks || "-"}
                    </td>
                    <td className="py-3 pr-4 font-bold">{fmtMoney(row.amount, row.currency)}</td>
                    <td className="py-3 pr-2">
                      <span className={
                        "px-2 py-1 rounded-full text-xs font-semibold " +
                        (row.status === "Approved" ? "bg-green-100 text-green-700 border border-green-300"
                          : row.status === "Waiting Approval" ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : row.status === "Rejected" ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300")
                      }>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>

      {/* Slide-in Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer}></div>
          <div className="absolute inset-y-0 left-0 w-full sm:w-[520px] bg-white shadow-xl border-r-4 border-blue-200 p-4 md:p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? "Edit Expense" : "Add New Expense"}</h3>
              <button onClick={closeDrawer} className="px-3 py-1 rounded-lg border-2 border-blue-200 hover:bg-gray-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attached receipt preview */}
            {form.receiptId && (
              <div className="mb-3">
                <div className="text-sm text-gray-700 font-medium mb-1">Attached Receipt</div>
                <img
                  src={(receipts.find(r => r.id === form.receiptId) || {}).dataUrl}
                  alt="Receipt"
                  className="w-full h-40 object-cover rounded-lg border-2 border-blue-200"
                />
                <div className="mt-2">
                  <button
                    onClick={clearAttachment}
                    className="px-3 py-1 rounded-lg bg-white border-2 border-blue-200 hover:bg-gray-50 text-sm font-medium"
                  >
                    Remove attachment
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={e => { e.preventDefault(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 font-medium">Expense Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 font-medium">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-sm text-gray-700 font-medium">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="e.g., Restaurant bill"
                    className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-700 font-medium">Paid By</label>
                  <input
                    type="text"
                    name="paidBy"
                    value={form.paidBy}
                    onChange={handleChange}
                    placeholder="Personal Card / Cash"
                    className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                  <div className="col-span-2 flex flex-col">
                    <label className="text-sm text-gray-700 font-medium">Amount</label>
                    <input
                      type="text"
                      name="amount"
                      value={form.amount}
                      onChange={handleAmount}
                      inputMode="decimal"
                      placeholder="0.00"
                      className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-700 font-medium">Currency</label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencies.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-sm text-gray-700 font-medium">Remarks</label>
                  <textarea
                    name="remarks"
                    rows="3"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Optional notes"
                    className="mt-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700 font-medium">Status:</span>
                    <span className={
                      "px-2 py-1 rounded-full font-semibold " +
                      (form.status === "Approved" ? "bg-green-100 text-green-700"
                        : form.status === "Waiting Approval" ? "bg-amber-100 text-amber-700"
                        : form.status === "Rejected" ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700")
                    }>{form.status}</span>
                    {ocrLoading && <span className="text-blue-600 animate-pulse">OCR filling…</span>}
                  </div>
                </div>
              </div>

              {/* Receipt library attach section */}
              {receipts.length > 0 && (
                <div className="border-2 border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-gray-900">Attach a Receipt (from uploaded)</div>
                    <div className="text-xs text-gray-600">Click a thumbnail to attach</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {receipts.map(r => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => attachReceipt(r)}
                        className={"relative rounded-lg overflow-hidden border-2 hover:ring-2 hover:ring-blue-400 " +
                          (form.receiptId === r.id ? "ring-2 ring-blue-500 border-blue-500" : "border-blue-200")}
                      >
                        <img src={r.dataUrl} alt={r.name} className="h-20 w-full object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white px-1 py-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
                          {r.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={submitExpense}
                  disabled={submitting || form.status === "Approved"}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {editingId ? (form.status === "Draft" ? "Submit Draft" : "Submit Changes") : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white shadow-md border-2 border-blue-200 hover:bg-gray-50 font-medium transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white shadow-md border-2 border-blue-200 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {editingId && form.status === "Approved" && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  This expense is approved and should generally be read-only. (Editing disabled for Submit.)
                </p>
              )}
              
              {editingId && form.status === "Rejected" && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-800">Rejection Details:</p>
                  <p className="text-xs text-red-700 mt-1">Rejected by: {expenses.find(e => e.id === editingId)?.rejectedBy || 'Unknown'}</p>
                  <p className="text-xs text-red-700">Date: {expenses.find(e => e.id === editingId)?.rejectionDate || 'N/A'}</p>
                  <p className="text-xs text-red-700">Reason: {expenses.find(e => e.id === editingId)?.rejectionReason || 'No reason provided'}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
