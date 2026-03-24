import React, { useMemo, useState } from 'react';
import './Ticker.css';

const Ticker = ({ currentSymbol, stats }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const generatedNews = useMemo(() => {
    const news = [];

    if (!currentSymbol || !stats || stats.length === 0) {
      return [{ text: "正在根据量化模型评估长周期趋势...", type: "neutral" }];
    }

    const today = stats.find(s => s.label === 'TODAY (1D)')?.stats;
    const month = stats.find(s => s.label === '1 MONTH')?.stats;
    const year = stats.find(s => s.label === '1 YEAR')?.stats;

    // Sector Identification
    const isPrecious = ["AU9999", "SI00Y"].includes(currentSymbol.id);
    const isIndustrial = ["HG00Y"].includes(currentSymbol.id);
    const isEnergy = ["CL00Y"].includes(currentSymbol.id);
    const isBanking = ["BK0475"].includes(currentSymbol.id);
    const isPower = ["BK0450"].includes(currentSymbol.id);
    const isTCM = ["BK1039"].includes(currentSymbol.id);

    // 1. Common Quant Logic (Evergreen Triggers)
    if (today && today.pct > 2) {
      news.push({ text: `均值回归模型：${currentSymbol.name}单日波动已超两倍标准差，短期乖离率过高，建议执行止损保护。`, type: "up" });
    }
    if (year && year.pct < -15) {
      news.push({ text: `跨周期低吸策略：${currentSymbol.name}处于年线级别底部分位，估值具备极高长线吸引力。`, type: "up" });
    }

    // 2. Sector-Specific LONG-TERM CONCLUSIONS
    if (isPrecious) {
      news.push({ text: "贵金属定值模型：金银价格长期受全球信用货币购买力退化驱动，避险属性不可动摇。", type: "neutral" });
      news.push({ text: "套利逻辑：关注金银比历史中值偏离度，当偏离超20%时存在强力的跨品种均值修复动力。", type: "neutral" });
    }

    if (isIndustrial) {
      news.push({ text: "工业金属定价权：长期受全球基建周期及制造业PMI驱动，具有极强的宏观先行指标特征。", type: "neutral" });
      news.push({ text: "库存平衡表：由于矿端资本开支长期不足，工业金属处于长周期的供应偏紧格局。", type: "up" });
    }

    if (isEnergy) {
      news.push({ text: "能源价值内核：地缘冲突仅提供短期宽幅震荡，中长期定价核心在于全球碳中和转型的能源缺口。", type: "neutral" });
      news.push({ text: "消费韧性：原油作为全球化的‘工业血液’，其需求增速长期与全球GDP增长高度正相关。", type: "neutral" });
    }

    if (isBanking) {
      news.push({ text: "银行经营逻辑：核心逻辑在于资产质量的周期性波动，而非单纯的信贷规模增长。", type: "neutral" });
      news.push({ text: "红利防御模型：高息环境及稳定的分派能力使银行板块成为长线投资者的底层压舱石。", type: "up" });
    }

    if (isPower) {
      news.push({ text: "电力价值重估：由传统的成本加成定价转向‘绿电溢价+市场化交易’的成长型公用事业逻辑。", type: "up" });
      news.push({ text: "基本面常数：电力需求具有天然的刚性，是判断宏观经济复苏进度的最真实观测点。", type: "neutral" });
    }

    if (isTCM) {
      news.push({ text: "中药护城河模型：品牌传承及原材料稀缺性构成的天然垄断，是其穿越经济周期的核心护城河。", type: "up" });
      news.push({ text: "消费属性分析：由于具备‘自费+刚需’特征，中药板块在医药行业中对政策性集采的免疫力最高。", type: "neutral" });
    }

    // 3. Risk Framework (Stable)
    news.push({ text: "量化风控准则：不要试图预测市场，而要对价格的极端偏离制定明确的应对预案。", type: "down" });
    news.push({ text: "仓位平衡逻辑：分散投资并非盲目买入，而是利用资产间的低相关性来对冲系统性风险。", type: "neutral" });

    return news.map((item, i) => ({
      ...item,
      top: `${10 + (i * 15) % 80}%`, 
      delay: `${i * -5}s`,  
      duration: `${50 + (i % 25)}s`, // Slower, more readable for "Conclusions"
      leftOffset: `${(i * 20) % 100}px`,
      maxWidth: `${320 + (i % 4) * 80}px` 
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
