import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res.data, err => {
  const msg = err.response?.data?.message || '请求失败';
  return Promise.reject(new Error(msg));
});

// 景区管理
export const scenicAdminApi = {
  list: (p?: any) => api.get('/scenic/list', { params: { ...p, pageSize: p?.pageSize || 20 } }),
  create: (d: any) => api.post('/scenic/create', d),
  update: (d: any) => api.put('/scenic/update', d),
  toggleStatus: (scenicId: number, status: number) => api.put(`/scenic/status/${scenicId}`, { status }),
  delete: (scenicId: number) => api.delete(`/scenic/delete/${scenicId}`),
};

// 票种管理
export const ticketAdminApi = {
  list: (p?: any) => api.get('/ticket-type/list', { params: p }),
  create: (d: any) => api.post('/ticket-type/create', d),
  update: (d: any) => api.put('/ticket-type/update', d),
  toggleStatus: (id: number, status: number) => api.put(`/ticket-type/status/${id}`, { status }),
  delete: (id: number) => api.delete(`/ticket-type/delete/${id}`),
};

// 路线管理
export const routeAdminApi = {
  list: (p?: any) => api.get('/route/list', { params: { ...p, pageSize: p?.pageSize || 20 } }),
  detail: (routeId: number) => api.get(`/route/detail/${routeId}`),
  create: (d: any) => api.post('/route/create', d),
  update: (d: any) => api.put('/route/update', d),
  toggleStatus: (id: number, status: number) => api.put(`/route/status/${id}`, { status }),
  delete: (id: number) => api.delete(`/route/delete/${id}`),
  saveItineraries: (routeId: number, itineraries: any[]) => api.post(`/route/itineraries/${routeId}`, itineraries),
  getItineraries: (routeId: number) => api.get(`/route/itineraries/${routeId}`),
};

// 订单管理
export const orderAdminApi = {
  list: (p?: any) => api.get('/order/admin/list', { params: p }),
  detail: (orderNo: string) => api.get(`/order/detail/${orderNo}`),
  refundAudit: (orderNo: string, approved: boolean) => api.put('/order/admin/refund-audit', { orderNo, approved }),
};

// 核销
export const verifyApi = {
  verifyTicket: (qrCode: string) => api.post('/order/verify', { qrCode }),
};

// 攻略管理
export const guideAdminApi = {
  list: (p?: any) => api.get('/guide/list', { params: p }),
  create: (d: any) => api.post('/guide/create', d),
  update: (d: any) => api.put('/guide/update', d),
  toggleStatus: (id: number, status: number) => api.put(`/guide/status/${id}`, { status }),
  delete: (id: number) => api.delete(`/guide/delete/${id}`),
};

// 评价管理
export const reviewAdminApi = {
  list: (p?: any) => api.get('/review/list', { params: p }),
  reply: (reviewId: number, reply: string) => api.put('/review/reply', { reviewId, reply }),
  toggleStatus: (reviewId: number, status: number) => api.put(`/review/status/${reviewId}`, { status }),
};

// 数据统计
export const statsApi = {
  dashboard: () => api.get('/statistics/dashboard'),
};

export default api;
