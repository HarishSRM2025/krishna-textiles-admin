const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let isLoggingIn = false;
async function ensureAuthToken() {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('kt_admin_token');
  if (token) return token;

  if (isLoggingIn) return null;
  isLoggingIn = true;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@krishnatextiles.com', password: 'admin123' }),
    });
    const data = await res.json();
    if (data?.accessToken) {
      localStorage.setItem('kt_admin_token', data.accessToken);
      localStorage.setItem('kt_admin_user', JSON.stringify(data.user));
      return data.accessToken;
    }
  } catch (e) {
    console.error('Auto admin auth failed', e);
  } finally {
    isLoggingIn = false;
  }
  return null;
}

function getAuthHeader() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kt_admin_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

async function request(endpoint, options = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('kt_admin_token') : null;
  if (!token && !endpoint.includes('/auth/login')) {
    token = await ensureAuthToken();
  }

  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && !endpoint.includes('/auth/login')) {
      if (typeof window !== 'undefined') localStorage.removeItem('kt_admin_token');
      const freshToken = await ensureAuthToken();
      if (freshToken) {
        res = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${freshToken}`,
          },
        });
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request('/auth/logout', {
        method: 'POST',
      }),
    getProfile: () => request('/auth/profile'),
  },

  // Analytics
  analytics: {
    getOverview: () => request('/analytics/overview'),
    getTopProducts: (limit = 5) => request(`/analytics/top-products?limit=${limit}`),
  },

  // Inventory
  inventory: {
    getSummary: () => request('/inventory/summary'),
    getLowStock: () => request('/inventory/low-stock'),
    getAudits: (productId, limit = 50) => {
      const q = new URLSearchParams();
      if (productId) q.append('productId', productId);
      if (limit) q.append('limit', limit);
      return request(`/inventory/audits?${q.toString()}`);
    },
    adjust: (payload) =>
      request('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    bulkAdjust: (items) =>
      request('/inventory/bulk-adjust', {
        method: 'POST',
        body: JSON.stringify({ items }),
      }),
  },

  // Orders (9-digit order fulfillment & status timeline)
  orders: {
    getAll: (params = {}) => {
      const q = new URLSearchParams();
      if (params.status && params.status !== 'ALL') q.append('status', params.status);
      if (params.search) q.append('search', params.search);
      if (params.page) q.append('page', params.page);
      if (params.limit) q.append('limit', params.limit);
      return request(`/orders?${q.toString()}`);
    },
    getOne: (id) => request(`/orders/${id}`),
    getHistory: (id) => request(`/orders/${id}/history`),
    getInvoice: (id) => request(`/orders/${id}/invoice`),
    updateStatus: (id, statusOrPayload, trackingNumber, note, courierPartner, dispatchedAt, expectedDeliveryDate) => {
      const body = typeof statusOrPayload === 'object' && statusOrPayload !== null
        ? statusOrPayload
        : { status: statusOrPayload, trackingNumber, note, courierPartner, dispatchedAt, expectedDeliveryDate };
      return request(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
    },
    updatePayment: (id, paymentStatus, paymentMethod) =>
      request(`/orders/${id}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentStatus, paymentMethod }),
      }),
  },

  // CRM
  crm: {
    getCustomers: (params = {}) => {
      const q = new URLSearchParams();
      if (params.type && params.type !== 'ALL') q.append('type', params.type);
      if (params.search) q.append('search', params.search);
      return request(`/crm/customers?${q.toString()}`);
    },
    getStats: () => request('/crm/stats'),
    getCustomer: (id) => request(`/crm/customers/${id}`),
    createCustomer: (data) =>
      request('/crm/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCustomer: (id, data) =>
      request(`/crm/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    addNote: (id, note) =>
      request(`/crm/customers/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
  },

  // Products Master
  products: {
    getAll: (params = {}) => {
      const q = new URLSearchParams();
      if (params.category && params.category !== 'all') q.append('category', params.category);
      if (params.brandId && params.brandId !== 'all') q.append('brandId', params.brandId);
      if (params.categoryId && params.categoryId !== 'all') q.append('categoryId', params.categoryId);
      if (params.brandRefId && params.brandRefId !== 'all') q.append('brandRefId', params.brandRefId);
      if (params.search) q.append('search', params.search);
      if (params.stockStatus) q.append('stockStatus', params.stockStatus);
      if (params.page) q.append('page', params.page);
      if (params.limit) q.append('limit', params.limit);
      return request(`/products?${q.toString()}`);
    },
    getOne: (id) => request(`/products/${id}`),
    create: (data) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
    getOne: (id) => request(`/categories/${id}`),
    create: (data) =>
      request('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/categories/${id}`, {
        method: 'DELETE',
      }),
  },

  // Brands
  brands: {
    getAll: () => request('/brands'),
    getOne: (id) => request(`/brands/${id}`),
    create: (data) =>
      request('/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/brands/${id}`, {
        method: 'DELETE',
      }),
  },

  // Coupons
  coupons: {
    getAll: (params = {}) => {
      const q = new URLSearchParams();
      if (params.search) q.append('search', params.search);
      if (params.isActive !== undefined) q.append('isActive', params.isActive);
      if (params.page) q.append('page', params.page);
      if (params.limit) q.append('limit', params.limit);
      return request(`/coupons?${q.toString()}`);
    },
    getOne: (id) => request(`/coupons/${id}`),
    create: (data) =>
      request('/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/coupons/${id}`, {
        method: 'DELETE',
      }),
    validate: (code, cartTotal) =>
      request('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartTotal }),
      }),
  },

  // Offers
  offers: {
    getAll: (params = {}) => {
      const q = new URLSearchParams();
      if (params.isActive !== undefined) q.append('isActive', params.isActive);
      if (params.targetType) q.append('targetType', params.targetType);
      return request(`/offers?${q.toString()}`);
    },
    getOne: (id) => request(`/offers/${id}`),
    create: (data) =>
      request('/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/offers/${id}`, {
        method: 'DELETE',
      }),
  },

  // Storefront CMS (Hero Banners, Webstore Pages, Announcements)
  cms: {
    getBanners: () => request('/cms/banners'),
    getBanner: (id) => request(`/cms/banners/${id}`),
    createBanner: (data) =>
      request('/cms/banners', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateBanner: (id, data) =>
      request(`/cms/banners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteBanner: (id) =>
      request(`/cms/banners/${id}`, {
        method: 'DELETE',
      }),

    getPages: () => request('/cms/pages'),
    getPage: (slug) => request(`/cms/pages/${slug}`),
    createPage: (data) =>
      request('/cms/pages', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updatePage: (id, data) =>
      request(`/cms/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deletePage: (id) =>
      request(`/cms/pages/${id}`, {
        method: 'DELETE',
      }),

    getAnnouncement: () => request('/cms/announcement'),
    updateAnnouncement: (data) =>
      request('/cms/announcement', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
