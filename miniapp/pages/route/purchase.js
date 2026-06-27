const app = getApp();

Page({
  data: {
    routeId: '',
    title: '',
    price: 0,
    stock: 0,
    useDate: '',
    quantity: 1,
    totalAmount: 0,
    visitors: [],
    contactPhone: '',
    submitting: false
  },

  onLoad(options) {
    const { routeId, title, price, stock } = options;
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2); // R9-03: 提前1天
    this.setData({
      routeId, title, price: Number(price), stock: Number(stock),
      useDate: dayAfterTomorrow.toISOString().slice(0, 10),
      totalAmount: Number(price),
      visitors: [{ name: '', idCard: '', phone: '' }]
    });
  },

  onDateChange(e) { this.setData({ useDate: e.detail.value }); },

  onQuantityChange(e) {
    const quantity = parseInt(e.detail.value) || 1;
    const visitors = Array.from({ length: quantity }, (_, i) => ({
      name: '', idCard: '', phone: ''
    }));
    const old = this.data.visitors;
    for (let i = 0; i < Math.min(quantity, old.length); i++) visitors[i] = old[i];
    this.setData({ quantity, visitors, totalAmount: this.data.price * quantity });
  },

  onVisitorChange(e) {
    const { index, field } = e.currentTarget.dataset;
    const visitors = [...this.data.visitors];
    visitors[index][field] = e.detail.value;
    this.setData({ visitors });
  },

  onPhoneChange(e) { this.setData({ contactPhone: e.detail.value }); },

  submitOrder() {
    // R9-03 校验：提前1天
    const useDate = new Date(this.data.useDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (useDate <= tomorrow) return wx.showToast({ title: '路线须提前1天购买', icon: 'none' });

    if (!this.data.contactPhone) return wx.showToast({ title: '请输入联系人手机', icon: 'none' });
    for (let i = 0; i < this.data.visitors.length; i++) {
      const v = this.data.visitors[i];
      if (!v.name) return wx.showToast({ title: `请输入第${i+1}位游客姓名`, icon: 'none' });
      if (!v.idCard) return wx.showToast({ title: `请输入第${i+1}位游客身份证号`, icon: 'none' });
    }

    this.setData({ submitting: true });
    app.request('/api/order/route/create', {
      method: 'POST',
      data: {
        routeId: Number(this.data.routeId),
        quantity: this.data.quantity,
        useDate: this.data.useDate,
        visitors: JSON.stringify(this.data.visitors),
        contactPhone: this.data.contactPhone
      }
    }).then(res => {
      return app.request('/api/order/pay-callback', {
        method: 'POST',
        data: { orderNo: res.orderNo, transactionId: 'MINIAPP_' + Date.now() }
      });
    }).then(() => {
      wx.showToast({ title: '支付成功！', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/order/list' }), 1500);
    }).catch(() => this.setData({ submitting: false }));
  }
});
