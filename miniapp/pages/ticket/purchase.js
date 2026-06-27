const app = getApp();

Page({
  data: {
    ticketTypeId: '',
    ticketName: '',
    price: 0,
    scenicName: '',
    useDate: '',
    quantity: 1,
    totalAmount: 0,
    visitors: [],
    contactPhone: '',
    submitting: false
  },

  onLoad(options) {
    const { ticketTypeId, name, price, scenicName } = options;
    // 默认使用日期为明天
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const useDate = tomorrow.toISOString().slice(0, 10);

    this.setData({
      ticketTypeId, ticketName: name, price: Number(price),
      scenicName, useDate,
      totalAmount: Number(price),
      visitors: [{ name: '', idCard: '', phone: '' }]
    });
  },

  // 选择日期
  onDateChange(e) {
    this.setData({ useDate: e.detail.value });
  },

  // 修改数量
  onQuantityChange(e) {
    const quantity = parseInt(e.detail.value) || 1;
    const visitors = Array.from({ length: quantity }, (_, i) => ({
      name: '', idCard: '', phone: ''
    }));
    // 保留已有游客信息
    const oldVisitors = this.data.visitors;
    for (let i = 0; i < Math.min(quantity, oldVisitors.length); i++) {
      visitors[i] = oldVisitors[i];
    }
    this.setData({ quantity, visitors, totalAmount: this.data.price * quantity });
  },

  // 更新游客信息
  onVisitorChange(e) {
    const { index, field } = e.currentTarget.dataset;
    const visitors = [...this.data.visitors];
    visitors[index][field] = e.detail.value;
    this.setData({ visitors });
  },

  // 更新联系人手机
  onPhoneChange(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  // 提交订单
  submitOrder() {
    // 校验
    if (!this.data.useDate) return wx.showToast({ title: '请选择使用日期', icon: 'none' });
    if (!this.data.contactPhone) return wx.showToast({ title: '请输入联系人手机', icon: 'none' });

    for (let i = 0; i < this.data.visitors.length; i++) {
      const v = this.data.visitors[i];
      if (!v.name) return wx.showToast({ title: `请输入第${i+1}位游客姓名`, icon: 'none' });
      if (!v.idCard) return wx.showToast({ title: `请输入第${i+1}位游客身份证号`, icon: 'none' });
    }

    this.setData({ submitting: true });

    app.request('/api/order/ticket/create', {
      method: 'POST',
      data: {
        ticketTypeId: Number(this.data.ticketTypeId),
        quantity: this.data.quantity,
        useDate: this.data.useDate,
        visitors: JSON.stringify(this.data.visitors),
        contactPhone: this.data.contactPhone
      }
    }).then(res => {
      // 模拟支付成功
      return app.request('/api/order/pay-callback', {
        method: 'POST',
        data: { orderNo: res.orderNo, transactionId: 'MINIAPP_' + Date.now() }
      });
    }).then(() => {
      wx.showToast({ title: '支付成功！', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/order/list' }), 1500);
    }).catch(err => {
      this.setData({ submitting: false });
    });
  }
});
