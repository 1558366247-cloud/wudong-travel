const app = getApp();

Page({
  data: {
    routes: [],
    loading: true,
    duration: '',
    theme: '',
    keyword: '',
    page: 1,
    hasMore: true,
    durations: ['', '一日游', '两日游', '多日游'],
    themes: ['', '亲子', '摄影', '研学', '节庆']
  },

  onLoad() { this.loadRoutes(); },
  onPullDownRefresh() {
    this.setData({ page: 1, routes: [], hasMore: true });
    this.loadRoutes().then(() => wx.stopPullDownRefresh());
  },
  onReachBottom() {
    if (this.data.hasMore) { this.setData({ page: this.data.page + 1 }); this.loadRoutes(); }
  },

  loadRoutes() {
    this.setData({ loading: true });
    return app.request('/api/route/list', {
      data: {
        duration: this.data.duration || undefined,
        theme: this.data.theme || undefined,
        keyword: this.data.keyword || undefined,
        page: this.data.page, pageSize: 10
      }
    }).then(res => {
      const list = this.data.page === 1 ? res.list : [...this.data.routes, ...res.list];
      this.setData({ routes: list, loading: false, hasMore: list.length < res.total });
    }).catch(() => this.setData({ loading: false }));
  },

  onFilterChange(e) {
    const { type, value } = e.currentTarget.dataset;
    this.setData({ [type]: value, page: 1, routes: [], hasMore: true });
    this.loadRoutes();
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/route/detail?routeId=${e.currentTarget.dataset.id}` });
  }
});
