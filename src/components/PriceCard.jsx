import React, { useEffect, useState, useRef } from 'react';
import './PriceCard.css';

const PriceCard = ({ data, isActive }) => {
    const { name, price, change, changePercent, isUp } = data;
    const [flashClass, setFlashClass] = useState('');
    const prevPriceRef = useRef(price);

    useEffect(() => {
        if (prevPriceRef.current !== price) {
            // Price changed, set flash animation
            const flash = price > prevPriceRef.current ? 'flash-up' : 'flash-down';
            setFlashClass(flash);
            
            const timer = setTimeout(() => {
                setFlashClass('');
            }, 800); // match css transition duration
            
            prevPriceRef.current = price;
            return () => clearTimeout(timer);
        }
    }, [price]);

    return (
        <div className={`price-card ${isActive ? 'active' : ''} ${flashClass}`}>
            <div className="card-top">
                <span className="metal-name">{name}</span>
                <span className={`mini-change ${isUp ? 'up' : 'down'}`}>
                    {changePercent}%
                </span>
            </div>
            
            <div className="card-main">
                <span className="current-price">
                    {data.symbol || ''}{price}
                </span>
                {data.unit && <span className="unit">{data.unit}</span>}
            </div>

            {data.secondary && (
                <div className="card-bottom">
                    <span className="secondary-price">
                        {data.secondary.symbol}{data.secondary.price} {data.secondary.unit}
                    </span>
                    <span className={`secondary-change ${data.secondary.isUp ? 'up' : 'down'}`}>
                        {data.secondary.change > 0 ? '+' : ''}{data.secondary.change}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default PriceCard;
