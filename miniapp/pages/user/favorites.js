const app = getApp();

Page({
  data: {
    favorites: [],
    loading: true,
    type: ''
  },

  onLoad() {
    this.loadFavorites();
  },

  loadFavorites() {
    this.setData({ loading: true });
    const params = { page: 1, pageSize: 50 };
    if (this.data.type) params.targetType = this.data.type;

    app.request('/api/favorite/list', { data: params }).then(res => {
      this.setData({ favorites: res.list || [], loading: false });
    }).catch(() => this.setData({ loading: false }));
  },

  onTabChange(e) {
    this.setData({ type: e.currentTarget.dataset.type || '' });
    this.loadFavorites();
  },

  removeFav(e) {
    const { type, id } = e.currentTarget.dataset;
    app.request('/api/favorite/toggle', {
      method: 'POST',
      data: { targetType: type, targetId: id }
    }).then(() => {
      wx.showToast({ title: '已取消收藏', icon: 'none' });
      this.loadFavorites();
    });
  },

  goTarget(e) {
    const { type, id } = e.currentTarget.dataset;
    const urls = {
      scenic: `/pages/scenic/detail?scenicId=${id}`,
      route: `/pages/route/detail?routeId=${id}`,
      guide: `/pages/guide/detail?guideId=${id}`
    };
    wx.navigateTo({ url: urls[type] || '' });
  }
});
