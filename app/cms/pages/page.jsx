'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Save, 
  Eye, 
  Globe,
  Clock,
  UserCheck
} from 'lucide-react';

export default function CmsPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [previewPage, setPreviewPage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    isPublished: true,
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await api.cms.getPages();
      if (res?.data) setPages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      isPublished: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPage(p);
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      content: p.content || '',
      metaDescription: p.metaDescription || '',
      isPublished: p.isPublished !== undefined ? p.isPublished : true,
    });
    setShowModal(true);
  };

  const handleOpenPreview = (p) => {
    setPreviewPage(p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPage) {
        await api.cms.updatePage(editingPage.id, formData);
        setMessage({ type: 'success', text: 'Page updated successfully!' });
      } else {
        await api.cms.createPage(formData);
        setMessage({ type: 'success', text: 'New storefront page created successfully!' });
      }
      setShowModal(false);
      await loadPages();
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save page' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await api.cms.deletePage(id);
      setMessage({ type: 'success', text: 'Page removed successfully' });
      await loadPages();
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    }
  };

  const handleTogglePublish = async (p) => {
    try {
      await api.cms.updatePage(p.id, { isPublished: !p.isPublished });
      await loadPages();
    } catch (e) {
      alert('Failed to toggle publication status');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Storefront Pages & Webstore Policies"
        subtitle="Manage legal guidelines, corporate mill heritage, shipping policies, terms, and customer care FAQs"
        onRefresh={loadPages}
        isRefreshing={loading}
      />

      <div className="p-8 space-y-6 flex-1 w-full">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/cms"
            className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to CMS Hub
          </Link>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Storefront Page</span>
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Pages Table */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-700 bg-slate-50/70 dark:bg-dark-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Page Title & URL Slug</th>
                  <th className="py-3.5 px-6 font-semibold">Meta Summary</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold">Last Modified</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-slate-700 dark:text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Loading webstore pages...</td>
                  </tr>
                ) : pages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">No pages found.</td>
                  </tr>
                ) : (
                  pages.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-dark-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</div>
                        <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400 mt-0.5 flex items-center">
                          <Globe className="w-3 h-3 mr-1 inline opacity-70" /> /{p.slug}
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {p.metaDescription || p.content.slice(0, 100) + '...'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            p.isPublished
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                        >
                          {p.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-slate-400 text-[11px]">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recent'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenPreview(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                            title="Preview Content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                            title="Edit Page"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                            title="Delete Page"
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
        </div>
      </div>

      {/* Add / Edit Page Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-700 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-900 z-10">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingPage ? `Edit: ${editingPage.title}` : 'Create New Webstore Page'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shipping & Delivery Guidelines"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                    setFormData({
                      ...formData,
                      title,
                      slug: editingPage ? formData.slug : slug,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-slate-100 dark:bg-dark-700 border border-r-0 border-slate-200 dark:border-dark-700 rounded-l-xl text-xs text-slate-500">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="shipping-policy"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-r-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
                  />
                  <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                    Publish Immediately on Webstore
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meta Description / Search Snippet
                </label>
                <input
                  type="text"
                  placeholder="Concise 1–2 sentence description for search engines and footer links..."
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Page Content (Markdown / Plain Text) *
                </label>
                <textarea
                  rows={10}
                  required
                  placeholder="Write policy clauses, mill information, or headings here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3.5 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/25 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Preview Drawer */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-dark-900 border-l border-slate-200 dark:border-dark-700 h-full flex flex-col shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-dark-700 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-900 z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewPage.title}</h3>
                <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400">/{previewPage.slug}</span>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Meta Description
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {previewPage.metaDescription || 'No custom meta description provided.'}
                </p>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {previewPage.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
