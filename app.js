// app.js
App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查是否有存储的主题设置
    const theme = wx.getStorageSync('theme') || 'light';
    this.globalData.theme = theme;
    
    // 检查是否有存储的刷新频率设置
    const refreshInterval = wx.getStorageSync('refreshInterval') || 60000; // 默认1分钟
    this.globalData.refreshInterval = refreshInterval;
    
    // 初始化自选ETF列表
    const favorites = wx.getStorageSync('favorites') || [];
    this.globalData.favorites = favorites;
    
    // 初始化价格提醒列表
    const priceAlerts = wx.getStorageSync('priceAlerts') || [];
    this.globalData.priceAlerts = priceAlerts;
  },
  
  globalData: {
    systemInfo: null,
    theme: 'light',
    refreshInterval: 60000, // 默认刷新间隔为1分钟
    favorites: [],
    priceAlerts: [],
    etfList: [
      { id: '510300', name: '沪深300ETF', code: '510300', type: 'index' },
      { id: '510500', name: '中证500ETF', code: '510500', type: 'index' },
      { id: '512100', name: '中证1000ETF', code: '512100', type: 'index' },
      { id: '563300', name: '中证2000ETF', code: '563300', type: 'index' },
      { id: '518880', name: '黄金ETF', code: '518880', type: 'gold' },
      { id: '510880', name: '红利ETF', code: '510880', type: 'dividend' }
    ]
  },
  
  // 添加到自选
  addToFavorites(etfId) {
    if (!this.globalData.favorites.includes(etfId)) {
      this.globalData.favorites.push(etfId);
      wx.setStorageSync('favorites', this.globalData.favorites);
      return true;
    }
    return false;
  },
  
  // 从自选中移除
  removeFromFavorites(etfId) {
    const index = this.globalData.favorites.indexOf(etfId);
    if (index > -1) {
      this.globalData.favorites.splice(index, 1);
      wx.setStorageSync('favorites', this.globalData.favorites);
      return true;
    }
    return false;
  },
  
  // 检查是否在自选中
  isInFavorites(etfId) {
    return this.globalData.favorites.includes(etfId);
  },
  
  // 添加价格提醒
  addPriceAlert(alert) {
    alert.id = Date.now().toString(); // 使用时间戳作为唯一ID
    this.globalData.priceAlerts.push(alert);
    wx.setStorageSync('priceAlerts', this.globalData.priceAlerts);
    return alert.id;
  },
  
  // 删除价格提醒
  removePriceAlert(alertId) {
    const index = this.globalData.priceAlerts.findIndex(item => item.id === alertId);
    if (index > -1) {
      this.globalData.priceAlerts.splice(index, 1);
      wx.setStorageSync('priceAlerts', this.globalData.priceAlerts);
      return true;
    }
    return false;
  },
  
  // 更新主题设置
  updateTheme(theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
  },
  
  // 更新刷新频率设置
  updateRefreshInterval(interval) {
    this.globalData.refreshInterval = interval;
    wx.setStorageSync('refreshInterval', interval);
  }
})