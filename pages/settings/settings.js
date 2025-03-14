// pages/settings/settings.js
const app = getApp();
const constants = require('../../utils/constants.js');

Page({
  data: {
    theme: 'light',
    themes: constants.THEMES,
    refreshInterval: 60000,
    refreshIntervals: constants.REFRESH_INTERVALS,
    // 添加计算属性
    currentThemeLabel: '',
    currentRefreshIntervalLabel: ''
  },

  // 在 onLoad 函数中添加计算索引的代码
  onLoad() {
    // 获取当前设置
    const theme = app.globalData.theme;
    const refreshInterval = app.globalData.refreshInterval;
    
    // 计算显示标签
    const currentTheme = constants.THEMES.find(item => item.value === theme) || constants.THEMES[0];
    const currentRefreshInterval = constants.REFRESH_INTERVALS.find(item => item.value === refreshInterval) || constants.REFRESH_INTERVALS[0];
    
    // 计算索引
    const themeIndex = constants.THEMES.findIndex(item => item.value === theme);
    const refreshIntervalIndex = constants.REFRESH_INTERVALS.findIndex(item => item.value === refreshInterval);
    
    this.setData({
      theme,
      refreshInterval,
      currentThemeLabel: currentTheme.label,
      currentRefreshIntervalLabel: currentRefreshInterval.label,
      themeIndex: themeIndex !== -1 ? themeIndex : 0,
      refreshIntervalIndex: refreshIntervalIndex !== -1 ? refreshIntervalIndex : 0
    });
  },
  
  // 切换主题
  onThemeChange(e) {
    const index = e.detail.value;
    const theme = this.data.themes[index].value;
    const themeLabel = this.data.themes[index].label;
    
    this.setData({ 
      theme,
      currentThemeLabel: themeLabel
    });
    
    app.updateTheme(theme);
    
    // 应用主题
    this.applyTheme(theme);
  },
  
  // 应用主题
  applyTheme(theme) {
    // 这里可以根据主题设置不同的样式
    // 实际项目中可能需要更复杂的主题切换逻辑
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#333333'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#1E88E5'
      });
    }
  },
  
  // 切换刷新间隔
  onRefreshIntervalChange(e) {
    const index = e.detail.value;
    const interval = parseInt(this.data.refreshIntervals[index].value);
    const intervalLabel = this.data.refreshIntervals[index].label;
    
    this.setData({ 
      refreshInterval: interval,
      currentRefreshIntervalLabel: intervalLabel
    });
    
    app.updateRefreshInterval(interval);
  },
  
  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            
            // 重置应用数据
            app.globalData.favorites = [];
            app.globalData.priceAlerts = [];
            
            wx.showToast({
              title: '缓存已清除',
              icon: 'success'
            });
          } catch (e) {
            console.error('清除缓存失败', e);
            wx.showToast({
              title: '清除缓存失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },
  
  // 关于我们
  about() {
    wx.showModal({
      title: '关于PETF',
      content: 'PETF是一款专注于A股ETF行情展示的微信小程序，提供沪深300ETF、中证500ETF、中证1000ETF、中证2000ETF、黄金ETF、红利ETF等主要ETF的实时价格和历史走势。\n\n版本：1.0.0\n开发者：PETF团队',
      showCancel: false
    });
  },
  
  // 联系我们
  contact() {
    wx.showModal({
      title: '联系我们',
      content: '如有问题或建议，请发送邮件至：\nsupport@petf.example.com',
      showCancel: false
    });
  }
})