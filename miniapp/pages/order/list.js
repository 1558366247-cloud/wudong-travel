const app = getApp();

Page({
  data: {
    orders: [],
    loading: true,
    status: '',
    page: 1,
    hasMore: true,
    statusTabs: [
      { key: '', label: '全部' },
      { key: 'pending_pay', label: '待支付' },
      { key: 'paid', label: '已支付' },
      { key: 'completed', label: '已完成' },
      { key: 'refunding', label: '退款中' }
    ],
    statusMap: {
      pending_pay: '待支付', paid: '已支付', refunding: '退款中',
      refunded: '已退款', completed: '已完成', cancelled: '已取消'
    }
  },

  onLoad() { this.loadOrders(); },
  onPullDownRefresh() {
    this.setData({ page: 1, orders: [], hasMore: true });
    this.loadOrders().then(() => wx.stopPullDownRefresh());
  },
  onReachBottom() {
    if (this.data.hasMore) { this.setData({ page: this.data.page + 1 }); this.loadOrders(); }
  },

  loadOrders() {
    this.setData({ loading: true });
    const params = { page: this.data.page, pageSize: 10 };
    if (this.data.status) params.orderStatus = this.data.status;

    app.request('/api/order/list', { data: params }).then(res => {
      const list = this.data.page === 1 ? res.list : [...this.data.orders, ...res.list];
      this.setData({ orders: list, loading: false, hasMore: list.length < res.total });
    }).catch(() => this.setData({ loading: false }));
  },

  onTabChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status, page: 1, orders: [], hasMore: true });
    this.loadOrders();
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail?orderNo=${e.currentTarget.dataset.no}` });
  },

  cancelOrder(e) {
    const orderNo = e.currentTarget.dataset.no;
    wx.showModal({
      title: '确认取消订单？',
      success: res => {
        if (res.confirm) {
          app.request(`/api/order/cancel/${orderNo}`, { method: 'PUT' }).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadOrders();
          });
        }
      }
    });
  }
});
