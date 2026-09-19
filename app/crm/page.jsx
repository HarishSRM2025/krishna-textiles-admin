'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  IndianRupee, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  X,
  Send,
  Sparkles,
  ShoppingBag,
  MapPin
} from 'lucide-react';

export default function CrmPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals & Details
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    gstin: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    type: 'WHOLESALE',
    creditLimit: 200000,
    initialNote: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [custRes, statsRes] = await Promise.all([
        api.crm.getCustomers({
          type: selectedType === 'ALL' ? undefined : selectedType,
          search: search || undefined,
        }),
        api.crm.getStats(),
      ]);
      if (custRes?.data) setCustomers(custRes.data);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load CRM data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomer = async (id) => {
    try {
      const res = await api.crm.getCustomer(id);
      if (res?.data) {
        setSelectedCustomer(res.data);
      }
    } catch (e) {
      alert('Failed to load customer profile');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    setSubmittingNote(true);
    try {
      await api.crm.addNote(selectedCustomer.id, newNote);
      setNewNote('');
      handleOpenCustomer(selectedCustomer.id);
    } catch (e) {
      alert('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.crm.createCustomer(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        company: '',
        gstin: '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        pincode: '',
        type: 'WHOLESALE',
        creditLimit: 200000,
        initialNote: '',
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to create customer');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="CRM & Customer Directory (All Customers)"
        subtitle="Complete directory managing all customers — Retail Shoppers, Wholesale Mill Partners, and VIP Corporate Clients"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="p-8 space-y-6 flex-1 w-full">
        {/* CRM KPI Metrics */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All Customers Network</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalCustomers} <span className="text-xs font-normal text-slate-400">clients</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total registered customer base</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Retail Shoppers</span>
              <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.retailCustomers} <span className="text-xs font-normal text-slate-400">consumers</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Direct store & online buyers</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Wholesale Mill Clients</span>
              <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.wholesaleClients} <span className="text-xs font-normal text-slate-400">entities</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bulk B2B buyers with GST</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">VIP Accounts</span>
              <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.vipClients} <span className="text-xs font-normal text-slate-400">members</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-frequency boutique buyers</p>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm">
          <div className="flex items-center space-x-2">
            {[
              { id: 'ALL', label: 'All Customers' },
              { id: 'RETAIL', label: 'Retail' },
              { id: 'WHOLESALE', label: 'Wholesale' },
              { id: 'VIP', label: 'VIP' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedType(t.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedType === t.id
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, GSTIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50/70 dark:bg-dark-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Client Name & Company</th>
                  <th className="py-3.5 px-6 font-semibold">Segment</th>
                  <th className="py-3.5 px-6 font-semibold">Contact</th>
                  <th className="py-3.5 px-6 font-semibold">GSTIN / State</th>
                  <th className="py-3.5 px-6 font-semibold">Orders & Spend</th>
                  <th className="py-3.5 px-6 font-semibold">Credit Line</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading accounts...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No customer records found.</td>
                  </tr>
                ) : (
                  customers.slice((page - 1) * limit, page * limit).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</div>
                        {c.company && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                            <Building2 className="w-3 h-3 mr-1 text-slate-400" />
                            {c.company}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            c.type === 'WHOLESALE'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                              : c.type === 'VIP'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center text-slate-900 dark:text-white">
                          <Phone className="w-3 h-3 mr-1.5 text-slate-400" />
                          {c.phone}
                        </div>
                        {c.email && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                            <Mail className="w-3 h-3 mr-1.5 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-slate-900 dark:text-white font-medium">{c.gstin || 'Unregistered'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.city ? `${c.city}, ` : ''}{c.state || 'Tamil Nadu'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{(c.totalSpent ?? c.totalSpend ?? 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{(c.totalOrders ?? c.orderCount ?? 0)} Orders Placed</div>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {c.creditLimit > 0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            ₹{c.creditLimit.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400">None (Prepaid)</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenCustomer(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-dark-700 transition-colors cursor-pointer"
                        >
                          Profile & Notes
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Customers Table */}
          <Pagination
            page={page}
            totalPages={Math.ceil(customers.length / limit) || 1}
            totalItems={customers.length}
            limit={limit}
            onPageChange={setPage}
            itemName="customers"
          />
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-dark-900 border-l border-slate-200 dark:border-dark-700 h-full flex flex-col shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-dark-900/95 backdrop-blur-md z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedCustomer.company || 'Retail Client Profile'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Account Quick Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Phone Number</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedCustomer.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">GSTIN Number</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedCustomer.gstin || 'None'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Assigned Credit Line</div>
                  <div className="font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{selectedCustomer.creditLimit?.toLocaleString('en-IN') || 0}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Account Category</div>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedCustomer.type}</div>
                </div>
              </div>

              {/* Order History for Client */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
                  Order Bookings ({selectedCustomer.orders?.length || 0})
                </h3>
                <div className="space-y-2">
                  {(selectedCustomer.orders || []).length === 0 ? (
                    <p className="text-xs text-slate-400">No prior orders placed by client.</p>
                  ) : (
                    selectedCustomer.orders.map((ord) => (
                      <div key={ord.id} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-brand-600 dark:text-brand-400">#{ord.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900 dark:text-white">₹{ord.totalAmount?.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{ord.status}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CRM Interaction Notes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-brand-600 dark:text-brand-400" />
                  Wholesale Interaction Logs
                </h3>

                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add an internal interaction note (e.g. Approved 30 days credit)..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <button
                      type="submit"
                      disabled={submittingNote || !newNote.trim()}
                      className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                <div className="space-y-2.5">
                  {(selectedCustomer.notes || []).map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-800/60 border border-slate-200 dark:border-dark-700 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                        <span className="font-bold text-brand-600 dark:text-brand-400">{n.author || 'Admin'}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Onboard New Client</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Venkatesan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94441 23456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="orders@business.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Venkateshwara Textiles"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    placeholder="33AAACV1234F1Z8"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Client Segment
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="WHOLESALE">WHOLESALE (Mill B2B)</option>
                    <option value="VIP">VIP Boutique Partner</option>
                    <option value="RETAIL">RETAIL Direct Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Delivery / Billing Address
                </label>
                <input
                  type="text"
                  placeholder="Street address, City, Pincode"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
