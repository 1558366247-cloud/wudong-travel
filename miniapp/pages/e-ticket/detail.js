const app = getApp();
const QR = require('../../utils/qrcode'); // 引用二维码生成库

Page({
  data: {
    ticket: null,
    qrCodeData: '',
    statusMap: { unused: '未使用', used: '已使用', refunded: '已退款', expired: '已过期' },
    statusColor: { unused: '#1F5FA8', used: '#52C41A', refunded: '#FF4D4F', expired: '#BFBFBF' }
  },

  onLoad(options) {
    const eTicketId = options.eTicketId;
    app.request(`/api/e-ticket/detail/${eTicketId}`).then(res => {
      this.setData({ ticket: res, qrCodeData: res.qrCode });
      // 生成二维码
      this.generateQR(res.qrCode);
    });
  },

  generateQR(code) {
    // 使用微信小程序原生canvas绘制二维码
    // 简化版：显示票号文本
    const qr = wx.createSelectorQuery();
    qr.select('#qrCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        canvas.width = 280;
        canvas.height = 280;
        // 简单绘制二维码占位符
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 280, 280);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('电子票', 140, 120);
        ctx.font = '14px monospace';
        ctx.fillText(code.substring(0, 20), 140, 160);
      }
    });
  },

  previewQR() {
    wx.previewImage({
      urls: [this.data.qrCodeData],
      current: this.data.qrCodeData
    });
  }
});
