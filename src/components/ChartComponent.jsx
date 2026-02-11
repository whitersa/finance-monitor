import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';

const ChartComponent = ({ data, colors = {} }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor || '#1e1e1e' },
        textColor: colors.textColor || '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
    });

    chart.timeScale().fitContent();

    const newSeries = chart.addSeries(CandlestickSeries, {
      // Wait, Chinese markets usually: Red = Up, Green = Down.
      // SGE is correct to follow this?
      // Let's use standard Green/Red but be mindful. 
      // Actually standard crypto/western: Green Up, Red Down.
      // Chinese: Red Up, Green Down.
      // Let's stick to Green Up for now unless specified, or customizable.
      // Actually, let's use colors that match the app theme or standard financial colors.
      upColor: '#26a69a', 
      downColor: '#ef5350', 
      borderVisible: false, 
      wickUpColor: '#26a69a', 
      wickDownColor: '#ef5350',
    });

    newSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, colors]);

  return <div ref={chartContainerRef} style={{ width: '100%' }} />;
};

export default ChartComponent;
