// utils/api.js
// 这里使用新浪财经的API作为示例，实际使用时可能需要根据API提供商调整

// 基础URL
const BASE_URL = 'https://hq.sinajs.cn/list=';

// 获取单个ETF的实时价格
// 检查 api.js 中是否有 Trace 的引用
// 如果在 api.js 中找不到，可能需要检查其他 JS 文件

// 常见的错误位置可能在错误处理或日志记录部分
// 获取单个ETF的实时价格
function getETFPrice(code) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}sh${code}`,
      header: {
        'Referer': 'https://finance.sina.com.cn',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      dataType: 'text',  // 确保返回原始文本，不自动解析
      success: (res) => {
        try {
          // 解析返回的数据
          const data = res.data;
          const match = data.match(/="([^"]+)"/);
          if (match && match[1]) {
            const values = match[1].split(',');
            
            // 处理日期和时间为中国时间
            const dateStr = values[30];
            const timeStr = values[31];
            const dateTimeStr = `${dateStr} ${timeStr}`;
            
            const result = {
              name: values[0],
              open: parseFloat(values[1]),
              prevClose: parseFloat(values[2]),
              price: parseFloat(values[3]),
              high: parseFloat(values[4]),
              low: parseFloat(values[5]),
              volume: parseFloat(values[8]),
              amount: parseFloat(values[9]),
              date: dateStr,
              time: timeStr,
              dateTime: dateTimeStr, // 添加完整的日期时间字符串
              change: parseFloat((parseFloat(values[3]) - parseFloat(values[2])).toFixed(4)),
              changePercent: parseFloat(((parseFloat(values[3]) - parseFloat(values[2])) / parseFloat(values[2]) * 100).toFixed(2))
            };
            resolve(result);
          } else {
            reject(new Error('数据解析失败'));
          }
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

// 批量获取ETF价格
function getBatchETFPrices(codes) {
  const codeStr = codes.map(code => `sh${code}`).join(',');
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${codeStr}`,
      header: {
        'Referer': 'https://finance.sina.com.cn',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      success: (res) => {
        try {
          const data = res.data;
          const lines = data.split('\n');
          const results = [];
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/="([^"]+)"/);
            if (match && match[1]) {
              const values = match[1].split(',');
              const result = {
                code: codes[i],
                name: values[0],
                open: parseFloat(values[1]),
                prevClose: parseFloat(values[2]),
                price: parseFloat(values[3]),
                high: parseFloat(values[4]),
                low: parseFloat(values[5]),
                volume: parseFloat(values[8]),
                amount: parseFloat(values[9]),
                date: values[30],
                time: values[31],
                change: parseFloat((parseFloat(values[3]) - parseFloat(values[2])).toFixed(4)),
                changePercent: parseFloat(((parseFloat(values[3]) - parseFloat(values[2])) / parseFloat(values[2]) * 100).toFixed(2))
              };
              results.push(result);
            }
          }
          
          resolve(results);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

// 获取ETF历史K线数据
function getETFHistory(code, period = 'day') {
  // 这里使用新浪的K线接口，实际使用时可能需要根据API提供商调整
  // period可选值：day, week, month, year
  let url;
  switch (period) {
    case 'day':
      url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}_day=/CN_MarketDataService.getKLineData?symbol=sh${code}&scale=240&ma=no&datalen=60`;
      break;
    case 'week':
      url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}_week=/CN_MarketDataService.getKLineData?symbol=sh${code}&scale=1200&ma=no&datalen=60`;
      break;
    case 'month':
      url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}_month=/CN_MarketDataService.getKLineData?symbol=sh${code}&scale=1680&ma=no&datalen=60`;
      break;
    case 'year':
      url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}_year=/CN_MarketDataService.getKLineData?symbol=sh${code}&scale=1680&ma=no&datalen=240`;
      break;
    default:
      url = `https://quotes.sina.cn/cn/api/jsonp_v2.php/var%20_sh${code}_day=/CN_MarketDataService.getKLineData?symbol=sh${code}&scale=240&ma=no&datalen=60`;
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      header: {
        'Referer': 'https://finance.sina.com.cn',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      success: (res) => {
        try {
          // 解析JSONP返回的数据
          const data = res.data;
          const jsonStr = data.match(/\=\((.*)\);/);
          if (jsonStr && jsonStr[1]) {
            const jsonData = JSON.parse(jsonStr[1]);
            resolve(jsonData);
          } else {
            reject(new Error('数据解析失败'));
          }
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

// 获取ETF基本信息
function getETFInfo(code) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `https://finance.sina.com.cn/fund/quotes/${code}/bc.shtml`,
      header: {
        'Referer': 'https://finance.sina.com.cn',
        'Accept-Charset': 'utf-8',
        'Content-Type': 'text/html; charset=utf-8'  // 这里是HTML页面，所以Content-Type不同
      },
      success: (res) => {
        try {
          // 这里需要解析HTML页面获取基金信息
          // 实际项目中可能需要后端支持或使用更适合的API
          // 这里简化处理，返回一些基本信息
          const info = {
            code: code,
            fullName: `${code} ETF`,
            manager: '示例基金管理公司',
            establishDate: '2010-01-01',
            scale: '100亿元',
            managementFee: '0.5%',
            trackingError: '0.1%'
          };
          resolve(info);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}


module.exports = {
  getETFPrice,
  getBatchETFPrices,
  getETFHistory,
  getETFInfo
  // 从导出中移除 getETFNews
};