import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, CrosshairMode } from 'lightweight-charts';

const ChartComponent = ({ data, colors = {}, symbolName = '' }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chart.applyOptions({ 
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight
      });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.backgroundColor || 'transparent' },
        textColor: '#8c8c9a',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)', style: 1 },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)', style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.3)',
            style: 1, // Dashed
            labelBackgroundColor: '#2b2b36',
        },
        horzLine: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.3)',
            style: 1, // Dashed
            labelBackgroundColor: '#2b2b36',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      watermark: {
        color: 'rgba(255, 255, 255, 0.03)',
        visible: !!symbolName,
        text: symbolName,
        fontSize: 100,
        fontFamily: "'Outfit', sans-serif",
        horzAlign: 'center',
        vertAlign: 'center',
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400, // use container height or fallback
    });

    const newSeries = chart.addSeries(CandlestickSeries, {
      // Chinese standard: Red up, Green down
      upColor: '#ef5350', 
      downColor: '#26a69a', 
      borderVisible: false, 
      wickUpColor: '#ef5350', 
      wickDownColor: '#26a69a',
    });

    newSeries.setData(data);
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);
    
    // Initial resize to fit flex container
    const resizeObserver = new ResizeObserver(entries => {
        if (entries.length === 0 || entries[0].target !== chartContainerRef.current) { return; }
        const newRect = entries[0].contentRect;
        chart.applyOptions({ height: newRect.height, width: newRect.width });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, colors, symbolName]);

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />;
};

export default ChartComponent;
