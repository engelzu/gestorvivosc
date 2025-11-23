import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-lilac-100 bg-gradient-to-r from-lilac-50 to-white">
          <h3 className="text-xl font-bold text-lilac-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};