'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InteractiveChart from '@/components/InteractiveChart';
import Pagination from '@/components/Pagination';
import { api } from '@/lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Boxes, 
  IndianRupee, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FolderTree,
  Tag,
  Percent,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(5);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const res = await api.analytics.getOverview();
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard overview', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = data?.kpis || {};
  const statusCounts = data?.statusCounts || {};

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header 
        title="Executive Overview & Analytics" 
        subtitle="Real-time textile enterprise operations, inventory valuations & business intelligence"
        onRefresh={fetchOverview}
        isRefreshing={refreshing}
      />

      <div className="p-8 space-y-8 flex-1 w-full">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Gross Revenue */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Turnover</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ₹{(kpis.grossRevenue || 0).toLocaleString('en-IN')}
              </div>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2%
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Total orders revenue recognized</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Store Orders</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {kpis.totalOrders || 0}
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Avg ₹{(kpis.avgOrderValue || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              9-digit order fulfillment tracking
            </p>
          </div>

          {/* Inventory Valuation */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventory Value</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                ₹{(kpis.inventoryValuation || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                {kpis.totalUnitsInStock || 0} pcs
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Across active catalog SKUs
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Alerts</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                (kpis.lowStockAlerts || 0) > 0 ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${(kpis.lowStockAlerts || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className={`text-2xl font-bold tracking-tight ${(kpis.lowStockAlerts || 0) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {kpis.lowStockAlerts || 0} Items
              </div>
              <Link
                href="/inventory"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Inspect
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Below minimum threshold</p>
          </div>
        </div>

        {/* Sales Curve & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Financial Sales Trends</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Storefront Retail & Bulk Turnover</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-700">
                FY 2026-27
              </span>
            </div>

            <InteractiveChart data={data?.salesTrend || []} />
          </div>

          {/* Category Valuation & Pipeline */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Category Valuation</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Inventory Split</span>
              </div>

              <div className="space-y-3.5">
                {(data?.categoryDistribution || []).slice(0, 5).map((cat, idx) => {
                  const colors = ['bg-brand-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                  const total = (data.categoryDistribution || []).reduce((acc, c) => acc + c.value, 0) || 1;
                  const percent = Math.round((cat.value / total) * 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-300 truncate capitalize">{cat.name?.replace(/-/g, ' ')}</span>
                        <span className="text-slate-500 dark:text-slate-400">₹{(cat.value).toLocaleString('en-IN')} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[idx % colors.length]}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Pipeline Status Grid */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-dark-700/60">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Order Pipeline
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{statusCounts.PENDING || 0}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pending</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{(statusCounts.CONFIRMED || 0) + (statusCounts.PROCESSING || 0)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Processing</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{statusCounts.DELIVERED || 0}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Delivered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Orders & Quick Module Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Recent Storefront Orders</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Incoming customer orders with 9-digit identifiers</p>
              </div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
              >
                Fulfillment Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-700 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                  {((data?.recentOrders || []).slice((orderPage - 1) * orderLimit, orderPage * orderLimit)).map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/50 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                        <Link href="/orders" className="hover:underline">
                          #{ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ord.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : ord.status === 'DISPATCHED'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : ord.status === 'PROCESSING'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for Recent Storefront Orders */}
            <Pagination
              page={orderPage}
              totalPages={Math.ceil((data?.recentOrders?.length || 0) / orderLimit) || 1}
              totalItems={data?.recentOrders?.length || 0}
              limit={orderLimit}
              onPageChange={setOrderPage}
              itemName="orders"
            />
          </div>

          {/* Quick Operations Modules (1 col) */}
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Quick Navigators</h3>
              </div>

              <div className="space-y-3">
                <Link
                  href="/categories"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">Categories Master</div>
                      <div className="text-[11px] text-slate-400">Visual classifications</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/brands"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">Textile Brands</div>
                      <div className="text-[11px] text-slate-400">Brand logos & weavers</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/coupons"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">Coupons & Vouchers</div>
                      <div className="text-[11px] text-slate-400">Discount codes & limits</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/offers"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">Promotional Offers</div>
                      <div className="text-[11px] text-slate-400">Homepage banners</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-600 dark:text-brand-400" /> Enterprise Admin
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">PostgreSQL Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
