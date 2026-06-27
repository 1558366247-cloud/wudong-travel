const app = getApp();

Page({
  data: {
    guides: [],
    departures: [],
    departure: '',
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad() {
    app.request('/api/guide/departures').then(res => this.setData({ departures: res || [] }));
    this.loadGuides();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, guides: [], hasMore: true });
    this.loadGuides().then(() => wx.stopPullDownRefresh());
  },
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadGuides();
    }
  },

  loadGuides() {
    this.setData({ loading: true });
    app.request('/api/guide/list', {
      data: { departure: this.data.departure || undefined, page: this.data.page, pageSize: 10 }
    }).then(res => {
      const list = this.data.page === 1 ? res.list : [...this.data.guides, ...res.list];
      this.setData({ guides: list, loading: false, hasMore: list.length < res.total });
    }).catch(() => this.setData({ loading: false }));
  },

  onDepartureChange(e) {
    this.setData({ departure: this.data.departures[e.detail.value] || '', page: 1, guides: [], hasMore: true });
    this.loadGuides();
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/guide/detail?guideId=${e.currentTarget.dataset.id}` });
  }
});
