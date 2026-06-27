const app = getApp();

Page({
  data: {
    route: null,
    itineraries: [],
    reviews: [],
    favorited: false,
    loading: true
  },

  onLoad(options) {
    const routeId = options.routeId;
    app.request(`/api/route/detail/${routeId}`).then(res => {
      this.setData({
        route: res,
        itineraries: res.itineraries || [],
        loading: false
      });
    });
    app.request('/api/review/list', { data: { routeId } }).then(res => this.setData({ reviews: res.list || [] }));
    app.request('/api/favorite/check', { data: { targetType: 'route', targetId: routeId } })
      .then(res => this.setData({ favorited: res.favorited }));
  },

  toggleFav() {
    app.request('/api/favorite/toggle', {
      method: 'POST',
      data: { targetType: 'route', targetId: this.data.route.routeId }
    }).then(res => {
      this.setData({ favorited: res.favorited });
      wx.showToast({ title: res.favorited ? '已收藏' : '已取消', icon: 'none' });
    });
  },

  goPurchase() {
    const { route } = this.data;
    wx.navigateTo({
      url: `/pages/route/purchase?routeId=${route.routeId}&title=${route.title}&price=${route.price}&stock=${route.stock}`
    });
  }
});
