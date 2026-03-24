import React, { useMemo, useState } from 'react';
import './Ticker.css';

const rawNews = [
  { text: "及时止盈：当前市场波动较大，达到预期收益建议分批套现。", type: "up" },
  { text: "不要追高：白银/黄金处于高位盘整期，盲目追涨风险极高。", type: "down" },
  { text: "可以考虑低吸：铜价回踩支撑位，是多头分批建仓的良机。", type: "up" },
  { text: "市场公告：系统已对齐东方财富国际链路，确保同步延迟最低。", type: "neutral" },
  { text: "贵金属核心提示：关注全球流动性拐点及美债实际利率变化。", type: "neutral" },
  { text: "工业金属逻辑：全球制造业景气度及库存水位是定价的核心驱动力。", type: "neutral" },
  { text: "能源板块聚焦：关注全球供应链韧性及地缘局势对溢价的长期影响。", type: "neutral" },
  { text: "操作策略：严格执行止损计划，不要在宏观数据公布前盲目重仓。", type: "down" },
  { text: "宏观洞察：警惕全球货币政策转向带来的跨市场估值修正风险。", type: "down" },
  { text: "风险提示：建议关注国际政治形势的边际变化，控制整体持仓杠杆。", type: "neutral" }
];

const Ticker = ({ currentSymbol, stats }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const generatedNews = useMemo(() => {
    const news = [];
    if (!currentSymbol || !stats || stats.length === 0) {
      return [{ text: "正在接入全球行情链路，实时数据分析中...", type: "neutral" }];
    }

    const today = stats.find(s => s.label === 'TODAY (1D)')?.stats;
    const month = stats.find(s => s.label === '1 MONTH')?.stats;
    const year = stats.find(s => s.label === '1 YEAR')?.stats;

    // Sector Identification
    const isPrecious = ["AU9999", "SI00Y"].includes(currentSymbol.id);
    const isIndustrial = ["HG00Y"].includes(currentSymbol.id);
    const isEnergy = ["CL00Y"].includes(currentSymbol.id);

    // 1. Common Logic
    if (today && today.pct > 1.5) {
      news.push({ text: `及时止盈：${currentSymbol.name}今日涨幅已达${today.pct}%，建议分批止盈。`, type: "up" });
    }
    if (today && today.pct < -1.5) {
      news.push({ text: `可以考虑低吸：${currentSymbol.name}今日快速回调，关注支撑位的放量动作。`, type: "up" });
    }

    // 2. Sector-Specific Logic (EVERGREEN)
    if (isPrecious) {
      news.push({ text: "贵金属提醒：关注全球流动性拐点及美债实际利率变化。", type: "neutral" });
      if (month && month.pct > 5) {
        news.push({ text: `操作警示：${currentSymbol.name}短期超买明显，警惕避险回归后的高位震荡。`, type: "down" });
      }
    }
    if (isIndustrial) {
      news.push({ text: "工业金属逻辑：全球制造业景气度及库存水位是定价核心驱动力。", type: "neutral" });
      if (year && year.pct < -10) {
        news.push({ text: "市场周期：大宗商品进入产能收缩期，关注价格偏离中枢的修复机会。", type: "up" });
      }
    }
    if (isEnergy) {
      news.push({ text: "能源板块聚焦：关注全球供应链韧性及地缘局势对溢价的长期影响。", type: "neutral" });
      if (month && month.pct < -5) {
        news.push({ text: `周期研判：${currentSymbol.name}处于筑底确认期，关注低位布局的确定性逻辑。`, type: "up" });
      }
    }

    news.push({ text: "操作策略：严格执行止损计划，不要在数据公布前盲目重看多空。", type: "down" });
    news.push({ text: `数据监控：${currentSymbol.name} 实时报 ${currentSymbol.symbol}${currentSymbol.price}。`, type: "neutral" });

    return news.map((item, i) => ({
      ...item,
      top: `${10 + (i * 15) % 80}%`, 
      delay: `${i * -4}s`,  
      duration: `${40 + (i % 20)}s`,
      leftOffset: `${(i * 20) % 100}px`,
      maxWidth: `${280 + (i % 4) * 60}px` 
    }));
  }, [currentSymbol, stats]);

  return (
    <div className="ticker-viewport cloud-mode dynamic-height">
      <div className="cloud-container">
        {generatedNews.map((item, index) => (
          <div 
            key={`${index}-${currentSymbol?.id}`} 
            className={`ticker-capsule floating dynamic ${item.type} ${hoveredIndex === index ? 'is-hovered' : ''}`}
            style={{ 
              top: item.top, 
              animationDelay: item.delay,
              animationDuration: item.duration,
              left: `calc(105% + ${item.leftOffset})`,
              maxWidth: item.maxWidth,
              animationPlayState: hoveredIndex === index ? 'paused' : 'running'
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => setHoveredIndex(index)}
          >
             <div className="dot"></div>
             <span className="ticker-text">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ticker;
