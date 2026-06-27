const app = getApp();

Page({
  data: {
    scenics: [],
    loading: true,
    keyword: '',
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad() {
    this.loadScenics();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, scenics: [], hasMore: true });
    this.loadScenics().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadScenics();
    }
  },

  loadScenics() {
    this.setData({ loading: true });
    return app.request('/api/scenic/list', {
      data: {
        keyword: this.data.keyword,
        page: this.data.page,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      const list = this.data.page === 1 ? res.list : [...this.data.scenics, ...res.list];
      this.setData({
        scenics: list,
        loading: false,
        hasMore: list.length < res.total
      });
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({ page: 1, scenics: [], hasMore: true });
    this.loadScenics();
  },

  goDetail(e) {
    const scenicId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/scenic/detail?scenicId=${scenicId}` });
  }
});
