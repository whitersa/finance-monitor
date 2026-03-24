import React, { useMemo } from 'react';
import { ShieldAlert, TrendingUp, Zap, Skull, ShoppingCart, Cpu } from 'lucide-react';
import './MacroSentiment.css';

const MacroSentiment = ({ prices }) => {
  const sentiment = useMemo(() => {
    if (!prices || prices.length === 0) return null;

    const findPrice = (id) => prices.find(p => p.id === id);
    
    const gold = findPrice('AU9999');
    const oil = findPrice('CL00Y');
    const copper = findPrice('HG00Y');
    const bank = findPrice('BK0475');
    const power = findPrice('BK0450');
    const medical = findPrice('BK1039');

    const indicators = [];

    // 1. War / Geopolitical Risk
    if (gold?.changePercent > 0.5 && oil?.changePercent > 1.0) {
      indicators.push({
        id: 'war',
        label: '地缘战争风险',
        status: 'HIGH',
        icon: <Skull size={20} />,
        desc: '金油双涨，避险与能源溢价同步走高，地缘局势显著恶化。',
        color: '#f87171'
      });
    }

    // 2. Inflation / Stagflation
    if ((copper?.changePercent > 1.0 || oil?.changePercent > 1.0) && bank?.changePercent < -0.5) {
      indicators.push({
        id: 'inflation',
        label: '通胀/滞胀压力',
        status: 'WARNING',
        icon: <ShieldAlert size={20} />,
        desc: '原材料成本激增而金融信心受阻，全社会成本端压力正在积聚。',
        color: '#fbbf24'
      });
    }

    // 3. Industrial Recovery
    if (copper?.changePercent > 0.5 && power?.changePercent > 0.5) {
      indicators.push({
        id: 'recovery',
        label: '工业/消费回暖',
        status: 'ACTIVE',
        icon: <Zap size={20} />,
        desc: '铜电联动走强，显示实体制造订单与全社会用电负荷同步回升。',
        color: '#34d399'
      });
    }

    // 4. Defensive Market (Stock Rotation)
    if (medical?.changePercent > 0.8 && bank?.changePercent > 0.5) {
        indicators.push({
          id: 'defensive',
          label: '避险防御思维',
          status: 'DOMINANT',
          icon: <ShoppingCart size={20} />,
          desc: '资金扎堆医药与银行，显示市场对未来数月增长预期持保守态度。',
          color: '#60a5fa'
        });
    }

    // Default "Neutral/Observing" if no strong signals
    if (indicators.length === 0) {
      indicators.push({
        id: 'neutral',
        label: '宏观动态均衡',
        status: 'STABLE',
        icon: <Activity size={20} />,
        desc: '跨资产关联度处于常规水平，全社会经济动能维持低波动运行。',
        color: '#888'
      });
    }

    return indicators;
  }, [prices]);

  if (!sentiment) return null;

  return (
    <div className="macro-sentiment-container">
      <div className="sentiment-grid">
        {sentiment.map(item => (
          <div key={item.id} className="sentiment-card" style={{ '--accent': item.color }}>
            <div className="card-top">
              <div className="tag" style={{ background: item.color }}>{item.status}</div>
              {item.icon}
            </div>
            <h3 className="card-label">{item.label}</h3>
            <p className="card-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Activity = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default MacroSentiment;
