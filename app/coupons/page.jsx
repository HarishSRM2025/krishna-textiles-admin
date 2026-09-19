'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/app/ModalContext';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  Coins,
  Calendar,
  Copy
} from 'lucide-react';
import Pagination from '@/components/Pagination';

export default function CouponsPage() {
  const { confirm: confirmModal, alert: alertModal } = useModal();
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    usageLimit: 100,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCoupons();
  }, [page, limit, statusFilter]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.coupons.getAll({
        search,
        isActive: statusFilter,
        page,
        limit,
      });
      if (res?.data) {
        setCoupons(res.data);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to load coupons', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadCoupons();
  };

  const handleOpenModal = (cpn = null) => {
    if (cpn) {
      setEditingCoupon(cpn);
      setFormData({
        code: cpn.code || '',
        description: cpn.description || '',
        type: cpn.type || 'PERCENTAGE',
        value: cpn.value || 0,
        minOrderAmount: cpn.minOrderAmount || 0,
        maxDiscountAmount: cpn.maxDiscountAmount || '',
        usageLimit: cpn.usageLimit || '',
        validFrom: cpn.validFrom ? cpn.validFrom.split('T')[0] : '',
        validUntil: cpn.validUntil ? cpn.validUntil.split('T')[0] : '',
        isActive: cpn.isActive !== undefined ? cpn.isActive : true,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: 10,
        minOrderAmount: 1000,
        maxDiscountAmount: 500,
        usageLimit: 100,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;
    setSubmitLoading(true);

    try {
      if (editingCoupon) {
        await api.coupons.update(editingCoupon.id, formData);
        setMessage({ type: 'success', text: `Coupon '${formData.code}' updated successfully` });
      } else {
        await api.coupons.create(formData);
        setMessage({ type: 'success', text: `Coupon '${formData.code}' created successfully` });
      }
      handleCloseModal();
      await loadCoupons();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save coupon' });
    } finally {
      setSubmitLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDelete = async (cpn) => {
    const ok = await confirmModal(
      `Delete coupon '${cpn.code}'?`,
      `This action cannot be undone. The coupon code will be permanently removed.`
    );
    if (!ok) return;
    try {
      await api.coupons.delete(cpn.id);
      setMessage({ type: 'success', text: `Coupon '${cpn.code}' deleted` });
      await loadCoupons();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete coupon' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Coupon & Voucher Management"
        subtitle="Manage promotional discount codes, festive vouchers, wholesale bulk deals, and usage thresholds"
        onRefresh={loadCoupons}
        isRefreshing={loading}
      />

      <div className="p-8 space-y-6 flex-1 w-full">
        {/* Notifications */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center space-x-2 text-sm font-semibold shadow-sm ${
            message.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Action / Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm">
          <form onSubmit={handleSearch} className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search coupon code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </form>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50/70 dark:bg-dark-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Code / Description</th>
                  <th className="py-3.5 px-6 font-semibold">Discount</th>
                  <th className="py-3.5 px-6 font-semibold">Eligibility</th>
                  <th className="py-3.5 px-6 font-semibold">Usage</th>
                  <th className="py-3.5 px-6 font-semibold">Validity</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading coupons...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No coupons found. Create your first coupon code.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30">
                            {c.code}
                          </span>
                          <button
                            onClick={async () => {
                              navigator.clipboard.writeText(c.code);
                              await alertModal(`Copied!`, `Coupon code "${c.code}" has been copied to your clipboard.`);
                            }}
                            title="Copy code"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {c.description || 'No description'}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-semibold">
                        <div className="flex items-center space-x-1 text-slate-900 dark:text-white">
                          {c.type === 'PERCENTAGE' ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-amber-500" />
                              <span>{c.value}% OFF</span>
                            </>
                          ) : (
                            <>
                              <Coins className="w-3.5 h-3.5 text-emerald-500" />
                              <span>₹{c.value} FLAT</span>
                            </>
                          )}
                        </div>
                        {c.maxDiscountAmount && (
                          <div className="text-[10px] text-slate-400">Max ₹{c.maxDiscountAmount}</div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-slate-900 dark:text-white font-medium">
                          Min Spend: ₹{c.minOrderAmount || 0}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {c.usedCount || 0} / {c.usageLimit ? c.usageLimit : '∞'}
                        </div>
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-dark-800 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full"
                            style={{
                              width: c.usageLimit ? `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` : '5%',
                            }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {c.validUntil ? (
                          <div className="flex items-center space-x-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Until {new Date(c.validUntil).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">No Expiry</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            limit={limit}
            onPageChange={setPage}
            itemName="coupons"
          />
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Tag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</span>
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10% instant festive discount on all handlooms"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Value * {formData.type === 'PERCENTAGE' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Max Disc (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100 (Blank = unlimited)"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : '' })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Valid Until (Date)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Coupon Status
                </label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive / Paused</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitLoading ? 'Saving...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
