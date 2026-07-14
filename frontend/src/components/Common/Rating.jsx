import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text, color = '#fbbf24' }) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} size={16} fill={color} stroke={color} />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<StarHalf key={i} size={16} fill={color} stroke={color} />);
    } else {
      stars.push(<Star key={i} size={16} stroke="#d1d5db" className="text-gray-300" />);
    }
  }

  return (
    <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>
      {text && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>{text}</span>}
    </div>
  );
};

export default Rating;
