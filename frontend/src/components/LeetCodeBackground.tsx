import React from 'react';
import './LeetCodeBackground.css';

export const LeetCodeBackground: React.FC = () => {
  return (
    <div className="leetcode-background">
      {/* Animated gradient background */}
      <div className="gradient-bg"></div>
      
      {/* Floating code symbols */}
      <div className="code-symbols">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`symbol symbol-${i % 5}`} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}>
            {['</', '{ }', '( )', '[ ]', '=>'][i % 5]}
          </div>
        ))}
      </div>
      
      {/* Grid overlay */}
      <div className="grid-overlay"></div>
      
      {/* Accent circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>
    </div>
  );
};
