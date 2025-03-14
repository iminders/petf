// pages/alert/alert.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    alerts: [],
    loading: true,
    isEmpty: false
  },

  onLoad() {
    this.loadAlerts();
  },
  
  onShow() {
    // 页面显示时重新加载提醒列表
    this.loadAlerts();
  },
  
  // 加载价格提醒列表
  loadAlerts() {
    const alerts = app.globalData.priceAlerts;
    const etfList = app.globalData.etfList;
    
    if (alerts.length === 0) {
      this.setData({
        alerts: [],
        loading: false,
        isEmpty: true
      });
      return;
    }
    
    // 为每个提醒添加ETF信息
    const alertsWithETF = alerts.map(alert => {
      const etf = etfList.find(item => item.id === alert.etfId);
      return {
        ...alert,
        etf
      };
    });
    
    this.setData({
      alerts: alertsWithETF,
      loading: false,
      isEmpty: alertsWithETF.length === 0
    });
  },
  
  // 跳转到ETF详情页
  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },
  
  // 添加价格提醒
  addAlert() {
    wx.navigateTo({
      url: '/pages/alert/select'
    });
  },
  
  // 删除价格提醒
  deleteAlert(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '删除提醒',
      content: '确定要删除此价格提醒吗？',
      success: (res) => {
        if (res.confirm) {
          app.removePriceAlert(id);
          
          // 更新UI
          const alerts = this.data.alerts.filter(item => item.id !== id);
          this.setData({
            alerts,
            isEmpty: alerts.length === 0
          });
          
          wx.showToast({
            title: '已删除提醒',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 切换提醒状态
  toggleAlertStatus(e) {
    const { id } = e.currentTarget.dataset;
    const alerts = app.globalData.priceAlerts;
    const index = alerts.findIndex(item => item.id === id);
    
    if (index > -1) {
      const alert = alerts[index];
      alert.active = !alert.active;
      
      // 更新全局数据
      app.globalData.priceAlerts = alerts;
      wx.setStorageSync('priceAlerts', alerts);
      
      // 更新UI
      const updatedAlerts = this.data.alerts.map(item => {
        if (item.id === id) {
          return {
            ...item,
            active: alert.active
          };
        }
        return item;
      });
      
      this.setData({ alerts: updatedAlerts });
      
      wx.showToast({
        title: alert.active ? '已启用提醒' : '已禁用提醒',
        icon: 'success'
      });
    }
  }
})