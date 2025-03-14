// pages/news/detail.js
Page({
  data: {
    url: ''
  },

  onLoad(options) {
    if (options.url) {
      this.setData({
        url: decodeURIComponent(options.url)
      });
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  }
})