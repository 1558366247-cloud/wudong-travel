const app = getApp();

Page({
  data: {
    scenic: null,
    tickets: [],
    reviews: [],
    favorited: false,
    favText: 'Like',
    loading: true
  },

  onLoad(options) {
    const scenicId = options.scenicId;
    this.loadDetail(scenicId);
    this.loadReviews(scenicId);
    this.checkFav(scenicId);
  },

  loadDetail(scenicId) {
    app.request(`/api/scenic/detail/${scenicId}`).then(res => {
      this.setData({ scenic: res, tickets: res.tickets || [], loading: false });
    });
  },

  loadReviews(scenicId) {
    app.request('/api/review/list', { data: { scenicId } }).then(res => {
      const list = (res.list || []).map(item => {
        let stars = '';
        for (let i = 0; i < item.rating; i++) stars += '★';
        for (let i = item.rating; i < 5; i++) stars += '☆';
        return { ...item, ratingText: stars };
      });
      this.setData({ reviews: list });
    });
  },

  checkFav(scenicId) {
    app.request('/api/favorite/check', { data: { targetType: 'scenic', targetId: scenicId } })
      .then(res => {
        this.setData({ favorited: res.favorited, favText: res.favorited ? '❤️' : 'Like' });
      });
  },

  toggleFav() {
    const scenicId = this.data.scenic.scenicId;
    app.request('/api/favorite/toggle', {
      method: 'POST',
      data: { targetType: 'scenic', targetId: scenicId }
    }).then(res => {
      this.setData({ favorited: res.favorited, favText: res.favorited ? '❤️' : 'Like' });
      wx.showToast({ title: res.favorited ? 'saved' : 'removed', icon: 'none' });
    });
  },

  buyTicket(e) {
    const ticket = e.currentTarget.dataset.ticket;
    wx.navigateTo({
      url: `/pages/ticket/purchase?ticketTypeId=${ticket.ticketTypeId}&name=${ticket.name}&price=${ticket.price}&scenicName=${this.data.scenic.name}`
    });
  }
});
