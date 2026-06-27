import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || '请求失败';
    return Promise.reject(new Error(msg));
  }
);

// ===== 景区接口 =====
export const scenicApi = {
  list: (params?: any) => api.get('/scenic/list', { params }),
  detail: (scenicId: number) => api.get(`/scenic/detail/${scenicId}`),
};

// ===== 票种接口 =====
export const ticketTypeApi = {
  list: (params?: any) => api.get('/ticket-type/list', { params }),
  detail: (ticketTypeId: number) => api.get(`/ticket-type/detail/${ticketTypeId}`),
};

// ===== 路线接口 =====
export const routeApi = {
  list: (params?: any) => api.get('/route/list', { params }),
  detail: (routeId: number) => api.get(`/route/detail/${routeId}`),
  getItineraries: (routeId: number) => api.get(`/route/itineraries/${routeId}`),
};

// ===== 订单接口 =====
export const orderApi = {
  createTicket: (data: any) => api.post('/order/ticket/create', data),
  createRoute: (data: any) => api.post('/order/route/create', data),
  list: (params?: any) => api.get('/order/list', { params }),
  detail: (orderNo: string) => api.get(`/order/detail/${orderNo}`),
  cancel: (orderNo: string) => api.put(`/order/cancel/${orderNo}`),
  refund: (data: any) => api.post('/order/refund', data),
  payCallback: (data: any) => api.post('/order/pay-callback', data),
};

// ===== 电子票接口 =====
export const eTicketApi = {
  list: (params?: any) => api.get('/e-ticket/list', { params }),
  detail: (eTicketId: number) => api.get(`/e-ticket/detail/${eTicketId}`),
};

// ===== 评价接口 =====
export const reviewApi = {
  list: (params?: any) => api.get('/review/list', { params }),
  create: (data: any) => api.post('/review/create', data),
};

// ===== 收藏接口 =====
export const favoriteApi = {
  toggle: (targetType: string, targetId: number) => api.post('/favorite/toggle', { targetType, targetId }),
  list: (params?: any) => api.get('/favorite/list', { params }),
  check: (targetType: string, targetId: number) => api.get('/favorite/check', { params: { targetType, targetId } }),
};

// ===== 交通攻略接口 =====
export const guideApi = {
  list: (params?: any) => api.get('/guide/list', { params }),
  detail: (guideId: number) => api.get(`/guide/detail/${guideId}`),
  departures: () => api.get('/guide/departures'),
};

export default api;
