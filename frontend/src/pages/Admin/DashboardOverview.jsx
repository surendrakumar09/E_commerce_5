import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Layers, Users, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('dashboard/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div>Failed to load admin statistics.</div>;

  const { metrics, salesChart, categoryShare, recentOrders } = stats;

  // Custom SVG Bar Chart drawing parameters
  const maxRevenue = Math.max(...salesChart.map(d => d.revenue), 1000);
  const chartHeight = 200;
  const chartWidth = 500;
  const barWidth = 40;
  const barGap = 30;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '8px' }}>Dashboard Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to your e-commerce management center. Real-time sales metrics.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
      }}>
        {/* Card 1: Revenue */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Revenue</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>${metrics.totalRevenue.toFixed(2)}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Orders</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>{metrics.totalOrders}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: '50%', color: 'var(--secondary)' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        {/* Card 3: Products */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Products</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>{metrics.totalProducts}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Card 4: Customers */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Customers</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>{metrics.totalCustomers}</h3>
          </div>
          <div style={{ backgroundColor: 'var(--secondary-light)', padding: '12px', borderRadius: '50%', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Charts split */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Sales Chart (Custom SVG bar chart) */}
        <div className="glass-card" style={{ flex: '2 1 500px', padding: '30px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Monthly Revenue Overview</h3>
          <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <svg width={chartWidth} height={chartHeight + 40} style={{ overflow: 'visible' }}>
              {/* Draw grids & bars */}
              {salesChart.map((d, index) => {
                const barHeight = (d.revenue / maxRevenue) * chartHeight;
                const x = index * (barWidth + barGap) + 40;
                const y = chartHeight - barHeight + 10;
                return (
                  <g key={index}>
                    {/* Hover text value */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      style={{ fontSize: '0.75rem', fill: 'var(--text-secondary)', fontWeight: 600 }}
                    >
                      ${d.revenue.toFixed(0)}
                    </text>
                    
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill="url(#barGradient)"
                      style={{ transition: 'all 0.5s ease' }}
                    />
                    
                    {/* X axis Label */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 25}
                      textAnchor="middle"
                      style={{ fontSize: '0.85rem', fill: 'var(--text-muted)' }}
                    >
                      {d.label}
                    </text>
                  </g>
                );
              })}

              {/* Define gradients */}
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Category Share listings */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '30px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Inventory Category Share</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryShare.map((cat, index) => {
              const maxVal = Math.max(...categoryShare.map(c => c.value), 1);
              const percentage = (cat.value / maxVal) * 100;
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.value} items</span>
                  </div>
                  {/* Progress bar indicator */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                      borderRadius: '100px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>Recent Orders</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Order ID</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Customer</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Grand Total</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 0', fontWeight: 600, fontFamily: 'monospace' }}>{order.order_number}</td>
                <td style={{ padding: '14px 0' }}>{order.customer}</td>
                <td style={{ padding: '14px 0' }}>{order.created_at}</td>
                <td style={{ padding: '14px 0', fontWeight: 700 }}>${order.grand_total.toFixed(2)}</td>
                <td style={{ padding: '14px 0' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: order.status === 'delivered' ? 'var(--success-light)' : 'var(--primary-light)',
                    color: order.status === 'delivered' ? 'var(--success)' : 'var(--primary)',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    textTransform: 'uppercase'
                  }}>{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DashboardOverview;
