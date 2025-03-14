// pages/index/index.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    etfList: [],
    loading: true,
    lastUpdateTime: '',
    refreshing: false,
    autoRefreshTimer: null
  },

  onLoad() {
    // 获取ETF列表
    this.setData({
      etfList: app.globalData.etfList
    });
    
    // 加载ETF价格数据
    this.loadETFPrices();
    
    // 设置自动刷新
    this.setupAutoRefresh();
  },
  
  onShow() {
    // 页面显示时，如果数据超过1分钟未更新，则刷新数据
    const now = new Date();
    const lastUpdate = this.data.lastUpdateTime ? new Date(this.data.lastUpdateTime) : null;
    if (!lastUpdate || (now - lastUpdate) > 60000) {
      this.loadETFPrices();
    }
    
    // 重新设置自动刷新
    this.setupAutoRefresh();
  },
  
  onHide() {
    // 页面隐藏时清除自动刷新定时器
    this.clearAutoRefresh();
  },
  
  onUnload() {
    // 页面卸载时清除自动刷新定时器·
    this.clearAutoRefresh();
  },
  
  // 设置自动刷新
  setupAutoRefresh() {
    this.clearAutoRefresh();
    const interval = app.globalData.refreshInterval;
    if (interval > 0) {
      this.data.autoRefreshTimer = setInterval(() => {
        this.loadETFPrices();
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
  
  // 加载ETF价格数据
  loadETFPrices() {
    const codes = this.data.etfList.map(item => item.code);
    
    this.setData({ loading: true });
    
    api.getBatchETFPrices(codes)
      .then(results => {
        const updatedList = this.data.etfList.map(item => {
          const priceData = results.find(r => r.code === item.code);
        
          // TODO: ETF名称编码格式
          if (priceData && priceData.name) {
            priceData.name = item.name;
          }
          return {
            ...item,
            ...priceData
          };
        });
        
        // 使用中国北京时间格式
        const now = new Date();
        const beijingTimeString = util.formatTime(now);
        
        this.setData({
          etfList: updatedList,
          loading: false,
          lastUpdateTime: beijingTimeString,
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
    this.loadETFPrices();
  },
  
  // 跳转到ETF详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },
  
  // 添加或移除自选
  toggleFavorite(e) {
    const { id } = e.currentTarget.dataset;
    const isInFavorites = app.isInFavorites(id);
    
    if (isInFavorites) {
      app.removeFromFavorites(id);
    } else {
      app.addToFavorites(id);
    }
    
    // 更新UI
    const etfList = this.data.etfList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isFavorite: !isInFavorites
        };
      }
      return item;
    });
    
    this.setData({ etfList });
    
    wx.showToast({
      title: isInFavorites ? '已移除自选' : '已添加自选',
      icon: 'success'
    });
  }
})