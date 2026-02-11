import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './PriceCard.css';

const PriceCard = ({ data }) => {
    const { name, price, change, changePercent, isUp } = data;

    return (
        <div className="price-card">
            <div className="card-header">
                <h2 className="metal-name">{name}</h2>
                {isUp ?
                    <TrendingUp className="trend-icon up" /> :
                    <TrendingDown className="trend-icon down" />
                }
            </div>
            <div className="price-container">
                <span className="current-price">
                    {data.symbol || '$'}{price}
                    {data.unit && <span className="unit">{data.unit}</span>}
                </span>
            </div>
            {data.secondary && (
                <div className="secondary-price-container">
                    <span>{data.secondary.symbol}{data.secondary.price} {data.secondary.unit}</span>
                    <span className={data.secondary.isUp ? 'change-container up' : 'change-container down'} style={{ fontSize: '0.9em' }}>
                        {data.secondary.change > 0 ? '+' : ''}{data.secondary.change}%
                    </span>
                </div>
            )}
            <div className={`change-container ${isUp ? 'up' : 'down'}`}>
                <span className="change-value">{change > 0 ? '+' : ''}{change}</span>
                <span className="change-percent">({changePercent}%)</span>
            </div>
        </div>
    );
};

export default PriceCard;
