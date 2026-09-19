'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import { 
  Boxes, 
  Search, 
  Filter, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  ArrowUpDown, 
  History, 
  X, 
  Check, 
  IndianRupee,
  Layers,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'audits'

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Audit Logs Pagination
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(10);

  // Adjustment Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Restock');
  const [adjustNote, setAdjustNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadData();
  }, [stockStatus, selectedCategory, selectedBrand, page, limit]);

  const loadMetadata = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        api.categories.getAll().catch(() => []),
        api.brands.getAll().catch(() => []),
      ]);
      setCategories(Array.isArray(catsRes) ? catsRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
    } catch (e) {
      console.error('Failed to load categories and brands for stock ledger', e);
    }
  };

  const loadData = async (customPage) => {
    setLoading(true);
    const currentPage = customPage !== undefined ? customPage : page;
    try {
      const [sumRes, prodRes, audRes] = await Promise.all([
        api.inventory.getSummary(),
        api.products.getAll({
          stockStatus: stockStatus === 'all' ? undefined : stockStatus,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          brandId: selectedBrand === 'all' ? undefined : selectedBrand,
          search: search.trim() || undefined,
          page: currentPage,
          limit,
        }),
        api.inventory.getAudits(undefined, 100),
      ]);
      if (sumRes?.data) setSummary(sumRes.data);
      if (prodRes?.data) {
        setProducts(prodRes.data);
        setTotal(prodRes.total || 0);
        setTotalPages(prodRes.totalPages || Math.ceil((prodRes.total || 0) / limit) || 1);
      }
      if (audRes?.data) setAudits(audRes.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    loadData(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    // Reload data with cleared search
    setTimeout(() => {
      loadData(1);
    }, 10);
  };

  const handleOpenAdjust = (product) => {
    setSelectedProduct(product);
    setAdjustQty(10);
    setAdjustType('add');
    setAdjustReason('Restock');
    setAdjustNote('');
  };

  const handleExecuteAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty || adjustQty <= 0) return;

    setSubmitting(true);
    try {
      const delta = adjustType === 'add' ? Number(adjustQty) : -Number(adjustQty);
      await api.inventory.adjust({
        productId: selectedProduct.id,
        delta,
        reason: adjustReason,
        note: adjustNote,
      });

      setSelectedProduct(null);
      await loadData();
      alert(`Stock adjusted by ${delta > 0 ? '+' + delta : delta} for ${selectedProduct.name}`);
    } catch (err) {
      alert(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Inventory Control & Valuation"
        subtitle="Live stock auditing, automated threshold triggers, restock logging, and warehouse ledger"
        onRefresh={loadData}
        isRefreshing={loading}
      />

      <div className="p-8 space-y-8 flex-1 w-full">
        {/* KPI Metrics */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Warehouse Units</span>
              <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {summary.totalUnits?.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">pcs</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across {summary.totalSkus} active catalog SKUs</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventory Valuation</span>
              <div className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
                ₹{summary.totalValuation?.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Asset valuation at retail MRP</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low Stock Triggers</span>
              <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {summary.lowStockCount} <span className="text-xs font-normal text-slate-400">SKUs</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Below minimum threshold</p>
            </div>

            <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stockout Alert</span>
              <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {summary.outOfStockCount} <span className="text-xs font-normal text-slate-400">SKUs</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require immediate mill PO</p>
            </div>
          </div>
        )}

        {/* Tab & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-dark-900 p-4 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
              }`}
            >
              Stock Ledger
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audits'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
              }`}
            >
              Audit Log History
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {/* Real-time Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search SKU, fabric, title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Stock Status Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'low', label: 'Low (<20)' },
                  { id: 'medium', label: 'Medium (20)' },
                  { id: 'high', label: 'High (>20)' },
                  { id: 'out_of_stock', label: 'Out of Stock (0)' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStockStatus(st.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      stockStatus === st.id
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.name}>{c.name}</option>
                ))}
              </select>

              {/* Brand Dropdown */}
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id || b.slug}>{b.name}</option>
                ))}
              </select>

              {/* Items Per Page */}
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
                <option value="100">100 / page</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Live Stock Table */}
        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50/70 dark:bg-dark-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 font-semibold">SKU / Product</th>
                    <th className="py-3.5 px-6 font-semibold">Brand & Weave</th>
                    <th className="py-3.5 px-6 font-semibold">Unit MRP</th>
                    <th className="py-3.5 px-6 font-semibold">Inventory Valuation</th>
                    <th className="py-3.5 px-6 font-semibold">Current Balance</th>
                    <th className="py-3.5 px-6 font-semibold">Alert Level</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Adjust Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">Loading ledger...</td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">No items found matching filter.</td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const valuation = p.stock * p.price;
                      const isLow = p.stock <= (p.minStockAlert || 20);
                      const isOut = p.stock <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 overflow-hidden flex-shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.name}</div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.sku}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-900 dark:text-white">{p.brandRef?.name || p.brand}</div>
                            <div className="text-[11px] text-slate-500 capitalize">{p.categoryRef?.name || p.category}</div>
                          </td>

                          <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                            ₹{p.price?.toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-6 font-semibold text-brand-600 dark:text-brand-400">
                            ₹{valuation?.toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-6 font-bold">
                            <span className={isOut ? 'text-rose-600 dark:text-rose-400' : p.stock < 20 ? 'text-rose-600 dark:text-rose-400' : p.stock === 20 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                              {p.stock} units
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Out of Stock (0)
                              </span>
                            ) : p.stock < 20 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Low Stock (&lt; 20)
                              </span>
                            ) : p.stock === 20 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Medium Stock (20)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                High Stock (&gt; 20)
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleOpenAdjust(p)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-dark-700 transition-all cursor-pointer"
                            >
                              Quick Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Stock Ledger */}
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              limit={limit}
              onPageChange={setPage}
              itemName="stock items"
            />
          </div>
        )}

        {/* Tab 2: Audits Log Table */}
        {activeTab === 'audits' && (
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50/70 dark:bg-dark-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                    <th className="py-3.5 px-6 font-semibold">SKU & Item</th>
                    <th className="py-3.5 px-6 font-semibold">Adjustment Type</th>
                    <th className="py-3.5 px-6 font-semibold">Previous → New</th>
                    <th className="py-3.5 px-6 font-semibold">Reason & Audit Notes</th>
                    <th className="py-3.5 px-6 font-semibold">Author</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                  {audits.slice((auditPage - 1) * auditLimit, auditPage * auditLimit).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/40">
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(a.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">{a.product?.name || 'Product'}</div>
                        <div className="text-[10px] font-mono text-slate-400">{a.product?.sku}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          a.delta > 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {a.delta > 0 ? `+${a.delta}` : a.delta} units
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        {a.previousStock} → <span className="font-bold text-slate-900 dark:text-white">{a.newStock}</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 dark:text-white">{a.reason}</span>
                        {a.note && <div className="text-[11px] text-slate-400 mt-0.5">{a.note}</div>}
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {a.createdBy || 'Admin'}
                      </td>
                    </tr>
                  ))}
                  {audits.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No audit ledger records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination for Audit Log History */}
            <Pagination
              page={auditPage}
              totalPages={Math.ceil(audits.length / auditLimit) || 1}
              totalItems={audits.length}
              limit={auditLimit}
              onPageChange={setAuditPage}
              itemName="audit logs"
            />
          </div>
        )}
      </div>

      {/* Quick Stock Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adjust Stock Balance</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedProduct.sku}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{selectedProduct.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  Current Balance: <span className="font-bold text-brand-600 dark:text-brand-400">{selectedProduct.stock} units</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-700'
                    }`}
                  >
                    + Add Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      adjustType === 'subtract'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-700'
                    }`}
                  >
                    - Deduct Stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity ({adjustType === 'add' ? '+' : '-'}{adjustQty} units)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Audit Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Restock">Mill Shipment Restock</option>
                  <option value="Damage">Fabric Defect / Damage</option>
                  <option value="Audit Adjustment">Physical Audit Correction</option>
                  <option value="Return">Customer Return</option>
                  <option value="Sample">Boutique Sample Allocation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Audit Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="PO reference or reason details..."
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
