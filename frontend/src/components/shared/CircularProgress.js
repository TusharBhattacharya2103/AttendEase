import React from 'react';

export default function CircularProgress({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  label = '',
  sublabel = '',
  color,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  let progressColor = color;
  if (!progressColor) {
    if (percentage >= 75) progressColor = '#4ade80';
    else if (percentage >= 50) progressColor = '#fbbf24';
    else progressColor = '#f87171';
  }

  const trackColor = 'rgba(255,255,255,0.06)';

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          opacity={0.08}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        />
      </svg>
      <div className="circular-progress-text">
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: size > 100 ? '22px' : '16px',
          fontWeight: '700',
          color: progressColor,
          lineHeight: 1,
        }}>
          {percentage}%
        </div>
        {label && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: '500' }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
