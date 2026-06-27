const app = getApp();

Page({
  data: { guide: null, loading: true },

  onLoad(options) {
    app.request(`/api/guide/detail/${options.guideId}`).then(res => {
      this.setData({ guide: res, loading: false });
    }).catch(() => this.setData({ loading: false }));
  }
});
