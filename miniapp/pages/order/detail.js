const app = getApp();

Page({
  data: {
    order: null,
    eTickets: [],
    orderNo: '',
    statusMap: {
      pending_pay: '待支付', paid: '已支付', refunding: '退款中',
      refunded: '已退款', completed: '已完成', cancelled: '已取消'
    }
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo });
    this.loadDetail();
  },

  loadDetail() {
    app.request(`/api/order/detail/${this.data.orderNo}`).then(res => {
      this.setData({ order: res, eTickets: res.eTickets || [] });
    });
  },

  goETicket(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/e-ticket/detail?eTicketId=${id}` });
  },

  cancelOrder() {
    wx.showModal({
      title: '确认取消订单？',
      success: res => {
        if (res.confirm) {
          app.request(`/api/order/cancel/${this.data.orderNo}`, { method: 'PUT' }).then(() => {
            wx.showToast({ title: '已取消', icon: 'success' });
            this.loadDetail();
          });
        }
      }
    });
  },

  refundOrder() {
    wx.showModal({
      title: '申请退款',
      content: '确认申请退款吗？线路出发前3天内不可退。',
      success: res => {
        if (res.confirm) {
          app.request('/api/order/refund', {
            method: 'POST',
            data: { orderNo: this.data.orderNo, reason: '用户申请退款' }
          }).then(() => {
            wx.showToast({ title: '退款申请已提交', icon: 'success' });
            this.loadDetail();
          }).catch(err => wx.showToast({ title: err.message || '退款失败', icon: 'none' }));
        }
      }
    });
  }
});
