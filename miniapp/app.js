App({
  globalData: {
    userInfo: null,
    token: '',
    baseUrl: 'http://localhost:3001' // 替换为实际API地址
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
    }
  },

  // 统一请求方法
  request(url, options = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.globalData.token}`
        },
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            wx.showToast({ title: res.data?.message || '请求失败', icon: 'none' });
            reject(res.data);
          }
        },
        fail(err) {
          wx.showToast({ title: '网络异常', icon: 'none' });
          reject(err);
        }
      });
    });
  }
});
