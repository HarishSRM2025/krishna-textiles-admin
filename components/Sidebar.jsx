'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingBag, 
  Users, 
  Layers, 
  FolderTree,
  Award,
  Tag,
  Percent,
  Sparkles, 
  LogOut, 
  ShieldCheck,
  Monitor,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const NAV_SECTIONS = [
  {
    title: 'Core Operations',
    items: [
      { label: 'Overview & Analytics', href: '/', icon: LayoutDashboard },
      { label: 'Inventory Management', href: '/inventory', icon: Boxes },
      { label: 'Order Fulfillment', href: '/orders', icon: ShoppingBag },
      { label: 'CRM & Customers', href: '/crm', icon: Users },
    ],
  },
  {
    title: 'Catalog & Store',
    items: [
      { label: 'Products Master', href: '/products', icon: Layers },
      { label: 'Categories', href: '/categories', icon: FolderTree },
      { label: 'Textile Brands', href: '/brands', icon: Award },
    ],
  },
  {
    title: 'Promotions & Discounts',
    items: [
      { label: 'Coupons Management', href: '/coupons', icon: Tag },
      { label: 'Promotional Offers', href: '/offers', icon: Percent },
    ],
  },
  {
    title: 'Storefront CMS',
    items: [
      { label: 'CMS Overview', href: '/cms', icon: Monitor },
      { label: 'Hero Banners & Sliders', href: '/cms/banners', icon: ImageIcon },
      { label: 'Webstore Pages & Policies', href: '/cms/pages', icon: FileText },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Admin', role: 'ADMIN', email: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kt_admin_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {}
  }, []);

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('kt_admin_token');
    localStorage.removeItem('kt_admin_user');
    localStorage.removeItem('kt_admin_session');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-700 flex flex-col fixed inset-y-0 left-0 z-40 transition-colors duration-200 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-200 dark:border-dark-700/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-wide text-slate-900 dark:text-white">KRISHNA</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 border border-brand-500/30">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Enterprise Textiles Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Theme Switcher */}
      <div className="px-3 py-2 border-t border-slate-200 dark:border-dark-700/60 bg-white dark:bg-dark-900">
        <ThemeToggle variant="sidebar" />
      </div>

      {/* User Footer (Admin Role Only) */}
      <div className="p-3.5 border-t border-slate-200 dark:border-dark-700/60 bg-slate-50 dark:bg-dark-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-600/15 border border-brand-500/30 flex items-center justify-center font-bold text-xs text-brand-600 dark:text-brand-300">
              {user.name ? user.name[0] : 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1 inline" /> ADMIN
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
