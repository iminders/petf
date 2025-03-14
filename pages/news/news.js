// pages/news/news.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  data: {
    newsList: [],
    loading: true,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadNews();
  },
  
  // 加载资讯
  loadNews(refresh = false) {
    if (refresh) {
      this.setData({
        page: 1,
        hasMore: true,
        newsList: []
      });
    }
    
    if (!this.data.hasMore && !refresh) {
      return;
    }
    
    this.setData({
      loading: this.data.page === 1,
      loadingMore: this.data.page > 1
    });
    
    api.getETFNews(this.data.page, this.data.pageSize)
      .then(result => {
        const { list, total } = result;
        const newsList = refresh ? list : [...this.data.newsList, ...list];
        const hasMore = newsList.length < total;
        
        this.setData({
          newsList,
          loading: false,
          loadingMore: false,
          hasMore
        });
      })
      .catch(error => {
        console.error('获取资讯失败', error);
        this.setData({
          loading: false,
          loadingMore: false
        });
        wx.showToast({
          title: '获取资讯失败',
          icon: 'none'
        });
      });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadNews(true);
    wx.stopPullDownRefresh();
  },
  
  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.setData({
        page: this.data.page + 1
      });
      this.loadNews();
    }
  },
  
  // 查看资讯详情
  viewNewsDetail(e) {
    const { url } = e.currentTarget.dataset;
    // 使用web-view组件打开网页
    wx.navigateTo({
      url: `/pages/news/detail?url=${encodeURIComponent(url)}`
    });
  }
})