'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  Monitor, 
  Image as ImageIcon, 
  FileText, 
  Megaphone, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  Save, 
  Eye, 
  Layers,
  Palette
} from 'lucide-react';

export default function CmsOverviewPage() {
  const [banners, setBanners] = useState([]);
  const [pages, setPages] = useState([]);
  const [announcement, setAnnouncement] = useState({
    text: '',
    linkUrl: '',
    badgeText: '',
    bgColor: '#d32f2f',
    textColor: '#ffffff',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCmsData();
  }, []);

  const loadCmsData = async () => {
    setLoading(true);
    try {
      const [bannersRes, pagesRes, annRes] = await Promise.all([
        api.cms.getBanners().catch(() => ({ data: [] })),
        api.cms.getPages().catch(() => ({ data: [] })),
        api.cms.getAnnouncement().catch(() => ({ data: null })),
      ]);

      if (bannersRes?.data) setBanners(bannersRes.data);
      if (pagesRes?.data) setPages(pagesRes.data);
      if (annRes?.data) setAnnouncement(annRes.data);
    } catch (e) {
      console.error('Failed to load CMS data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      await api.cms.updateAnnouncement(announcement);
      setMessage({ type: 'success', text: 'Top announcement bar updated successfully!' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update announcement' });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const activeBannersCount = banners.filter((b) => b.isActive).length;
  const publishedPagesCount = pages.filter((p) => p.isPublished).length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Webstore Content Management System (CMS)"
        subtitle="Manage storefront hero carousels, webstore policy pages, header ticker announcements, and brand content"
        onRefresh={loadCmsData}
        isRefreshing={loading}
      />

      <div className="p-8 space-y-8 flex-1 w-full">
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm animate-in fade-in duration-200 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* CMS Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hero Banners & Sliders
              </span>
              <ImageIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {activeBannersCount} <span className="text-xs font-normal text-slate-400">active ({banners.length} total)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Homepage rotating carousel slides</p>
            <Link
              href="/cms/banners"
              className="mt-4 inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Manage Banners <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Webstore Static Pages
              </span>
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {publishedPagesCount} <span className="text-xs font-normal text-slate-400">published ({pages.length} total)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">About Us, Policies, Showroom Info</p>
            <Link
              href="/cms/pages"
              className="mt-4 inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Manage Webstore Pages <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Top Announcement Bar
              </span>
              <Megaphone className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {announcement.isActive ? (
                <span className="text-emerald-600 dark:text-emerald-400">Live Active</span>
              ) : (
                <span className="text-slate-400">Disabled</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Header notification ticker for shoppers</p>
            <span className="mt-4 inline-block text-xs font-semibold text-slate-400">
              Configure below ↓
            </span>
          </div>
        </div>

        {/* Live Top Announcement Bar Settings */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-dark-800">
            <div>
              <div className="flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Storefront Top Announcement Bar
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Displays a prominent promotional ribbon across every webstore page
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {announcement.isActive ? 'Status: Active' : 'Status: Inactive'}
              </label>
              <button
                type="button"
                onClick={() => setAnnouncement({ ...announcement, isActive: !announcement.isActive })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  announcement.isActive ? 'bg-brand-600' : 'bg-slate-300 dark:bg-dark-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    announcement.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Live Preview Bar */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Live Storefront Preview
            </span>
            <div
              className="py-2.5 px-4 rounded-xl flex items-center justify-center text-center text-xs font-bold transition-all shadow-sm"
              style={{
                backgroundColor: announcement.bgColor || '#d32f2f',
                color: announcement.textColor || '#ffffff',
              }}
            >
              {announcement.badgeText && (
                <span className="mr-2 px-2 py-0.5 rounded bg-white/20 text-[10px] font-extrabold tracking-wide uppercase">
                  {announcement.badgeText}
                </span>
              )}
              <span>{announcement.text || 'Enter announcement message...'}</span>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSaveAnnouncement} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Text *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE DISCOUNT: Get 15% off using code KT15 on sarees & dhotis!"
                  value={announcement.text}
                  onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag / Badge Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FLASH SALE"
                  value={announcement.badgeText || ''}
                  onChange={(e) => setAnnouncement({ ...announcement, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/offers or /category/all"
                  value={announcement.linkUrl || ''}
                  onChange={(e) => setAnnouncement({ ...announcement, linkUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={announcement.bgColor || '#d32f2f'}
                    onChange={(e) => setAnnouncement({ ...announcement, bgColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-dark-700"
                  />
                  <input
                    type="text"
                    value={announcement.bgColor || '#d32f2f'}
                    onChange={(e) => setAnnouncement({ ...announcement, bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={announcement.textColor || '#ffffff'}
                    onChange={(e) => setAnnouncement({ ...announcement, textColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-dark-700"
                  />
                  <input
                    type="text"
                    value={announcement.textColor || '#ffffff'}
                    onChange={(e) => setAnnouncement({ ...announcement, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAnnouncement ? 'Saving Changes...' : 'Save Announcement Bar'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Banners Preview List */}
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Active Homepage Banners ({banners.length})
                </h3>
              </div>
              <Link
                href="/cms/banners"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
              >
                Open Banners Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {banners.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700"
                >
                  <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-dark-800 overflow-hidden flex-shrink-0">
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {b.title.replace('\n', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Link: {b.linkUrl} · Button: {b.buttonText}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      b.isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-200 dark:bg-dark-700 text-slate-500 border-slate-300'
                    }`}
                  >
                    {b.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Webstore Pages Preview List */}
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Storefront Policy Pages ({pages.length})
                </h3>
              </div>
              <Link
                href="/cms/pages"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
              >
                Open Pages Editor <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {pages.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-700"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.title}</div>
                    <div className="text-[10px] font-mono text-slate-400">/{p.slug}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      p.isPublished
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {p.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
