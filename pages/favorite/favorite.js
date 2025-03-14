// pages/favorite/favorite.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    favoriteList: [],
    loading: true,
    lastUpdateTime: '',
    refreshing: false,
    autoRefreshTimer: null,
    isEmpty: false
  },

  onLoad() {
    this.loadFavorites();
  },
  
  onShow() {
    // 页面显示时重新加载自选列表
    this.loadFavorites();
    
    // 设置自动刷新
    this.setupAutoRefresh();
  },
  
  onHide() {
    // 页面隐藏时清除自动刷新定时器
    this.clearAutoRefresh();
  },
  
  onUnload() {
    // 页面卸载时清除自动刷新定时器
    this.clearAutoRefresh();
  },
  
  // 设置自动刷新
  setupAutoRefresh() {
    this.clearAutoRefresh();
    const interval = app.globalData.refreshInterval;
    if (interval > 0) {
      this.data.autoRefreshTimer = setInterval(() => {
        this.loadFavoritePrices();
      }, interval);
    }
  },
  
  // 清除自动刷新
  clearAutoRefresh() {
    if (this.data.autoRefreshTimer) {
      clearInterval(this.data.autoRefreshTimer);
      this.data.autoRefreshTimer = null;
    }
  },
  
  // 加载自选ETF列表
  loadFavorites() {
    const favorites = app.globalData.favorites;
    const etfList = app.globalData.etfList;
    
    if (favorites.length === 0) {
      this.setData({
        favoriteList: [],
        loading: false,
        isEmpty: true
      });
      return;
    }
    
    const favoriteList = favorites.map(id => {
      const etf = etfList.find(item => item.id === id);
      return {
        ...etf,
        isFavorite: true
      };
    }).filter(item => item); // 过滤掉可能的undefined
    
    this.setData({
      favoriteList,
      isEmpty: favoriteList.length === 0
    });
    
    // 加载价格数据
    this.loadFavoritePrices();
  },
  
  // 加载自选ETF价格
  loadFavoritePrices() {
    if (this.data.favoriteList.length === 0) {
      this.setData({ loading: false });
      return;
    }
    
    const codes = this.data.favoriteList.map(item => item.code);
    
    this.setData({ loading: true });
    
    api.getBatchETFPrices(codes)
      .then(results => {
        const updatedList = this.data.favoriteList.map(item => {
          const priceData = results.find(r => r.code === item.code);
          return {
            ...item,
            ...priceData
          };
        });
        
        this.setData({
          favoriteList: updatedList,
          loading: false,
          lastUpdateTime: new Date().toISOString(),
          refreshing: false
        });
      })
      .catch(error => {
        console.error('获取ETF价格失败', error);
        this.setData({
          loading: false,
          refreshing: false
        });
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
      });
  },
  
  // 手动刷新
  onRefresh() {
    if (this.data.refreshing) return;
    
    this.setData({ refreshing: true });
    this.loadFavoritePrices();
  },
  
  // 跳转到ETF详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },
  
  // 移除自选
  removeFavorite(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '移除自选',
      content: '确定要将此ETF从自选列表中移除吗？',
      success: (res) => {
        if (res.confirm) {
          app.removeFromFavorites(id);
          
          // 更新UI
          const favoriteList = this.data.favoriteList.filter(item => item.id !== id);
          this.setData({
            favoriteList,
            isEmpty: favoriteList.length === 0
          });
          
          wx.showToast({
            title: '已移除自选',
            icon: 'success'
          });
        }
      }
    });
  }
})