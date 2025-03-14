// pages/detail/detail.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const constants = require('../../utils/constants.js');

Page({
  data: {
    id: '',
    etf: null,
    loading: true,
    chartLoading: true,
    basicInfoLoading: true,
    currentTab: 'chart', // chart, info
    chartPeriod: 'day', // day, week, month, year
    chartData: [],
    basicInfo: null,
    isFavorite: false,
    priceAlerts: [],
    updateTime: '' // 添加更新时间字段
  },

  onLoad(options) {
    const { id } = options;
    
    if (!id) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({ id });
    
    // 获取ETF信息
    const etf = app.globalData.etfList.find(item => item.id === id);
    if (etf) {
      this.setData({ 
        etf,
        isFavorite: app.isInFavorites(id)
      });
      
      // 加载ETF价格
      this.loadETFPrice();
      
      // 加载图表数据
      this.loadChartData();
      
      // 加载基本信息
      this.loadBasicInfo();
      
      // 加载价格提醒
      this.loadPriceAlerts();
    } else {
      wx.showToast({
        title: '未找到ETF信息',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  onShow() {
    // 检查自选状态是否有变化
    const isFavorite = app.isInFavorites(this.data.id);
    if (isFavorite !== this.data.isFavorite) {
      this.setData({ isFavorite });
    }
    
    // 检查价格提醒是否有变化
    this.loadPriceAlerts();
  },
  
  // 加载ETF价格
  loadETFPrice() {
    if (!this.data.etf) return;
    
    this.setData({ loading: true });
    
    api.getETFPrice(this.data.etf.code)
      .then(result => {
        // 处理成交量和成交额的格式化显示

        // TODO: ETF名称编码格式
        result.name = this.data.etf.name;
        const formattedResult = {
          ...result,
          volumeDisplay: result.volume ? (result.volume/10000).toFixed(2) + '万' : '--',
          amountDisplay: result.amount ? (result.amount/100000000).toFixed(2) + '亿' : '--'
        };
        
        // 设置更新时间为当前中国时间
        const updateTime = util.getCurrentChinaTime();
        
        this.setData({
          etf: {
            ...this.data.etf,
            ...formattedResult
          },
          loading: false,
          updateTime: updateTime
        });
      })
      .catch(error => {
        console.error('获取ETF价格失败', error);
        this.setData({ loading: false });
        wx.showToast({
          title: '获取价格失败',
          icon: 'none'
        });
      });
  },
  
  // 加载图表数据
  loadChartData() {
    if (!this.data.etf) return;
    
    this.setData({ chartLoading: true });
    
    api.getETFHistory(this.data.etf.code, this.data.chartPeriod)
      .then(result => {
        this.setData({
          chartData: result,
          chartLoading: false
        });
        
        // 渲染图表
        this.renderChart();
      })
      .catch(error => {
        console.error('获取ETF历史数据失败', error);
        this.setData({ chartLoading: false });
        wx.showToast({
          title: '获取图表数据失败',
          icon: 'none'
        });
      });
  },
  
  // 加载基本信息
  loadBasicInfo() {
    if (!this.data.etf) return;
    
    this.setData({ basicInfoLoading: true });
    
    api.getETFInfo(this.data.etf.code)
      .then(result => {
        this.setData({
          basicInfo: result,
          basicInfoLoading: false
        });
      })
      .catch(error => {
        console.error('获取ETF基本信息失败', error);
        this.setData({ basicInfoLoading: false });
        wx.showToast({
          title: '获取基本信息失败',
          icon: 'none'
        });
      });
  },
  
  // 加载价格提醒
  loadPriceAlerts() {
    const priceAlerts = app.globalData.priceAlerts.filter(
      alert => alert.etfId === this.data.id
    );
    
    this.setData({ priceAlerts });
  },
  
  // 渲染图表
  renderChart() {
    if (!this.data.chartData || this.data.chartData.length === 0) {
      console.log('没有图表数据可渲染');
      return;
    }
    
    const query = wx.createSelectorQuery();
    query.select('#chart-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          console.error('未找到canvas节点');
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const width = res[0].width;
        const height = res[0].height;
        
        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 准备数据
        const chartData = this.data.chartData;
        const dataLength = chartData.length;
        
        if (dataLength === 0) return;
        
        // 找出最高价和最低价
        let maxPrice = parseFloat(chartData[0].high);
        let minPrice = parseFloat(chartData[0].low);
        
        for (let i = 0; i < dataLength; i++) {
          const high = parseFloat(chartData[i].high);
          const low = parseFloat(chartData[i].low);
          if (high > maxPrice) maxPrice = high;
          if (low < minPrice) minPrice = low;
        }
        
        // 设置边距
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // 计算比例
        const priceRange = maxPrice - minPrice;
        const xScale = chartWidth / (dataLength - 1);
        const yScale = chartHeight / priceRange;
        
        // 绘制坐标轴
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        
        // X轴
        ctx.moveTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        
        // Y轴
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();
        
        // 绘制Y轴刻度和网格线
        const yTickCount = 5;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        
        for (let i = 0; i <= yTickCount; i++) {
          const y = padding.top + chartHeight - (i / yTickCount) * chartHeight;
          const price = minPrice + (i / yTickCount) * priceRange;
          
          // 绘制刻度线
          ctx.beginPath();
          ctx.moveTo(padding.left - 5, y);
          ctx.lineTo(padding.left, y);
          ctx.stroke();
          
          // 绘制价格文本
          ctx.fillText(price.toFixed(2), padding.left - 8, y);
          
          // 绘制网格线
          ctx.beginPath();
          ctx.strokeStyle = '#eee';
          ctx.moveTo(padding.left, y);
          ctx.lineTo(width - padding.right, y);
          ctx.stroke();
        }
        
        // 绘制K线
        for (let i = 0; i < dataLength; i++) {
          const data = chartData[i];
          const open = parseFloat(data.open);
          const close = parseFloat(data.close);
          const high = parseFloat(data.high);
          const low = parseFloat(data.low);
          
          const x = padding.left + i * xScale;
          const yOpen = height - padding.bottom - (open - minPrice) * yScale;
          const yClose = height - padding.bottom - (close - minPrice) * yScale;
          const yHigh = height - padding.bottom - (high - minPrice) * yScale;
          const yLow = height - padding.bottom - (low - minPrice) * yScale;
          
          // 绘制影线
          ctx.beginPath();
          ctx.strokeStyle = close >= open ? '#e64340' : '#09bb07';
          ctx.moveTo(x, yHigh);
          ctx.lineTo(x, yLow);
          ctx.stroke();
          
          // 绘制K线实体
          const candleWidth = Math.max(1, xScale * 0.6);
          ctx.fillStyle = close >= open ? '#e64340' : '#09bb07';
          ctx.fillRect(
            x - candleWidth / 2,
            Math.min(yOpen, yClose),
            candleWidth,
            Math.abs(yClose - yOpen) || 1
          );
          
          // 每隔一定数量显示日期
          if (i % Math.ceil(dataLength / 6) === 0) {
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText(data.day.substring(5), x, height - padding.bottom + 15);
          }
        }
      });
  },
  
  // 切换Tab
  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ currentTab: tab });
  },
  
  // 切换图表周期
  switchChartPeriod(e) {
    const { period } = e.currentTarget.dataset;
    this.setData({ chartPeriod: period });
    this.loadChartData();
  },
  
  // 刷新价格
  refreshPrice() {
    this.loadETFPrice();
  },
  
  // 添加或移除自选
  toggleFavorite() {
    const isInFavorites = app.isInFavorites(this.data.id);
    
    if (isInFavorites) {
      app.removeFromFavorites(this.data.id);
    } else {
      app.addToFavorites(this.data.id);
    }
    
    this.setData({ isFavorite: !isInFavorites });
    
    wx.showToast({
      title: isInFavorites ? '已移除自选' : '已添加自选',
      icon: 'success'
    });
  },
  
  // 添加价格提醒
  addPriceAlert() {
    wx.navigateTo({
      url: `/pages/alert/add?id=${this.data.id}&code=${this.data.etf.code}&name=${this.data.etf.name}&price=${this.data.etf.price}`
    });
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.etf.name}(${this.data.etf.code})行情`,
      path: `/pages/detail/detail?id=${this.data.id}`
    };
  }
})