// pages/alert/add.js
const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    etfId: '',
    etfCode: '',
    etfName: '',
    currentPrice: '',
    inputPrice: '',
    condition: 'above', // above, below
    conditions: [
      { value: 'above', label: '高于' },
      { value: 'below', label: '低于' }
    ]
  },

  onLoad(options) {
    const { id, code, name, price } = options;
    
    if (!id || !code || !name) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      etfId: id,
      etfCode: code,
      etfName: name,
      currentPrice: price || '',
      inputPrice: price || ''
    });
  },
  
  // 输入价格
  onPriceInput(e) {
    this.setData({
      inputPrice: e.detail.value
    });
  },
  
  // 选择条件
  onConditionChange(e) {
    this.setData({
      condition: e.detail.value
    });
  },
  
  // 保存提醒
  saveAlert() {
    const { etfId, etfCode, etfName, inputPrice, condition } = this.data;
    
    // 验证价格
    if (!inputPrice) {
      wx.showToast({
        title: '请输入价格',
        icon: 'none'
      });
      return;
    }
    
    const price = parseFloat(inputPrice);
    if (isNaN(price) || price <= 0) {
      wx.showToast({
        title: '请输入有效价格',
        icon: 'none'
      });
      return;
    }
    
    // 创建提醒对象
    const alert = {
      etfId,
      etfCode,
      etfName,
      price,
      condition,
      active: true,
      createTime: util.formatTime(new Date())
    };
    
    // 添加到全局提醒列表
    app.addPriceAlert(alert);
    
    wx.showToast({
      title: '提醒已设置',
      icon: 'success'
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },
  
  // 取消
  cancel() {
    wx.navigateBack();
  }
})