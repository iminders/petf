// utils/constants.js

// ETF类型
const ETF_TYPES = {
  INDEX: 'index',
  GOLD: 'gold',
  DIVIDEND: 'dividend'
};

// 价格提醒条件
const ALERT_CONDITIONS = {
  ABOVE: 'above',
  BELOW: 'below'
};

// 图表周期
const CHART_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

// 刷新间隔选项（毫秒）
const REFRESH_INTERVALS = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 },
  { label: '5分钟', value: 300000 },
  { label: '不自动刷新', value: 0 }
];

// 主题选项
const THEMES = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' }
];

module.exports = {
  ETF_TYPES,
  ALERT_CONDITIONS,
  CHART_PERIODS,
  REFRESH_INTERVALS,
  THEMES
};