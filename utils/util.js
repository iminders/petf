// utils/util.js

// 格式化时间
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

// 获取当前中国时间
function getCurrentChinaTime() {
  // 创建一个新的日期对象，它将使用当前的本地时间
  const date = new Date();
  
  // 将日期格式化为中国时间格式
  return formatTime(date);
}

// 数字补零
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 格式化价格显示
const formatPrice = (price, digits = 2) => {
  if (isNaN(price)) return '--';
  return parseFloat(price).toFixed(digits);
}

// 格式化涨跌幅
const formatChange = (change, digits = 2) => {
  if (isNaN(change)) return '--';
  const sign = change > 0 ? '+' : '';
  return `${sign}${parseFloat(change).toFixed(digits)}`;
}

// 格式化百分比
const formatPercent = (percent, digits = 2) => {
  if (isNaN(percent)) return '--';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${parseFloat(percent).toFixed(digits)}%`;
}

// 获取价格变化的CSS类名
const getPriceChangeClass = (change) => {
  if (isNaN(change) || change === 0) return 'price-equal';
  return change > 0 ? 'price-up' : 'price-down';
}

// 防抖函数
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  }
}

// 节流函数
const throttle = (fn, interval = 300) => {
  let last = 0;
  return function() {
    const context = this;
    const args = arguments;
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(context, args);
    }
  }
}

// 检查价格提醒是否触发
const checkPriceAlert = (alert, currentPrice) => {
  if (!alert || !currentPrice) return false;
  
  const price = parseFloat(currentPrice);
  const targetPrice = parseFloat(alert.price);
  
  if (isNaN(price) || isNaN(targetPrice)) return false;
  
  switch (alert.condition) {
    case 'above':
      return price >= targetPrice;
    case 'below':
      return price <= targetPrice;
    default:
      return false;
  }
}

// 处理中文编码问题
function fixChineseEncoding(text) {
  if (!text) return '';
  
  try {
    // 检测是否包含中文字符
    if (/[\u4e00-\u9fa5]/.test(text)) {
      // 对于iOS设备可能需要特殊处理
      const app = getApp();
      const isIOS = app && app.globalData && app.globalData.systemInfo && 
                    app.globalData.systemInfo.platform === 'ios';
      
      if (isIOS) {
        // iOS设备上的特殊处理
        // 1. 先去除首尾空格
        let processedText = text.trim();
        
        // 2. 处理可能的编码问题，iOS上某些中文字符可能会被错误编码
        processedText = processedText
          .replace(/\\u/g, '%u')  // 处理Unicode转义序列
          .replace(/%(?![0-9a-fA-F]{2})/g, '%25');  // 处理错误的百分号编码
        
        try {
          // 3. 尝试解码
          processedText = decodeURIComponent(processedText);
        } catch (e) {
          // 解码失败，保持原样
          console.warn('解码中文字符失败:', e);
        }
        
        // 4. 处理特殊字符替换
        const specialCharsMap = {
          '&nbsp;': ' ',
          '&quot;': '"',
          '&lt;': '<',
          '&gt;': '>',
          '&amp;': '&'
        };
        
        Object.keys(specialCharsMap).forEach(key => {
          processedText = processedText.replace(new RegExp(key, 'g'), specialCharsMap[key]);
        });
        
        return processedText;
      }
    }
    return text;
  } catch (e) {
    console.error('修复中文编码出错:', e);
    return text || '';
  }
}

module.exports = {
  formatTime,
  getCurrentChinaTime,
  formatNumber,
  formatPrice,
  formatChange,
  formatPercent,
  getPriceChangeClass,
  debounce,
  throttle,
  checkPriceAlert,
  fixChineseEncoding
}