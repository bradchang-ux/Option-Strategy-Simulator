import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { blackScholesCall } from './utils/blackScholes';

const App = () => {
    // -------------------------------------------------------------------------
    // 1. CONFIGURATION & STATE
    // -------------------------------------------------------------------------

    const DEFAULT_CONFIG = {
        CURRENT_PRICE: 340,   // Starting stock price
        TARGET_PRICE: 360,    // Target stock price for simulation
        RISK_FREE_RATE: 0.045, // 4.5% annual risk-free rate
        DAYS_TO_EXPIRY: 365,   // Days until option expiration (Default 365 for LEAPS view)
    };

    const DEFAULT_OPTIONS = [
        { id: 1, type: "Deep ITM Call", strike: 270, ask: 126.75, iv: 0.6845, target_iv: "", delta: 0.7745, gamma: 0.0013, theta: -0.1102 },
        { id: 2, type: "ATM Call", strike: 340, ask: 98.77, iv: 0.6737, target_iv: "", delta: 0.6608, gamma: 0.0016, theta: -0.1288 },
        { id: 3, type: "Deep OTM Call", strike: 420, ask: 71.70, iv: 0.6736, target_iv: "", delta: 0.5409, gamma: 0.0017, theta: -0.137 }
    ];

    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const [groupedResults, setGroupedResults] = useState([]); // Changed from 'results' to 'groupedResults'
    const [chartData, setChartData] = useState([]);
    const [isIvCrush, setIsIvCrush] = useState(false);

    // Ensure options are always processed and displayed in Strike Price order (Low to High: ITM -> OTM)
    const sortedOptions = useMemo(() => {
        const sorted = [...options].sort((a, b) => a.strike - b.strike);
        console.log("Sorted Options:", sorted.map(o => `${o.type} (${o.strike})`));
        return sorted;
    }, [options]);

    // -------------------------------------------------------------------------
    // 2. SIMULATION LOGIC (Black-Scholes)
    // -------------------------------------------------------------------------

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleOptionChange = (id, field, value) => {
        setOptions(prev => prev.map(opt =>
            opt.id === id ? { ...opt, [field]: value === "" ? "" : parseFloat(value) } : opt
        ));
    };

    // Helper to calculate current cost based on live params (optional usage for UI)
    const getCurrentCost = (k, iv) => {
        return blackScholesCall(
            parseFloat(config.CURRENT_PRICE),
            k,
            config.DAYS_TO_EXPIRY / 365.0,
            parseFloat(config.RISK_FREE_RATE),
            iv
        ).toFixed(2);
    };

    // Main Simulation Effect
    useEffect(() => {
        const calculateProjections = () => {
            const chartPoints = [];

            // Check for IV Crush: any option with Target IV significantly lower than Current IV
            const crushDetected = sortedOptions.some(opt => opt.target_iv && opt.target_iv < opt.iv - 0.1);
            setIsIvCrush(crushDetected);

            // Scenarios: Price hits Target Price at Day 30, 60, ..., 360
            const scenarios = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
                .filter(day => day <= config.DAYS_TO_EXPIRY);
            const groupedData = [];

            scenarios.forEach(day => {
                const daysRemaining = Math.max(config.DAYS_TO_EXPIRY - day, 0);
                const yearsRemaining = Math.max(daysRemaining / 365.0, 0.0001);

                // Assumption: Price hits Target Price at this day
                const simulatedPrice = config.TARGET_PRICE;

                const chartPoint = { name: `Day ${day}`, price: simulatedPrice };



                // Group data for this day
                const dayResult = {
                    day: `Day ${day}`,
                    details: []
                };

                sortedOptions.forEach(opt => {
                    const targetIv = opt.target_iv || opt.iv;

                    const estPrice = blackScholesCall(
                        simulatedPrice,
                        opt.strike,
                        yearsRemaining,
                        config.RISK_FREE_RATE,
                        targetIv
                    );

                    const cost = opt.ask;
                    const profit = estPrice - cost;
                    const roi = cost > 0 ? (profit / cost) * 100 : 0;


                    chartPoint[`${opt.type} ($${opt.strike})`] = roi.toFixed(2);

                    dayResult.details.push({
                        type: opt.type,
                        strike: opt.strike,
                        roi: roi.toFixed(2),
                        profit: profit.toFixed(2)
                    });
                });

                chartPoints.push(chartPoint);
                groupedData.push(dayResult);
            });

            setChartData(chartPoints);
            setGroupedResults(groupedData);
        };

        calculateProjections();
    }, [config, sortedOptions]); // Recalculate anytime config or options change

    // -------------------------------------------------------------------------
    // 3. RENDER UI
    // -------------------------------------------------------------------------

    return (
        <div className="app-container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2rem', background: 'linear-gradient(to right, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    <Activity /> Option Strategy Simulator
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Black-Scholes Model & IV Variation Analysis</p>
            </header>

            <div className="main-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Top Section: Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem' }}>

                    {/* Simulation Parameters */}
                    <div className="glass-panel">
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} /> Parameters
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Current Price ($)</label>
                                <input
                                    type="number"
                                    name="CURRENT_PRICE"
                                    value={config.CURRENT_PRICE}
                                    onChange={handleConfigChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Price ($)</label>
                                <input
                                    type="number"
                                    name="TARGET_PRICE"
                                    value={config.TARGET_PRICE}
                                    onChange={handleConfigChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Risk Free Rate</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="RISK_FREE_RATE"
                                    value={config.RISK_FREE_RATE}
                                    onChange={handleConfigChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Days to Expiry</label>
                                <input
                                    type="number"
                                    name="DAYS_TO_EXPIRY"
                                    value={config.DAYS_TO_EXPIRY}
                                    onChange={handleConfigChange}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Option Contracts */}
                    <div className="glass-panel">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DollarSign size={20} /> Option Contracts
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {sortedOptions.map((opt) => (
                                <div key={opt.id} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '1rem'
                                }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-secondary)', fontSize: '1rem' }}>{opt.type}</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Strike</label>
                                            <input type="number" value={opt.strike} onChange={(e) => handleOptionChange(opt.id, 'strike', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Ask</label>
                                            <input type="number" value={opt.ask} onChange={(e) => handleOptionChange(opt.id, 'ask', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>IV</label>
                                            <input type="number" step="0.01" value={opt.iv} onChange={(e) => handleOptionChange(opt.id, 'iv', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Target IV</label>
                                            <input type="number" step="0.01" placeholder={opt.iv} value={opt.target_iv} onChange={(e) => handleOptionChange(opt.id, 'target_iv', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem', borderColor: opt.target_iv && opt.target_iv < opt.iv - 0.1 ? '#ef4444' : '' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Delta</label>
                                            <input type="number" step="0.01" value={opt.delta} onChange={(e) => handleOptionChange(opt.id, 'delta', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Gamma</label>
                                            <input type="number" step="0.001" value={opt.gamma} onChange={(e) => handleOptionChange(opt.id, 'gamma', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Theta</label>
                                            <input type="number" step="0.01" value={opt.theta} onChange={(e) => handleOptionChange(opt.id, 'theta', e.target.value)} className="form-input" style={{ padding: '0.3rem', fontSize: '0.9rem' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Chart Section */}
                    <div className="glass-panel" style={{ height: '400px' }}>
                        <h3 style={{ marginBottom: '1rem' }}>ROI Projection (Price Hits Target @ Day X)</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e222d', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend payload={sortedOptions.map((opt, i) => ({
                                    value: `${opt.type} ($${opt.strike})`,
                                    type: 'square',
                                    id: opt.id,
                                    color: ['#10b981', '#38bdf8', '#ef4444'][i % 3]
                                }))} />
                                {sortedOptions.map((opt, i) => (
                                    <Area
                                        key={opt.id}
                                        type="monotone"
                                        dataKey={`${opt.type} ($${opt.strike})`}
                                        name={`${opt.type} ($${opt.strike})`}
                                        stroke={['#10b981', '#38bdf8', '#ef4444'][i % 3]}
                                        fillOpacity={0.1}
                                        fill={['#10b981', '#38bdf8', '#ef4444'][i % 3]}
                                        strokeWidth={2}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table Section */}
                    <div className="glass-panel">
                        <h3 style={{ marginBottom: '1rem' }}>Detailed Analysis</h3>
                        <table className="custom-table" style={{ fontSize: '0.9rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '150px' }}>Scenario</th>
                                    {sortedOptions.map(opt => (
                                        <th key={opt.id} style={{ textAlign: 'center' }}>
                                            {opt.type} <br />
                                            <span style={{ fontSize: '0.8em', opacity: 0.7 }}>Strike: ${opt.strike}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupedResults.map((row, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 'bold' }}>{row.day}</td>
                                        {row.details.map((detail, idx) => (
                                            <td key={idx} style={{ textAlign: 'center' }}>
                                                <div className={parseFloat(detail.roi) >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 'bold', fontSize: '1.1em' }} >
                                                    {detail.roi}%
                                                </div>
                                                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                                                    {parseFloat(detail.profit) >= 0 ? '+' : ''}{detail.profit}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Analyst Warnings */}
                    {isIvCrush && (
                        <div className="glass-panel warning-box">
                            <AlertTriangle size={24} />
                            <div>
                                <strong>Warning: High Volatility Crush Detected</strong>
                                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
                                    Target IV is significantly lower than Current IV.
                                    This simulation accounts for IV Drop, which may reduce OTM option value even if price rises.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default App;
